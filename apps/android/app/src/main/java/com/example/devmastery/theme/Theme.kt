package com.example.devmastery.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

private val DevMasteryColorScheme = darkColorScheme(
    primary          = AccentJava,
    onPrimary        = BgPrimary,
    primaryContainer = BgElevated,
    onPrimaryContainer = TextPrimary,

    secondary        = AccentSpring,
    onSecondary      = BgPrimary,
    secondaryContainer = BgElevated,
    onSecondaryContainer = TextPrimary,

    tertiary         = AccentAI,
    onTertiary       = BgPrimary,
    tertiaryContainer = BgElevated,
    onTertiaryContainer = TextPrimary,

    background       = BgPrimary,
    onBackground     = TextPrimary,

    surface          = BgSurface,
    onSurface        = TextPrimary,
    surfaceVariant   = BgElevated,
    onSurfaceVariant = TextSecondary,

    outline          = BorderDefault,
    outlineVariant   = BorderMuted,

    error            = StatusError,
    onError          = BgPrimary,
)

@Composable
fun DevMasteryTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = DevMasteryColorScheme,
        typography  = Typography,
        content     = content
    )
}
