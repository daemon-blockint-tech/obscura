package com.obscura.mobile.data.inco

import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.client.statement.HttpResponse
import io.ktor.http.ContentType
import io.ktor.http.contentType

class IncoApiService(
    private val client: HttpClient,
    private val baseUrl: String
) {
    suspend fun encryptValue(request: EncryptRequest): EncryptResponse {
        val response: HttpResponse = client.post("$baseUrl/encrypt") {
            contentType(ContentType.Application.Json)
            setBody(request)
        }
        return response.body()
    }

    suspend fun decryptHandles(request: DecryptRequest): DecryptResponse {
        val response: HttpResponse = client.post("$baseUrl/decrypt") {
            contentType(ContentType.Application.Json)
            setBody(request)
        }
        return response.body()
    }
}
