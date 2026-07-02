package com.obscura.mobile.ui.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.obscura.mobile.data.wallet.WalletRepository
import com.obscura.mobile.domain.usecases.GetEncryptedBalanceUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class HomeUiState(
    val publicKey: String? = null,
    val encryptedBalance: String? = null,
    val isLoadingBalance: Boolean = false,
    val error: String? = null
)

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val walletRepository: WalletRepository,
    private val getBalanceUseCase: GetEncryptedBalanceUseCase
) : ViewModel() {

    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    init {
        _uiState.value = _uiState.value.copy(
            publicKey = walletRepository.getPublicKeyBase58()
        )
    }

    fun loadBalance(mint: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoadingBalance = true, error = null)
            val result = getBalanceUseCase(mint)
            result.fold(
                onSuccess = { handle ->
                    _uiState.value = _uiState.value.copy(
                        encryptedBalance = "Handle: $handle",
                        isLoadingBalance = false
                    )
                },
                onFailure = { e ->
                    _uiState.value = _uiState.value.copy(
                        isLoadingBalance = false,
                        error = e.message
                    )
                }
            )
        }
    }
}
