package com.obscura.mobile.domain.usecases

import com.obscura.mobile.data.inco.IncoRepository
import com.obscura.mobile.data.wallet.WalletRepository
import com.obscura.mobile.domain.models.DecryptResult

class DecryptHandleUseCase(
    private val incoRepository: IncoRepository,
    private val walletRepository: WalletRepository
) {
    suspend operator fun invoke(handles: List<String>): Result<DecryptResult> {
        val address = walletRepository.getPublicKeyBase58()
            ?: return Result.failure(Exception("Wallet not connected"))

        val message = incoRepository.buildDecryptRequestMessage(handles, address)

        // In a real implementation, this would use MWA signMessagesDetached
        // For now we return a placeholder — the wallet signing happens in the UI layer
        // via ActivityResultSender which requires an Activity context
        return Result.failure(Exception("Decrypt requires Activity context for MWA signing"))
    }
}
