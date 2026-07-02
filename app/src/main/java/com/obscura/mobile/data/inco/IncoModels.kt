package com.obscura.mobile.data.inco

import kotlinx.serialization.Serializable

@Serializable
data class EncryptRequest(
    val value: String,
    val type: String
)

@Serializable
data class EncryptResponse(
    val ciphertext: String
)

@Serializable
data class DecryptRequest(
    val handles: List<String>,
    val address: String,
    val signature: String
)

@Serializable
data class DecryptResponse(
    val plaintexts: List<String>,
    val handles: List<String>,
    val signatures: List<String>
)
