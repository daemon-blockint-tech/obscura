package com.obscura.mobile.data.inco

import com.obscura.mobile.domain.models.DecryptResult
import com.obscura.mobile.domain.models.EncryptedValue

interface IncoRepository {
    suspend fun encryptValue(value: String, type: String = "uint256"): Result<EncryptedValue>
    suspend fun decryptHandles(
        handles: List<String>,
        address: String,
        signature: ByteArray
    ): Result<DecryptResult>
    fun buildDecryptRequestMessage(handles: List<String>, address: String): ByteArray
}

class IncoRepositoryImpl(
    private val api: IncoApiService
) : IncoRepository {

    override suspend fun encryptValue(value: String, type: String): Result<EncryptedValue> = runCatching {
        val response = api.encryptValue(EncryptRequest(value, type))
        EncryptedValue(ciphertext = response.ciphertext)
    }

    override suspend fun decryptHandles(
        handles: List<String>,
        address: String,
        signature: ByteArray
    ): Result<DecryptResult> = runCatching {
        require(handles.isNotEmpty()) { "No handles provided for decryption" }
        require(handles.size <= 10) { "Maximum 10 handles per transaction" }

        val sigHex = signature.joinToString("") { "%02x".format(it) }
        val response = api.decryptHandles(
            DecryptRequest(handles, address, sigHex)
        )
        DecryptResult(
            plaintexts = response.plaintexts,
            handles = response.handles,
            signatures = response.signatures
        )
    }

    override fun buildDecryptRequestMessage(handles: List<String>, address: String): ByteArray {
        val payload = handles.joinToString(",") + ":" + address
        return payload.toByteArray(Charsets.UTF_8)
    }
}
