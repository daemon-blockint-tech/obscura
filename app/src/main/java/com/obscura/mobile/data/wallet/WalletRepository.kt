package com.obscura.mobile.data.wallet

import android.net.Uri
import com.solana.mobilewalletadapter.clientlib.ActivityResultSender
import com.solana.mobilewalletadapter.clientlib.ConnectionIdentity
import com.solana.mobilewalletadapter.clientlib.MobileWalletAdapter
import com.solana.mobilewalletadapter.clientlib.TransactionResult
import com.funkatronics.encoders.Base58

sealed class WalletState {
    data object Disconnected : WalletState()
    data object NoWallet : WalletState()
    data class Connected(
        val publicKey: ByteArray,
        val publicKeyBase58: String,
        val authToken: String
    ) : WalletState()
    data class Error(val message: String) : WalletState()
}

interface WalletRepository {
    val walletAdapter: MobileWalletAdapter?
    fun initialize()
    suspend fun connect(sender: ActivityResultSender): WalletState
    suspend fun disconnect(sender: ActivityResultSender): WalletState
    suspend fun signAndSendTransactions(
        sender: ActivityResultSender,
        transactions: Array<ByteArray>
    ): Result<List<String>>
    suspend fun signMessages(
        sender: ActivityResultSender,
        messages: Array<ByteArray>
    ): Result<List<ByteArray>>
    fun getPublicKey(): ByteArray?
    fun getPublicKeyBase58(): String?
}

class WalletRepositoryImpl : WalletRepository {

    private var adapter: MobileWalletAdapter? = null
    private var publicKey: ByteArray? = null
    private var authToken: String? = null

    override val walletAdapter: MobileWalletAdapter? get() = adapter

    override fun initialize() {
        if (adapter == null) {
            adapter = MobileWalletAdapter(
                connectionIdentity = ConnectionIdentity(
                    identityUri = Uri.parse("https://obscura.app"),
                    iconUri = Uri.parse("favicon.ico"),
                    identityName = "Obscura"
                )
            )
        }
    }

    override suspend fun connect(sender: ActivityResultSender): WalletState {
        initialize()
        val wa = adapter ?: return WalletState.Error("Wallet adapter not initialized")

        return try {
            val result = wa.connect(sender)
            when (result) {
                is TransactionResult.Success -> {
                    val account = result.authResult.accounts.first()
                    publicKey = account.publicKey
                    authToken = result.authResult.authToken
                    WalletState.Connected(
                        publicKey = account.publicKey,
                        publicKeyBase58 = Base58.encodeToString(account.publicKey),
                        authToken = result.authResult.authToken
                    )
                }
                is TransactionResult.NoWalletFound -> WalletState.NoWallet
                is TransactionResult.Failure -> WalletState.Error(result.e.message ?: "Connection failed")
            }
        } catch (e: Exception) {
            WalletState.Error(e.message ?: "Connection error")
        }
    }

    override suspend fun disconnect(sender: ActivityResultSender): WalletState {
        val wa = adapter ?: return WalletState.Disconnected

        return try {
            val result = wa.disconnect(sender)
            publicKey = null
            authToken = null
            when (result) {
                is TransactionResult.Success -> WalletState.Disconnected
                is TransactionResult.NoWalletFound -> WalletState.NoWallet
                is TransactionResult.Failure -> WalletState.Error(result.e.message ?: "Disconnect failed")
            }
        } catch (e: Exception) {
            WalletState.Error(e.message ?: "Disconnect error")
        }
    }

    override suspend fun signAndSendTransactions(
        sender: ActivityResultSender,
        transactions: Array<ByteArray>
    ): Result<List<String>> {
        val wa = adapter ?: return Result.failure(Exception("Wallet not initialized"))

        return try {
            val result = wa.transact(sender) {
                signAndSendTransactions(transactions)
            }
            when (result) {
                is TransactionResult.Success -> {
                    val signatures = result.successPayload?.signatures?.map {
                        Base58.encodeToString(it)
                    } ?: emptyList()
                    Result.success(signatures)
                }
                is TransactionResult.NoWalletFound -> Result.failure(Exception("No wallet found"))
                is TransactionResult.Failure -> Result.failure(result.e)
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun signMessages(
        sender: ActivityResultSender,
        messages: Array<ByteArray>
    ): Result<List<ByteArray>> {
        val wa = adapter ?: return Result.failure(Exception("Wallet not initialized"))
        val pk = publicKey ?: return Result.failure(Exception("No public key"))

        return try {
            val result = wa.transact(sender) {
                signMessagesDetached(messages, arrayOf(pk))
            }
            when (result) {
                is TransactionResult.Success -> {
                    val sigs = result.successPayload?.messages?.map { msg ->
                        msg.signatures.first()
                    } ?: emptyList()
                    Result.success(sigs)
                }
                is TransactionResult.NoWalletFound -> Result.failure(Exception("No wallet found"))
                is TransactionResult.Failure -> Result.failure(result.e)
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override fun getPublicKey(): ByteArray? = publicKey

    override fun getPublicKeyBase58(): String? {
        val pk = publicKey ?: return null
        return Base58.encodeToString(pk)
    }
}
