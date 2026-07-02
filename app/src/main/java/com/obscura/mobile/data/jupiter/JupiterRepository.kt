package com.obscura.mobile.data.jupiter

interface JupiterRepository {
    suspend fun getQuote(inputMint: String, outputMint: String, amount: String): Result<JupiterQuote>
    suspend fun getSwapTransaction(quote: JupiterQuote, userPublicKey: String): Result<JupiterSwapResponse>
}

class JupiterRepositoryImpl(
    private val api: JupiterApiService
) : JupiterRepository {

    override suspend fun getQuote(
        inputMint: String,
        outputMint: String,
        amount: String
    ): Result<JupiterQuote> = runCatching {
        api.getQuote(inputMint, outputMint, amount)
    }

    override suspend fun getSwapTransaction(
        quote: JupiterQuote,
        userPublicKey: String
    ): Result<JupiterSwapResponse> = runCatching {
        api.getSwapTransaction(quote, userPublicKey)
    }
}
