package com.obscura.mobile.data.jupiter

import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.get
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.client.statement.HttpResponse
import io.ktor.http.ContentType
import io.ktor.http.contentType
import io.ktor.http.encodeURLParameter

class JupiterApiService(
    private val client: HttpClient,
    private val baseUrl: String
) {
    suspend fun getQuote(
        inputMint: String,
        outputMint: String,
        amount: String,
        slippageBps: Int = 50
    ): JupiterQuote {
        val url = "$baseUrl/quote?" +
            "inputMint=${inputMint.encodeURLParameter()}&" +
            "outputMint=${outputMint.encodeURLParameter()}&" +
            "amount=${amount.encodeURLParameter()}&" +
            "slippageBps=$slippageBps"
        val response: HttpResponse = client.get(url)
        return response.body()
    }

    suspend fun getSwapTransaction(
        quote: JupiterQuote,
        userPublicKey: String
    ): JupiterSwapResponse {
        val response: HttpResponse = client.post("$baseUrl/swap") {
            contentType(ContentType.Application.Json)
            setBody(JupiterSwapRequest(quote, userPublicKey))
        }
        return response.body()
    }
}
