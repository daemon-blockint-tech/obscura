package com.obscura.mobile.ui.home

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CompareArrows
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.SwapHoriz
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.obscura.mobile.ui.theme.ObscuraPrimary
import com.obscura.mobile.ui.theme.ObscuraSecondary
import com.obscura.mobile.ui.theme.ObscuraSurfaceVariant

@Composable
fun HomeRoute(
    onTransferClick: () -> Unit,
    onSwapClick: () -> Unit,
    onShieldedClick: () -> Unit,
    onDisconnect: () -> Unit,
    viewModel: HomeViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    HomeScreen(
        uiState = uiState,
        onTransferClick = onTransferClick,
        onSwapClick = onSwapClick,
        onShieldedClick = onShieldedClick,
        onDisconnect = onDisconnect
    )
}

@Composable
private fun HomeScreen(
    uiState: HomeUiState,
    onTransferClick: () -> Unit,
    onSwapClick: () -> Unit,
    onShieldedClick: () -> Unit,
    onDisconnect: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp)
    ) {
        Text(
            text = "Obscura",
            style = MaterialTheme.typography.headlineLarge,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onSurface
        )

        Spacer(modifier = Modifier.height(4.dp))

        uiState.publicKey?.let { pk ->
            Text(
                text = "${pk.take(8)}...${pk.takeLast(6)}",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }

        Spacer(modifier = Modifier.height(32.dp))

        // Balance Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = ObscuraSurfaceVariant)
        ) {
            Column(
                modifier = Modifier.padding(20.dp)
            ) {
                Text(
                    text = "Encrypted Balance",
                    style = MaterialTheme.typography.labelLarge,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(modifier = Modifier.height(8.dp))
                if (uiState.isLoadingBalance) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(24.dp),
                        color = ObscuraPrimary
                    )
                } else {
                    Text(
                        text = uiState.encryptedBalance ?: "—",
                        style = MaterialTheme.typography.headlineMedium,
                        fontWeight = FontWeight.SemiBold,
                        color = ObscuraSecondary
                    )
                }
                uiState.error?.let {
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = it,
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.error
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Action Buttons
        ActionCard(
            icon = Icons.Default.SwapHoriz,
            title = "Private Swap",
            subtitle = "Swap tokens with encrypted amounts via Jupiter",
            onClick = onSwapClick
        )

        Spacer(modifier = Modifier.height(12.dp))

        ActionCard(
            icon = Icons.Default.CompareArrows,
            title = "Private Transfer",
            subtitle = "Send encrypted tokens to any address",
            onClick = onTransferClick
        )

        Spacer(modifier = Modifier.height(12.dp))

        ActionCard(
            icon = Icons.Default.Lock,
            title = "Shielded Pool",
            subtitle = "Deposit & withdraw from shielded pool",
            onClick = onShieldedClick
        )

        Spacer(modifier = Modifier.weight(1f))

        TextButton(
            onClick = onDisconnect,
            modifier = Modifier.align(Alignment.CenterHorizontally)
        ) {
            Text(
                text = "Disconnect Wallet",
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
private fun ActionCard(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    subtitle: String,
    onClick: () -> Unit
) {
    Card(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = ObscuraSurfaceVariant)
    ) {
        Row(
            modifier = Modifier
                .padding(16.dp)
                .fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = icon,
                contentDescription = title,
                modifier = Modifier.size(32.dp),
                tint = ObscuraPrimary
            )
            Spacer(modifier = Modifier.width(16.dp))
            Column {
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = subtitle,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}
