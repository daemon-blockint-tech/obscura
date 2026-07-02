package com.obscura.mobile.di

import com.obscura.mobile.domain.usecases.DecryptHandleUseCase
import com.obscura.mobile.domain.usecases.EncryptAmountUseCase
import com.obscura.mobile.domain.usecases.ExecutePrivateSwapUseCase
import com.obscura.mobile.domain.usecases.GetEncryptedBalanceUseCase
import com.obscura.mobile.domain.usecases.SendPrivateTransferUseCase
import com.obscura.mobile.data.helius.HeliusRepository
import com.obscura.mobile.data.inco.IncoRepository
import com.obscura.mobile.data.jupiter.JupiterRepository
import com.obscura.mobile.data.solana.SolanaRepository
import com.obscura.mobile.data.wallet.WalletRepository
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object UseCaseModule {

    @Provides
    @Singleton
    fun provideEncryptAmountUseCase(inco: IncoRepository): EncryptAmountUseCase =
        EncryptAmountUseCase(inco)

    @Provides
    @Singleton
    fun provideDecryptHandleUseCase(
        inco: IncoRepository,
        wallet: WalletRepository
    ): DecryptHandleUseCase = DecryptHandleUseCase(inco, wallet)

    @Provides
    @Singleton
    fun provideSendPrivateTransferUseCase(
        inco: IncoRepository,
        solana: SolanaRepository,
        wallet: WalletRepository
    ): SendPrivateTransferUseCase = SendPrivateTransferUseCase(inco, solana, wallet)

    @Provides
    @Singleton
    fun provideExecutePrivateSwapUseCase(
        inco: IncoRepository,
        jupiter: JupiterRepository,
        solana: SolanaRepository,
        wallet: WalletRepository
    ): ExecutePrivateSwapUseCase = ExecutePrivateSwapUseCase(inco, jupiter, solana, wallet)

    @Provides
    @Singleton
    fun provideGetEncryptedBalanceUseCase(
        solana: SolanaRepository,
        inco: IncoRepository,
        wallet: WalletRepository
    ): GetEncryptedBalanceUseCase = GetEncryptedBalanceUseCase(solana, inco, wallet)
}
