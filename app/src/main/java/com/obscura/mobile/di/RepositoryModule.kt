package com.obscura.mobile.di

import com.obscura.mobile.data.helius.HeliusApiService
import com.obscura.mobile.data.helius.HeliusRepository
import com.obscura.mobile.data.helius.HeliusRepositoryImpl
import com.obscura.mobile.data.inco.IncoApiService
import com.obscura.mobile.data.inco.IncoRepository
import com.obscura.mobile.data.inco.IncoRepositoryImpl
import com.obscura.mobile.data.jupiter.JupiterApiService
import com.obscura.mobile.data.jupiter.JupiterRepository
import com.obscura.mobile.data.jupiter.JupiterRepositoryImpl
import com.obscura.mobile.data.solana.SolanaRepository
import com.obscura.mobile.data.solana.SolanaRepositoryImpl
import com.obscura.mobile.data.wallet.WalletRepository
import com.obscura.mobile.data.wallet.WalletRepositoryImpl
import com.obscura.mobile.BuildConfig
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import io.ktor.client.HttpClient
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object RepositoryModule {

    @Provides
    @Singleton
    fun provideIncoApiService(client: HttpClient): IncoApiService =
        IncoApiService(client, BuildConfig.INCO_COVALIDATOR_URL)

    @Provides
    @Singleton
    fun provideIncoRepository(api: IncoApiService): IncoRepository =
        IncoRepositoryImpl(api)

    @Provides
    @Singleton
    fun provideHeliusApiService(client: HttpClient): HeliusApiService =
        HeliusApiService(client, BuildConfig.HELIUS_SENDER_URL)

    @Provides
    @Singleton
    fun provideHeliusRepository(api: HeliusApiService): HeliusRepository =
        HeliusRepositoryImpl(api, BuildConfig.HELIUS_RPC_URL)

    @Provides
    @Singleton
    fun provideJupiterApiService(client: HttpClient): JupiterApiService =
        JupiterApiService(client, BuildConfig.JUPITER_API_URL)

    @Provides
    @Singleton
    fun provideJupiterRepository(api: JupiterApiService): JupiterRepository =
        JupiterRepositoryImpl(api)

    @Provides
    @Singleton
    fun provideSolanaRepository(): SolanaRepository =
        SolanaRepositoryImpl(BuildConfig.HELIUS_RPC_URL)

    @Provides
    @Singleton
    fun provideWalletRepository(): WalletRepository =
        WalletRepositoryImpl()
}
