package com.devmastery.app.core.ui.theme

import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.ui.graphics.Color

val DevMasteryDarkColorScheme = darkColorScheme(
    primary           = DarkAccent,
    onPrimary         = Color.White,
    primaryContainer  = DarkAccentSoft,
    onPrimaryContainer= DarkAccent,
    background        = DarkBgPrimary,
    onBackground      = DarkTextPrimary,
    surface           = DarkBgSurface,
    onSurface         = DarkTextPrimary,
    surfaceVariant    = DarkBgInset,
    onSurfaceVariant  = DarkTextSecondary,
    outline           = DarkBorder,
    error             = DarkError,
    onError           = Color.White,
)

val DevMasteryLightColorScheme = lightColorScheme(
    primary           = LightAccent,
    onPrimary         = Color.White,
    primaryContainer  = LightAccentSoft,
    onPrimaryContainer= LightAccent,
    background        = LightBgPrimary,
    onBackground      = LightTextPrimary,
    surface           = LightBgSurface,
    onSurface         = LightTextPrimary,
    surfaceVariant    = LightBgInset,
    onSurfaceVariant  = LightTextSecondary,
    outline           = LightBorder,
    error             = LightError,
    onError           = Color.White,
)
