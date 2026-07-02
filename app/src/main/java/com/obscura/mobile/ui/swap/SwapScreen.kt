package com.obscura.mobile.ui.swap

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.SwapVert
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.obscura.mobile.ui.theme.ObscuraPrimary
import com.obscura.mobile.ui.theme.ObscuraSecondary
import com.obscura.mobile.ui.theme.ObscuraSuccess
import com.obscura.mobile.ui.theme.ObscuraError

@Composable
fun SwapRoute(
    onBack: () -> Unit,
    viewModel: SwapViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    SwapScreen(
        uiState = uiState,
        onInputMintChange = viewModel::updateInputMint,
        onOutputMintChange = viewModel::updateOutputMint,
        onAmountChange = viewModel::updateAmount,
        onGetQuote = viewModel::getQuote,
        onSwap = viewModel::executeSwap,
        onBack = onBack
    )
}

@Composable
private fun SwapScreen(
    uiState: SwapUiState,
    onInputMintChange: (String) -> Unit,
    onOutputMintChange: (String) -> Unit,
    onAmountChange: (String) -> Unit,
    onGetQuote: () -> Unit,
    onSwap: () -> Unit,
    onBack: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onBack) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back")
            }
            Text(
                text = "Private Swap",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(start = 8.dp)
            )
        }

        Spacer(modifier = Modifier.height(32.dp))

        // Input token
        OutlinedTextField(
            value = uiState.inputMint,
            onValueChange = onInputMintChange,
            label = { Text("Input Token Mint") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            shape = RoundedCornerShape(12.dp)
        )

        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = uiState.amount,
            onValueChange = onAmountChange,
            label = { Text("Amount (encrypted)") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
            shape = RoundedCornerShape(12.dp)
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Swap icon
        Box(
            modifier = Modifier.fillMaxWidth(),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.Default.SwapVert,
                contentDescription = "Swap",
                modifier = Modifier.size(32.dp),
                tint = ObscuraPrimary
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Output token
        OutlinedTextField(
            value = uiState.outputMint,
            onValueChange = onOutputMintChange,
            label = { Text("Output Token Mint") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            shape = RoundedCornerShape(12.dp)
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Quote result
        uiState.outAmount?.let { outAmount ->
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Expected Output: $outAmount",
                        style = MaterialTheme.typography.titleMedium,
                        color = ObscuraSecondary,
                        fontWeight = FontWeight.SemiBold
                    )
                    uiState.priceImpactPct?.let { impact ->
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Price Impact: ${"%.2f".format(impact)}%",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
            Spacer(modifier = Modifier.height(16.dp))
        }

        uiState.error?.let { error ->
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.errorContainer),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = error,
                    modifier = Modifier.padding(16.dp),
                    color = ObscuraError,
                    style = MaterialTheme.typography.bodyMedium
                )
            }
            Spacer(modifier = Modifier.height(16.dp))
        }

        uiState.txSignature?.let { sig ->
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Swap Submitted",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.SemiBold,
                        color = ObscuraSuccess
                    )
                    Text(
                        text = "Signature: ${sig.take(16)}...",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
            Spacer(modifier = Modifier.height(16.dp))
        }

        if (uiState.outAmount == null) {
            Button(
                onClick = onGetQuote,
                enabled = !uiState.isLoadingQuote && uiState.inputMint.isNotBlank() && uiState.outputMint.isNotBlank() && uiState.amount.isNotBlank(),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(containerColor = ObscuraSecondary)
            ) {
                if (uiState.isLoadingQuote) {
                    CircularProgressIndicator(modifier = Modifier.size(24.dp), color = MaterialTheme.colorScheme.onPrimary)
                } else {
                    Text("Get Quote", fontWeight = FontWeight.SemiBold)
                }
            }
        } else {
            Button(
                onClick = onSwap,
                enabled = !uiState.isSwapping,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(containerColor = ObscuraPrimary)
            ) {
                if (uiState.isSwapping) {
                    CircularProgressIndicator(modifier = Modifier.size(24.dp), color = MaterialTheme.colorScheme.onPrimary)
                } else {
                    Text("Execute Private Swap", fontWeight = FontWeight.SemiBold)
                }
            }
        }
    }
}
