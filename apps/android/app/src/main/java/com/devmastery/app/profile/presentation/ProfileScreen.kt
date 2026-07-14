package com.devmastery.app.profile.presentation

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DarkMode
import androidx.compose.material.icons.filled.LightMode
import androidx.compose.material.icons.filled.Logout
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.devmastery.app.auth.presentation.AuthViewModel

@Composable
fun ProfileScreen(
    isDark: Boolean,
    onThemeToggle: () -> Unit,
    onLogout: () -> Unit,
    authViewModel: AuthViewModel = hiltViewModel(),
) {
    // Load user info from DataStore
    var displayName by remember { mutableStateOf<String?>(null) }
    var displayEmail by remember { mutableStateOf<String?>(null) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Profile") },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background,
                ),
            )
        }
    ) { padding ->
        Column(
            modifier            = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 20.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            Spacer(Modifier.height(8.dp))

            // Avatar + name
            Surface(
                shape          = RoundedCornerShape(16.dp),
                color          = MaterialTheme.colorScheme.surface,
                tonalElevation = 2.dp,
                modifier       = Modifier.fillMaxWidth(),
            ) {
                Row(
                    modifier          = Modifier.padding(20.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(16.dp),
                ) {
                    Surface(
                        shape = CircleShape,
                        color = MaterialTheme.colorScheme.primaryContainer,
                        modifier = Modifier.size(56.dp),
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Icon(
                                Icons.Default.Person,
                                contentDescription = null,
                                tint     = MaterialTheme.colorScheme.onPrimaryContainer,
                                modifier = Modifier.size(32.dp),
                            )
                        }
                    }
                    Column {
                        Text(
                            displayName ?: "DevMastery User",
                            style      = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.SemiBold,
                        )
                        if (displayEmail != null) {
                            Text(
                                displayEmail!!,
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                        }
                    }
                }
            }

            // Theme toggle
            Surface(
                shape          = RoundedCornerShape(12.dp),
                color          = MaterialTheme.colorScheme.surface,
                tonalElevation = 1.dp,
                modifier       = Modifier.fillMaxWidth(),
            ) {
                Row(
                    modifier              = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment     = Alignment.CenterVertically,
                ) {
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                        verticalAlignment     = Alignment.CenterVertically,
                    ) {
                        Icon(
                            if (isDark) Icons.Default.DarkMode else Icons.Default.LightMode,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.primary,
                        )
                        Text(if (isDark) "Dark Mode" else "Light Mode",
                            style = MaterialTheme.typography.titleMedium)
                    }
                    Switch(
                        checked         = isDark,
                        onCheckedChange = { onThemeToggle() },
                    )
                }
            }

            Spacer(Modifier.weight(1f))

            // Logout
            OutlinedButton(
                onClick  = {
                    authViewModel.logout { onLogout() }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp),
                colors   = ButtonDefaults.outlinedButtonColors(
                    contentColor = MaterialTheme.colorScheme.error,
                ),
            ) {
                Icon(Icons.Default.Logout, null)
                Spacer(Modifier.width(8.dp))
                Text("Sign out")
            }
            Spacer(Modifier.height(8.dp))
        }
    }
}
