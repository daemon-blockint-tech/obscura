package com.obscura.mobile.data.helius

import kotlinx.serialization.Serializable

@Serializable
data class PriorityFeeEstimateRequest(
    val transaction: String,
    val options: PriorityFeeOptions? = null
)

@Serializable
data class PriorityFeeOptions(
    val priorityLevel: String = "High",
    val includeLamportsCPULimits: Boolean = true
)

@Serializable
data class PriorityFeeEstimateResponse(
    val result: PriorityFeeResult
)

@Serializable
data class PriorityFeeResult(
    val priorityFeeEstimate: Double
)

@Serializable
data class GetAssetsByOwnerRequest(
    val ownerAddress: String,
    val page: Int = 1,
    val limit: Int = 100
)

@Serializable
data class GetAssetsByOwnerResponse(
    val items: List<HeliusAsset>
)

@Serializable
data class HeliusAsset(
    val id: String,
    val content: HeliusAssetContent? = null
)

@Serializable
data class HeliusAssetContent(
    val metadata: HeliusMetadata? = null
)

@Serializable
data class HeliusMetadata(
    val name: String? = null,
    val symbol: String? = null
)
