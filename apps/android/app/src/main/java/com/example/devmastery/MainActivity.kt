package com.example.devmastery

import android.Manifest
import android.os.Build
import android.os.Bundle
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.fragment.app.FragmentActivity
import com.example.devmastery.core.network.OfflineBanner
import com.example.devmastery.core.security.BiometricAuth
import com.example.devmastery.theme.DevMasteryTheme

class MainActivity : FragmentActivity() {

  private val requestNotificationPermission =
    registerForActivityResult(ActivityResultContracts.RequestPermission()) { /* result ignored */ }

  override fun onCreate(savedInstanceState: Bundle?) {
    // Install the splash screen BEFORE super.onCreate — hands off to
    // Theme.DevMastery once the first Compose frame is ready.
    val splashScreen = installSplashScreen()

    // Keep the splash on screen briefly so the animated "draw-in" glyph can
    // play through, then exit with a smooth fade + zoom for a modern feel.
    val splashStart = System.currentTimeMillis()
    splashScreen.setKeepOnScreenCondition {
      System.currentTimeMillis() - splashStart < SPLASH_MIN_DURATION_MS
    }
    splashScreen.setOnExitAnimationListener { splashProvider ->
      val iconView = splashProvider.iconView
      iconView.animate()
        .alpha(0f)
        .scaleX(1.25f)
        .scaleY(1.25f)
        .setDuration(320L)
        .withEndAction { splashProvider.remove() }
        .start()
    }

    super.onCreate(savedInstanceState)

    // Ask for notification permission on Android 13+ so review reminders can show.
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      requestNotificationPermission.launch(Manifest.permission.POST_NOTIFICATIONS)
    }

    // ── Biometric app lock ──
    // If the user opted in AND has a stored session AND the device supports
    // authentication, gate the UI until the prompt succeeds. Missing biometric
    // hardware / no enrolled credentials → fall through (never lock out).
    val app = application as DevMasteryApp
    val tokenManager = app.container.tokenManager
    val shouldLock = tokenManager.isBiometricLockEnabled() &&
        !tokenManager.getToken().isNullOrBlank() &&
        BiometricAuth.isAvailable(this)

    enableEdgeToEdge()
    setContent {
      var unlocked by remember { mutableStateOf(!shouldLock) }

      if (shouldLock && !unlocked) {
        // Show the prompt exactly once per Activity creation.
        androidx.compose.runtime.LaunchedEffect(Unit) {
          BiometricAuth.prompt(
            activity = this@MainActivity,
            onSuccess = { unlocked = true },
            onFail = { finish() }
          )
        }
      }

      DevMasteryTheme {
        Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
          if (unlocked) {
            Column {
              OfflineBanner()
              MainNavigation(deepLinkUri = intent?.data)
            }
          }
          // While locked, show only the themed background so nothing sensitive
          // is visible before the prompt is answered.
        }
      }
    }
  }

  private companion object {
    // Minimum time the animated splash icon stays on screen so its draw-in
    // animation can complete before the app content takes over.
    const val SPLASH_MIN_DURATION_MS = 800L
  }
}
