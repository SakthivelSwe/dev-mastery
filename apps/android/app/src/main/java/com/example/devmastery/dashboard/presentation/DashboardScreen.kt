package com.example.devmastery.dashboard.presentation

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    onNavigateToTopic: (String) -> Unit,
    onNavigateToReview: () -> Unit = {},
    onNavigateToProfile: () -> Unit = {},
    onNavigateToAiChat: () -> Unit = {},
    onNavigateToPatterns: () -> Unit = {},
    onNavigateToVisualizer: () -> Unit = {},
    onNavigateToInterview: () -> Unit = {},
    onNavigateToPaths: () -> Unit = {},
    onNavigateToSearch: () -> Unit = {}
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("DevMastery") },
                actions = {
                    TextButton(onClick = onNavigateToSearch) { Text("Search") }
                    TextButton(onClick = onNavigateToProfile) { Text("Profile") }
                },
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
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "DSA Mastery Path",
                style = MaterialTheme.typography.titleLarge,
                modifier = Modifier.padding(bottom = 16.dp)
            )

            Card(
                modifier = Modifier.fillMaxWidth(),
                onClick = { onNavigateToTopic("binary-search-tree") }
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(text = "Binary Search Tree", style = MaterialTheme.typography.titleMedium)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(text = "Learn about tree data structures", style = MaterialTheme.typography.bodyMedium)
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            OutlinedButton(
                onClick = onNavigateToReview,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Spaced Review")
            }

            Spacer(modifier = Modifier.height(8.dp))

            OutlinedButton(
                onClick = onNavigateToAiChat,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Ask AI Mentor")
            }

            Spacer(modifier = Modifier.height(8.dp))

            OutlinedButton(
                onClick = onNavigateToPatterns,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("LeetCode Patterns")
            }

            Spacer(modifier = Modifier.height(8.dp))

            OutlinedButton(
                onClick = onNavigateToVisualizer,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Visualizers")
            }

            Spacer(modifier = Modifier.height(8.dp))

            OutlinedButton(
                onClick = onNavigateToInterview,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Mock Interview")
            }

            Spacer(modifier = Modifier.height(8.dp))

            Button(
                onClick = onNavigateToPaths,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Browse learning paths")
            }
        }
    }
}
