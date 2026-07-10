@file:OptIn(ExperimentalMaterial3Api::class)

package com.example.devmastery.patterns.presentation

import android.content.Intent
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.core.net.toUri
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.devmastery.patterns.data.remote.PatternProblemDto
import com.example.devmastery.patterns.data.remote.PatternSummaryDto

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PatternsScreen(
    onBack: () -> Unit,
    viewModel: PatternsViewModel = viewModel(factory = PatternsViewModel.Factory)
) {
    val state by viewModel.state.collectAsState()
    val detail by viewModel.detail.collectAsState()
    val context = LocalContext.current

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("LeetCode Patterns") },
                navigationIcon = { TextButton(onClick = onBack) { Text("Back") } },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer,
                    titleContentColor = MaterialTheme.colorScheme.onPrimaryContainer,
                )
            )
        }
    ) { padding ->
        Box(
            modifier = Modifier.fillMaxSize().padding(padding),
            contentAlignment = Alignment.Center
        ) {
            when (val s = state) {
                is PatternsState.Loading -> CircularProgressIndicator()
                is PatternsState.Error -> Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.padding(24.dp)
                ) {
                    Text(s.message, color = MaterialTheme.colorScheme.error)
                    Spacer(Modifier.height(12.dp))
                    Button(onClick = { viewModel.load() }) { Text("Retry") }
                }
                is PatternsState.Success -> LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(s.patterns, key = { it.id }) { pattern ->
                        PatternCard(pattern) { viewModel.openDetail(pattern.slug) }
                    }
                }
            }
        }
    }

    // Detail sheet
    detail?.let { d ->
        ModalBottomSheet(onDismissRequest = { viewModel.closeDetail() }) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp)
                    .padding(bottom = 24.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(d.name, style = MaterialTheme.typography.headlineSmall)
                    Spacer(Modifier.width(8.dp))
                    d.difficultyLevel?.let { DifficultyChip(it) }
                }
                if (!d.description.isNullOrBlank()) {
                    Spacer(Modifier.height(8.dp))
                    Text(d.description, style = MaterialTheme.typography.bodyMedium)
                }
                if (d.problems.isNotEmpty()) {
                    Spacer(Modifier.height(16.dp))
                    Text("Practice problems", style = MaterialTheme.typography.titleMedium)
                    Spacer(Modifier.height(8.dp))
                    d.problems.forEach { problem ->
                        ProblemRow(problem) {
                            problem.leetcodeUrl?.takeIf { it.isNotBlank() }?.let { url ->
                                context.startActivity(Intent(Intent.ACTION_VIEW, url.toUri()))
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun PatternCard(pattern: PatternSummaryDto, onClick: () -> Unit) {
    Card(modifier = Modifier.fillMaxWidth(), onClick = onClick) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    pattern.name,
                    style = MaterialTheme.typography.titleMedium,
                    modifier = Modifier.weight(1f)
                )
                pattern.difficultyLevel?.let { DifficultyChip(it) }
            }
            if (!pattern.description.isNullOrBlank()) {
                Spacer(Modifier.height(4.dp))
                Text(
                    pattern.description,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

@Composable
private fun ProblemRow(problem: PatternProblemDto, onOpen: () -> Unit) {
    ListItem(
        headlineContent = { Text(problem.title) },
        supportingContent = problem.difficulty?.let { { Text(it) } },
        trailingContent = {
            if (!problem.leetcodeUrl.isNullOrBlank()) {
                TextButton(onClick = onOpen) { Text("Open") }
            }
        }
    )
}

@Composable
private fun DifficultyChip(level: String) {
    AssistChip(onClick = {}, label = { Text(level) }, enabled = false)
}


