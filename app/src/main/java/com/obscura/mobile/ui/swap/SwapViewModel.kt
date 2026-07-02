package com.obscura.mobile.ui.swap

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.obscura.mobile.data.wallet.WalletRepository
import com.obscura.mobile.domain.usecases.ExecutePrivateSwapUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class SwapUiState(
    val inputMint: String = "",
    val outputMint: String = "",
    val amount: String = "",
    val outAmount: String? = null,
    val priceImpactPct: Double? = null,
    val isLoadingQuote: Boolean = false,
    val isSwapping: Boolean = false,
    val txSignature: String? = null,
    val error: String? = null
)

@HiltViewModel
class SwapViewModel @Inject constructor(
    private val swapUseCase: ExecutePrivateSwapUseCase,
    private val walletRepository: WalletRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(SwapUiState())
    val uiState: StateFlow<SwapUiState> = _uiState.asStateFlow()

    fun updateInputMint(mint: String) {
        _uiState.value = _uiState.value.copy(inputMint = mint, outAmount = null, priceImpactPct = null)
    }

    fun updateOutputMint(mint: String) {
        _uiState.value = _uiState.value.copy(outputMint = mint, outAmount = null, priceImpactPct = null)
    }

    fun updateAmount(amount: String) {
        _uiState.value = _uiState.value.copy(amount = amount, outAmount = null, priceImpactPct = null)
    }

    fun getQuote() {
        val state = _uiState.value
        if (state.inputMint.isBlank() || state.outputMint.isBlank() || state.amount.isBlank()) return

        viewModelScope.launch {
            _uiState.value = state.copy(isLoadingQuote = true, error = null)
            val result = swapUseCase.getQuote(state.inputMint, state.outputMint, state.amount)
            result.fold(
                onSuccess = { quote ->
                    _uiState.value = state.copy(
                        isLoadingQuote = false,
                        outAmount = quote.outAmount,
                        priceImpactPct = quote.priceImpactPct
                    )
                },
                onFailure = { e ->
                    _uiState.value = state.copy(isLoadingQuote = false, error = e.message)
                }
            )
        }
    }

    fun executeSwap() {
        val state = _uiState.value
        if (state.inputMint.isBlank() || state.outputMint.isBlank() || state.amount.isBlank()) return

        viewModelScope.launch {
            _uiState.value = state.copy(isSwapping = true, error = null, txSignature = null)
            val result = swapUseCase.executeSwap(state.inputMint, state.outputMint, state.amount)
            result.fold(
                onSuccess = { sig ->
                    _uiState.value = state.copy(isSwapping = false, txSignature = sig)
                },
                onFailure = { e ->
                    _uiState.value = state.copy(isSwapping = false, error = e.message)
                }
            )
        }
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }
}
