package com.obscura.mobile.data.helius

import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.client.statement.HttpResponse
import io.ktor.http.ContentType
import io.ktor.http.contentType

class HeliusApiService(
    private val client: HttpClient,
    private val senderUrl: String
) {
    suspend fun submitTransaction(serializedTx: String): Result<String> = runCatching {
        val response: HttpResponse = client.post(senderUrl) {
            contentType(ContentType.Application.Json)
            setBody(mapOf("transaction" to serializedTx))
        }
        response.body<Map<String, String>>()["signature"]
            ?: throw Exception("No signature in response")
    }

    suspend fun getPriorityFeeEstimate(serializedTx: String): Result<Double> = runCatching {
        val rpcUrl = senderUrl.replace("/fast", "")
        val response: HttpResponse = client.post(rpcUrl) {
            contentType(ContentType.Application.Json)
            setBody(mapOf(
                "jsonrpc" to "2.0",
                "id" to "1",
                "method" to "getPriorityFeeEstimate",
                "params" to listOf(mapOf(
                    "transaction" to serializedTx,
                    "options" to mapOf(
                        "priorityLevel" to "High",
                        "includeLamportsCPULimits" to true
                    )
                ))
            ))
        }
        val body: Map<String, Any?> = response.body()
        val result = body["result"] as? Map<String, Any?>
        (result?.get("priorityFeeEstimate") as? Number)?.toDouble()
            ?: throw Exception("No fee estimate in response")
    }
}
