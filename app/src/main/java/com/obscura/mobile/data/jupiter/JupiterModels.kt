package com.obscura.mobile.data.jupiter

import kotlinx.serialization.Serializable

@Serializable
data class JupiterQuoteRequest(
    val inputMint: String,
    val outputMint: String,
    val amount: String,
    val slippageBps: Int = 50
)

@Serializable
data class JupiterQuote(
    val inputMint: String,
    val outputMint: String,
    val inAmount: String,
    val outAmount: String,
    val priceImpactPct: Double,
    val swapTransaction: String? = null
)

@Serializable
data class JupiterSwapRequest(
    val quoteResponse: JupiterQuote,
    val userPublicKey: String,
    val wrapAndUnwrapSol: Boolean = true
)

@Serializable
data class JupiterSwapResponse(
    val swapTransaction: String,
    val lastValidBlockHeight: Long
)
