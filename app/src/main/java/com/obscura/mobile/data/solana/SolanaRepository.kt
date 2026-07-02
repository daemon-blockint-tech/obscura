package com.obscura.mobile.data.solana

import com.obscura.mobile.BuildConfig
import com.obscura.mobile.domain.models.TokenAccount
import com.solana.networking.KtorNetworkDriver
import com.solana.publickey.ProgramDerivedAddress
import com.solana.publickey.SolanaPublicKey
import com.solana.rpc.SolanaRpcClient
import com.solana.transaction.AccountMeta
import com.solana.transaction.Message
import com.solana.transaction.Transaction
import com.solana.transaction.TransactionInstruction
import kotlinx.serialization.Serializable

interface SolanaRepository {
    suspend fun getLatestBlockhash(): Result<String>
    suspend fun fetchTokenAccount(mint: String, owner: String): Result<TokenAccount?>
    fun deriveTokenAccountPda(mint: String, owner: String): SolanaPublicKey
    fun buildTransferInstruction(
        to: SolanaPublicKey,
        encryptedAmount: ByteArray,
        authority: SolanaPublicKey
    ): TransactionInstruction
    fun buildMintInstruction(
        mint: SolanaPublicKey,
        tokenAccount: SolanaPublicKey,
        authority: SolanaPublicKey,
        encryptedAmount: ByteArray
    ): TransactionInstruction
    fun buildVerifyDecryptionInstruction(
        handleCount: Int,
        handleBuffers: List<ByteArray>,
        plaintextBuffers: List<ByteArray>,
        authority: SolanaPublicKey
    ): TransactionInstruction
    fun buildTransaction(instructions: List<TransactionInstruction>, blockhash: String, feePayer: SolanaPublicKey): Transaction
}

class SolanaRepositoryImpl(
    rpcUrl: String
) : SolanaRepository {

    private val rpcClient = SolanaRpcClient(rpcUrl, KtorNetworkDriver())

    private val obscuraProgramId = SolanaPublicKey.from(BuildConfig.OSCURA_PROGRAM_ID.ifEmpty { "11111111111111111111111111111111" })
    private val incoLightningProgramId = SolanaPublicKey.from(BuildConfig.INCO_LIGHTNING_PROGRAM_ID.ifEmpty { "11111111111111111111111111111111" })
    private val systemProgram = SolanaPublicKey.from("11111111111111111111111111111111")

    override suspend fun getLatestBlockhash(): Result<String> = runCatching {
        val response = rpcClient.getLatestBlockhash()
        response.result?.blockhash ?: throw Exception("Failed to get blockhash")
    }

    override suspend fun fetchTokenAccount(mint: String, owner: String): Result<TokenAccount?> = runCatching {
        val mintKey = SolanaPublicKey.from(mint)
        val ownerKey = SolanaPublicKey.from(owner)
        val pda = deriveTokenAccountPda(mint, owner)

        val accountInfo = rpcClient.getAccountInfo(pda.base58())
        val data = accountInfo.result?.value?.data ?: return@runCatching null

        // Parse account data — format depends on program implementation
        // The encrypted balance handle is stored as a u128 in the account
        val rawBytes = data.let {
            // Account data comes as base64 or base58 depending on encoding
            // This is a simplified parser — real implementation needs proper decoding
            null
        }
        null
    }

    override fun deriveTokenAccountPda(mint: String, owner: String): SolanaPublicKey {
        val mintKey = SolanaPublicKey.from(mint)
        val ownerKey = SolanaPublicKey.from(owner)
        val seeds = listOf(
            "token_account".encodeToByteArray(),
            mintKey.toBytes(),
            ownerKey.toBytes()
        )
        return ProgramDerivedAddress.find(seeds, obscuraProgramId).getOrNull()
            ?: throw Exception("Failed to derive PDA")
    }

    override fun buildTransferInstruction(
        to: SolanaPublicKey,
        encryptedAmount: ByteArray,
        authority: SolanaPublicKey
    ): TransactionInstruction {
        // Anchor discriminator for "transfer" instruction
        val discriminator = byteArrayOf(0xab, 0xad, 0xc0, 0xde, 0x12, 0x34, 0x56, 0x78)
        val ixData = discriminator + to.toBytes() + encryptedAmount

        return TransactionInstruction(
            obscuraProgramId,
            listOf(
                AccountMeta(authority, true, true),
                AccountMeta(to, false, true),
                AccountMeta(incoLightningProgramId, false, false)
            ),
            ixData
        )
    }

    override fun buildMintInstruction(
        mint: SolanaPublicKey,
        tokenAccount: SolanaPublicKey,
        authority: SolanaPublicKey,
        encryptedAmount: ByteArray
    ): TransactionInstruction {
        val discriminator = byteArrayOf(0xab, 0xad, 0xc0, 0xde, 0x34, 0x56, 0x78, 0x9a)
        val ixData = discriminator + encryptedAmount

        return TransactionInstruction(
            obscuraProgramId,
            listOf(
                AccountMeta(mint, false, true),
                AccountMeta(tokenAccount, false, true),
                AccountMeta(authority, true, true),
                AccountMeta(incoLightningProgramId, false, false),
                AccountMeta(systemProgram, false, false)
            ),
            ixData
        )
    }

    override fun buildVerifyDecryptionInstruction(
        handleCount: Int,
        handleBuffers: List<ByteArray>,
        plaintextBuffers: List<ByteArray>,
        authority: SolanaPublicKey
    ): TransactionInstruction {
        val discriminator = byteArrayOf(0xab, 0xad, 0xc0, 0xde, 0x9a, 0xbc, 0xde, 0xf0)
        val countBytes = handleCount.toByte()
        val ixData = discriminator + byteArrayOf(countBytes) +
            handleBuffers.fold(ByteArray(0)) { acc, b -> acc + b } +
            plaintextBuffers.fold(ByteArray(0)) { acc, b -> acc + b }

        return TransactionInstruction(
            obscuraProgramId,
            listOf(
                AccountMeta(authority, true, true),
                AccountMeta(SolanaPublicKey.from("Sysvar1nstructions1111111111111111111111111"), false, false)
            ),
            ixData
        )
    }

    override fun buildTransaction(
        instructions: List<TransactionInstruction>,
        blockhash: String,
        feePayer: SolanaPublicKey
    ): Transaction {
        val builder = Message.Builder()
        instructions.forEach { builder.addInstruction(it) }
        builder.setRecentBlockhash(blockhash)
        val message = builder.build()
        return Transaction(message)
    }
}
