package com.devmastery.app.core.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.compositionLocalOf

// Composition local for theme mode — read anywhere without passing down
val LocalIsDark = compositionLocalOf { true }

@Composable
fun DevMasteryTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    val colorScheme = if (darkTheme) DevMasteryDarkColorScheme else DevMasteryLightColorScheme

    CompositionLocalProvider(LocalIsDark provides darkTheme) {
        MaterialTheme(
            colorScheme = colorScheme,
            typography  = DevMasteryTypography,
            content     = content,
        )
    }
}
