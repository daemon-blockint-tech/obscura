package com.obscura.mobile.domain.models

data class EncryptedValue(
    val ciphertext: String
)

data class DecryptResult(
    val plaintexts: List<String>,
    val handles: List<String>,
    val signatures: List<String>
)

data class TokenAccount(
    val mint: String,
    val owner: String,
    val encryptedBalanceHandle: String
)

data class TransferRequest(
    val toAddress: String,
    val amount: String
)

data class SwapQuote(
    val inputMint: String,
    val outputMint: String,
    val inAmount: String,
    val outAmount: String,
    val priceImpactPct: Double
)

data class Handle(
    val value: String,
    val source: HandleSource
)

enum class HandleSource {
    TRANSACTION_LOG,
    ON_CHAIN_ACCOUNT
}
