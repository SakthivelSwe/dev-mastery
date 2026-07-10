package com.example.devmastery.profile.presentation

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.fragment.app.FragmentActivity
import com.example.devmastery.DevMasteryApp
import com.example.devmastery.content.data.local.TopicCache
import com.example.devmastery.core.security.BiometricAuth
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    onBack: () -> Unit,
    onLoggedOut: () -> Unit,
    onEditProfile: () -> Unit = {}
) {
    val context = LocalContext.current
    val container = (context.applicationContext as DevMasteryApp).container
    val name = container.tokenManager.getUserName() ?: "Learner"
    val email = container.tokenManager.getUserEmail() ?: "—"
    val activity = context as? FragmentActivity
    val biometricSupported = activity?.let { BiometricAuth.isAvailable(it) } == true
    var biometricEnabled by remember {
        mutableStateOf(container.tokenManager.isBiometricLockEnabled())
    }

    // ── Offline downloads panel ──
    val scope = rememberCoroutineScope()
    val cache = remember { TopicCache(context) }
    var downloadedCount by remember { mutableStateOf(0) }
    var cacheBytes by remember { mutableStateOf(0L) }
    LaunchedEffect(Unit) {
        downloadedCount = cache.starredSlugs().size
        cacheBytes = cache.cacheSizeBytes()
    }
    fun formatSize(bytes: Long): String = when {
        bytes >= 1_000_000 -> "%.1f MB".format(bytes / 1_000_000.0)
        bytes >= 1_000     -> "%.1f KB".format(bytes / 1_000.0)
        else               -> "$bytes B"
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Settings") },
                navigationIcon = { TextButton(onClick = onBack) { Text("Back") } },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer,
                    titleContentColor = MaterialTheme.colorScheme.onPrimaryContainer,
                )
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Account", style = MaterialTheme.typography.titleMedium)
                    Spacer(Modifier.height(8.dp))
                    Text("Name: $name", style = MaterialTheme.typography.bodyMedium)
                    Text("Email: $email", style = MaterialTheme.typography.bodyMedium)
                }
            }

            OutlinedButton(
                onClick = onEditProfile,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Edit profile")
            }

            // ── Biometric app lock (opt-in) ──
            Card(modifier = Modifier.fillMaxWidth()) {
                Row(
                    modifier = Modifier.padding(16.dp).fillMaxWidth(),
                    verticalAlignment = androidx.compose.ui.Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text("Biometric app lock", style = MaterialTheme.typography.titleMedium)
                        Text(
                            if (biometricSupported)
                                "Require fingerprint or device credential to open the app."
                            else
                                "Not available — no biometrics or screen-lock configured on this device.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                    Switch(
                        checked = biometricEnabled,
                        enabled = biometricSupported,
                        onCheckedChange = { checked ->
                            biometricEnabled = checked
                            container.tokenManager.setBiometricLockEnabled(checked)
                        }
                    )
                }
            }

            // ── Downloaded for offline ──
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Offline downloads", style = MaterialTheme.typography.titleMedium)
                    Spacer(Modifier.height(4.dp))
                    Text(
                        "$downloadedCount ${if (downloadedCount == 1) "topic" else "topics"} · ${formatSize(cacheBytes)}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(Modifier.height(8.dp))
                    OutlinedButton(
                        onClick = {
                            scope.launch {
                                cache.clearAll()
                                downloadedCount = 0
                                cacheBytes = 0L
                            }
                        }
                    ) { Text("Clear downloads") }
                }
            }

            Button(
                onClick = {
                    container.tokenManager.clearToken()
                    onLoggedOut()
                },
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.errorContainer,
                    contentColor = MaterialTheme.colorScheme.onErrorContainer
                )
            ) {
                Text("Log out")
            }
        }
    }
}

