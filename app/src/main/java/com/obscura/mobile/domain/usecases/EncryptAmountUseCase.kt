package com.obscura.mobile.domain.usecases

import com.obscura.mobile.data.inco.IncoRepository
import com.obscura.mobile.domain.models.EncryptedValue

class EncryptAmountUseCase(
    private val incoRepository: IncoRepository
) {
    suspend operator fun invoke(amount: String): Result<EncryptedValue> =
        incoRepository.encryptValue(amount)
}
