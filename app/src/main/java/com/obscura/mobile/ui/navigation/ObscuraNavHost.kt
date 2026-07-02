package com.obscura.mobile.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument

object Routes {
    const val WALLET = "wallet"
    const val HOME = "home"
    const val TRANSFER = "transfer"
    const val SWAP = "swap"
    const val SHIELDED = "shielded"
}

@Composable
fun ObscuraNavHost() {
    val navController = rememberNavController()

    NavHost(
        navController = navController,
        startDestination = Routes.WALLET
    ) {
        composable(Routes.WALLET) {
            WalletConnectRoute(
                onConnected = { navController.navigate(Routes.HOME) { popUpTo(Routes.WALLET) { inclusive = true } } }
            )
        }
        composable(Routes.HOME) {
            HomeRoute(
                onTransferClick = { navController.navigate(Routes.TRANSFER) },
                onSwapClick = { navController.navigate(Routes.SWAP) },
                onShieldedClick = { navController.navigate(Routes.SHIELDED) },
                onDisconnect = { navController.navigate(Routes.WALLET) { popUpTo(Routes.HOME) { inclusive = true } } }
            )
        }
        composable(Routes.TRANSFER) {
            TransferRoute(
                onBack = { navController.popBackStack() }
            )
        }
        composable(Routes.SWAP) {
            SwapRoute(
                onBack = { navController.popBackStack() }
            )
        }
        composable(Routes.SHIELDED) {
            ShieldedPoolRoute(
                onBack = { navController.popBackStack() }
            )
        }
    }
}
