package com.obscura.mobile.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext

private val ObscuraDarkColorScheme = darkColorScheme(
    primary = ObscuraPrimary,
    onPrimary = ObscuraOnPrimary,
    primaryContainer = ObscuraPrimaryContainer,
    secondary = ObscuraSecondary,
    background = ObscuraDark,
    surface = ObscuraSurface,
    surfaceVariant = ObscuraSurfaceVariant,
    onSurface = ObscuraOnSurface,
    onSurfaceVariant = ObscuraOnSurfaceVariant,
    error = ObscuraError,
)

@Composable
fun ObscuraTheme(
    darkTheme: Boolean = true,
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            dynamicDarkColorScheme(context)
        }
        else -> ObscuraDarkColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = ObscuraTypography,
        content = content
    )
}
