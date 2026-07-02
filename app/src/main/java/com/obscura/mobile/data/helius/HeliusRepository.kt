package com.obscura.mobile.data.helius

import com.obscura.mobile.data.helius.HeliusAsset

interface HeliusRepository {
    suspend fun submitTransaction(serializedTx: String): Result<String>
    suspend fun getPriorityFeeEstimate(serializedTx: String): Result<Double>
    suspend fun getAssetsByOwner(ownerAddress: String): Result<List<HeliusAsset>>
}

class HeliusRepositoryImpl(
    private val api: HeliusApiService,
    private val rpcUrl: String
) : HeliusRepository {

    override suspend fun submitTransaction(serializedTx: String): Result<String> =
        api.submitTransaction(serializedTx)

    override suspend fun getPriorityFeeEstimate(serializedTx: String): Result<Double> =
        api.getPriorityFeeEstimate(serializedTx)

    override suspend fun getAssetsByOwner(ownerAddress: String): Result<List<HeliusAsset>> = runCatching {
        // DAS API getAssetsByOwner — uses the Helius RPC endpoint
        // This would be implemented via the RPC client's DAS method
        // Placeholder for actual DAS API call
        emptyList()
    }
}
