package com.example.devmastery.profile.presentation

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.devmastery.progress.data.remote.PathProgressDto
import com.example.devmastery.progress.data.remote.ProgressSummaryDto

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(
    onBack: () -> Unit,
    onOpenSettings: () -> Unit,
    onOpenCertificates: () -> Unit = {},
    viewModel: ProfileViewModel = viewModel(factory = ProfileViewModel.Factory)
) {
    val state by viewModel.state.collectAsState()

    val header: ProfileHeader = when (val s = state) {
        is ProfileState.Loading -> ProfileHeader("Learner", "")
        is ProfileState.Success -> s.header
        is ProfileState.Error -> s.header
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Profile") },
                navigationIcon = { TextButton(onClick = onBack) { Text("Back") } },
                actions = { TextButton(onClick = onOpenSettings) { Text("Settings") } },
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
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Identity card
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(header.name, style = MaterialTheme.typography.headlineSmall)
                    if (header.email.isNotBlank()) {
                        Text(
                            header.email,
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }

            when (val s = state) {
                is ProfileState.Loading -> Box(
                    Modifier.fillMaxWidth().padding(32.dp),
                    contentAlignment = Alignment.Center
                ) { CircularProgressIndicator() }

                is ProfileState.Error -> Column {
                    Text(s.message, color = MaterialTheme.colorScheme.error)
                    Spacer(Modifier.height(8.dp))
                    Button(onClick = { viewModel.load() }) { Text("Retry") }
                }

                is ProfileState.Success -> ProgressSection(s.summary)
            }

            OutlinedButton(
                onClick = onOpenCertificates,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("View certificates")
            }
        }
    }
}

@Composable
private fun ProgressSection(summary: ProgressSummaryDto) {
    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        StatCard("Total XP", summary.totalXp.toString(), Modifier.weight(1f))
        StatCard("Streak", "${summary.streak}d", Modifier.weight(1f))
        StatCard("Rank", summary.rank, Modifier.weight(1f))
    }

    if (summary.pathProgress.isNotEmpty()) {
        Text("Paths", style = MaterialTheme.typography.titleMedium)
        summary.pathProgress.forEach { PathProgressRow(it) }
    }
}

@Composable
private fun StatCard(label: String, value: String, modifier: Modifier = Modifier) {
    Card(modifier = modifier) {
        Column(
            modifier = Modifier.padding(16.dp).fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(value, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
            Text(
                label,
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
private fun PathProgressRow(path: PathProgressDto) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                path.pathSlug.replace('-', ' ').replaceFirstChar { it.uppercase() },
                style = MaterialTheme.typography.titleSmall
            )
            Spacer(Modifier.height(8.dp))
            LinearProgressIndicator(
                progress = { (path.percentComplete / 100.0).toFloat().coerceIn(0f, 1f) },
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(Modifier.height(6.dp))
            Text(
                "${path.completedTopics}/${path.totalTopics} topics · ${path.xpEarned} XP",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

