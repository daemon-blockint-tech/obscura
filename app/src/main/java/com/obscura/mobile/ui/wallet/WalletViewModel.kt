package com.obscura.mobile.ui.wallet

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.obscura.mobile.data.wallet.WalletRepository
import com.obscura.mobile.data.wallet.WalletState
import com.solana.mobilewalletadapter.clientlib.ActivityResultSender
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class WalletUiState(
    val isConnected: Boolean = false,
    val publicKey: String? = null,
    val isLoading: Boolean = false,
    val error: String? = null,
    val noWalletFound: Boolean = false
)

@HiltViewModel
class WalletViewModel @Inject constructor(
    private val walletRepository: WalletRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(WalletUiState())
    val uiState: StateFlow<WalletUiState> = _uiState.asStateFlow()

    fun connect(sender: ActivityResultSender) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null, noWalletFound = false)
            val state = walletRepository.connect(sender)
            _uiState.value = when (state) {
                is WalletState.Connected -> WalletUiState(
                    isConnected = true,
                    publicKey = state.publicKeyBase58,
                    isLoading = false
                )
                is WalletState.NoWallet -> WalletUiState(
                    isLoading = false,
                    noWalletFound = true
                )
                is WalletState.Error -> WalletUiState(
                    isLoading = false,
                    error = state.message
                )
                is WalletState.Disconnected -> WalletUiState(isLoading = false)
            }
        }
    }

    fun disconnect(sender: ActivityResultSender) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            walletRepository.disconnect(sender)
            _uiState.value = WalletUiState()
        }
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null, noWalletFound = false)
    }
}
