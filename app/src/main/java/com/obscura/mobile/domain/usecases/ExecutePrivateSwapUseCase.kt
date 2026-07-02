package com.obscura.mobile.domain.usecases

import com.obscura.mobile.data.inco.IncoRepository
import com.obscura.mobile.data.jupiter.JupiterRepository
import com.obscura.mobile.data.solana.SolanaRepository
import com.obscura.mobile.data.wallet.WalletRepository
import com.obscura.mobile.domain.models.SwapQuote

class ExecutePrivateSwapUseCase(
    private val incoRepository: IncoRepository,
    private val jupiterRepository: JupiterRepository,
    private val solanaRepository: SolanaRepository,
    private val walletRepository: WalletRepository
) {
    suspend fun getQuote(
        inputMint: String,
        outputMint: String,
        amount: String
    ): Result<SwapQuote> {
        val quoteResult = jupiterRepository.getQuote(inputMint, outputMint, amount)
        val quote = quoteResult.getOrElse { return Result.failure(it) }

        return Result.success(
            SwapQuote(
                inputMint = quote.inputMint,
                outputMint = quote.outputMint,
                inAmount = quote.inAmount,
                outAmount = quote.outAmount,
                priceImpactPct = quote.priceImpactPct
            )
        )
    }

    suspend fun executeSwap(
        inputMint: String,
        outputMint: String,
        amount: String
    ): Result<String> {
        val publicKey = walletRepository.getPublicKey()
            ?: return Result.failure(Exception("Wallet not connected"))
        val publicKeyBase58 = walletRepository.getPublicKeyBase58()
            ?: return Result.failure(Exception("Wallet not connected"))

        // 1. Encrypt swap amount
        val encryptedResult = incoRepository.encryptValue(amount)
        encryptedResult.getOrElse { return Result.failure(it) }

        // 2. Get Jupiter quote
        val quoteResult = jupiterRepository.getQuote(inputMint, outputMint, amount)
        val quote = quoteResult.getOrElse { return Result.failure(it) }

        // 3. Get swap transaction from Jupiter
        val swapTxResult = jupiterRepository.getSwapTransaction(quote, publicKeyBase58)
        val swapTx = swapTxResult.getOrElse { return Result.failure(it) }

        // 4. Return serialized swap transaction for MWA signing
        return Result.success(swapTx.swapTransaction)
    }
}
