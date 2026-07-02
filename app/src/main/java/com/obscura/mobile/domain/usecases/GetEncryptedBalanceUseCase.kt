package com.obscura.mobile.domain.usecases

import com.obscura.mobile.data.inco.IncoRepository
import com.obscura.mobile.data.solana.SolanaRepository
import com.obscura.mobile.data.wallet.WalletRepository

class GetEncryptedBalanceUseCase(
    private val solanaRepository: SolanaRepository,
    private val incoRepository: IncoRepository,
    private val walletRepository: WalletRepository
) {
    suspend operator fun invoke(mint: String): Result<String> {
        val ownerBase58 = walletRepository.getPublicKeyBase58()
            ?: return Result.failure(Exception("Wallet not connected"))

        // 1. Fetch on-chain token account, extract encrypted balance handle
        val accountResult = solanaRepository.fetchTokenAccount(mint, ownerBase58)
        val account = accountResult.getOrElse { return Result.failure(it) }
            ?: return Result.failure(Exception("Token account not found"))

        val balanceHandle = account.encryptedBalanceHandle

        // 2. Build decrypt request message
        val message = incoRepository.buildDecryptRequestMessage(
            listOf(balanceHandle),
            ownerBase58
        )

        // 3. Actual signing via MWA happens in UI layer (requires Activity context)
        // Return the handle for the UI to initiate signing
        return Result.success(balanceHandle)
    }
}
