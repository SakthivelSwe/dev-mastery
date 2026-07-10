package com.example.devmastery.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext

private val DarkColorScheme = darkColorScheme(
  primary = Accent,
  onPrimary = OnAccent,
  primaryContainer = AccentSoft,
  onPrimaryContainer = TextPrimary,
  secondary = Accent,
  onSecondary = OnAccent,
  secondaryContainer = BgSurfaceVariant,
  onSecondaryContainer = TextPrimary,
  tertiary = Accent,
  background = BgPrimary,
  onBackground = TextPrimary,
  surface = BgSurface,
  onSurface = TextPrimary,
  surfaceVariant = BgSurfaceVariant,
  onSurfaceVariant = TextSecondary,
  outline = BorderDefault,
  error = ErrorRed,
  onError = OnErrorRed,
  errorContainer = ErrorContainer,
  onErrorContainer = OnErrorContainer,
)

private val LightColorScheme =
  lightColorScheme(
    primary = AccentLight,
    onPrimary = Color.White,
    primaryContainer = BgSurfaceLight,
    onPrimaryContainer = TextPrimaryLight,
    secondary = AccentLight,
    secondaryContainer = Color(0xFFEDEFF7),
    onSecondaryContainer = TextPrimaryLight,
    tertiary = AccentLight,
    background = BgPrimaryLight,
    onBackground = TextPrimaryLight,
    surface = BgSurfaceLight,
    onSurface = TextPrimaryLight,
    surfaceVariant = Color(0xFFEDEFF7),
    onSurfaceVariant = TextSecondaryLight,
    outline = BorderLight,
    error = Color(0xFFB3261E),
  )

@Composable
fun DevMasteryTheme(
  darkTheme: Boolean = isSystemInDarkTheme(),
  // Brand-consistent by default — dynamic color off so the DevMastery palette shows.
  dynamicColor: Boolean = false,
  content: @Composable () -> Unit,
) {
  val colorScheme =
    when {
      dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
        val context = LocalContext.current
        if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
      }
      darkTheme -> DarkColorScheme
      else -> LightColorScheme
    }

  MaterialTheme(colorScheme = colorScheme, typography = Typography, content = content)
}
