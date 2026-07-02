package com.obscura.mobile.domain.usecases

import com.obscura.mobile.data.inco.IncoRepository
import com.obscura.mobile.data.solana.SolanaRepository
import com.obscura.mobile.data.wallet.WalletRepository
import com.solana.publickey.SolanaPublicKey

class SendPrivateTransferUseCase(
    private val incoRepository: IncoRepository,
    private val solanaRepository: SolanaRepository,
    private val walletRepository: WalletRepository
) {
    suspend operator fun invoke(
        toAddress: String,
        amount: String
    ): Result<String> {
        val publicKey = walletRepository.getPublicKey()
            ?: return Result.failure(Exception("Wallet not connected"))

        // 1. Encrypt amount via Inco covalidator
        val encryptedResult = incoRepository.encryptValue(amount)
        val encrypted = encryptedResult.getOrElse {
            return Result.failure(it)
        }

        // 2. Build transfer instruction
        val toKey = SolanaPublicKey.from(toAddress)
        val encryptedBytes = encrypted.ciphertext.chunked(2)
            .map { it.toInt(16).toByte() }
            .toByteArray()

        val transferIx = solanaRepository.buildTransferInstruction(
            to = toKey,
            encryptedAmount = encryptedBytes,
            authority = SolanaPublicKey.from(publicKey)
        )

        // 3. Get blockhash
        val blockhash = solanaRepository.getLatestBlockhash().getOrElse {
            return Result.failure(it)
        }

        // 4. Build transaction
        val tx = solanaRepository.buildTransaction(
            instructions = listOf(transferIx),
            blockhash = blockhash,
            feePayer = SolanaPublicKey.from(publicKey)
        )

        // 5. Serialize — actual signing happens via MWA in the UI layer
        // The serialized transaction is returned for MWA signAndSendTransactions
        return Result.success(tx.serialize().joinToString(",") { it.toString() })
    }
}
