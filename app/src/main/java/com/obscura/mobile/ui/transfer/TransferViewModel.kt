package com.obscura.mobile.ui.transfer

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.obscura.mobile.data.wallet.WalletRepository
import com.obscura.mobile.domain.usecases.SendPrivateTransferUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class TransferUiState(
    val recipientAddress: String = "",
    val amount: String = "",
    val isLoading: Boolean = false,
    val txSignature: String? = null,
    val error: String? = null
)

@HiltViewModel
class TransferViewModel @Inject constructor(
    private val sendTransferUseCase: SendPrivateTransferUseCase,
    private val walletRepository: WalletRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(TransferUiState())
    val uiState: StateFlow<TransferUiState> = _uiState.asStateFlow()

    fun updateRecipient(address: String) {
        _uiState.value = _uiState.value.copy(recipientAddress = address)
    }

    fun updateAmount(amount: String) {
        _uiState.value = _uiState.value.copy(amount = amount)
    }

    fun sendTransfer() {
        val state = _uiState.value
        if (state.recipientAddress.isBlank() || state.amount.isBlank()) {
            _uiState.value = state.copy(error = "Please fill in all fields")
            return
        }

        viewModelScope.launch {
            _uiState.value = state.copy(isLoading = true, error = null, txSignature = null)
            val result = sendTransferUseCase(state.recipientAddress, state.amount)
            result.fold(
                onSuccess = { sig ->
                    _uiState.value = state.copy(
                        isLoading = false,
                        txSignature = sig
                    )
                },
                onFailure = { e ->
                    _uiState.value = state.copy(
                        isLoading = false,
                        error = e.message
                    )
                }
            )
        }
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }
}
