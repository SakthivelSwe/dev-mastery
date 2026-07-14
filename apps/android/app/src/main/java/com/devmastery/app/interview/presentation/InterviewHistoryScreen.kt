package com.devmastery.app.interview.presentation

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.devmastery.app.interview.data.remote.InterviewSessionSummary

@Composable
fun InterviewHistoryScreen(
    onBack: () -> Unit,
    onOpenSession: (String) -> Unit,
    viewModel: InterviewViewModel = hiltViewModel(),
) {
    LaunchedEffect(Unit) { viewModel.loadHistory() }
    val state by viewModel.historyState.collectAsStateWithLifecycle()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Interview History") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background
                ),
            )
        }
    ) { padding ->
        when (val s = state) {
            is HistoryUiState.Loading -> Box(
                Modifier.fillMaxSize().padding(padding),
                contentAlignment = Alignment.Center,
            ) { CircularProgressIndicator() }

            is HistoryUiState.Error -> Box(
                Modifier.fillMaxSize().padding(padding),
                contentAlignment = Alignment.Center,
            ) { Text(s.msg, color = MaterialTheme.colorScheme.error) }

            is HistoryUiState.Success -> if (s.sessions.isEmpty()) {
                Box(Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                    Text("No past interviews yet.", color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            } else {
                LazyColumn(
                    modifier       = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(
                        start = 16.dp, end = 16.dp,
                        top   = padding.calculateTopPadding() + 8.dp,
                        bottom = 16.dp,
                    ),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    items(s.sessions) { session ->
                        HistoryRow(session = session, onClick = { onOpenSession(session.id) })
                    }
                }
            }
        }
    }
}

@Composable
private fun HistoryRow(session: InterviewSessionSummary, onClick: () -> Unit) {
    val verdictColor = when (session.verdict) {
        "strong_hire" -> MaterialTheme.colorScheme.primary
        "lean_yes"    -> MaterialTheme.colorScheme.tertiary
        null          -> MaterialTheme.colorScheme.onSurfaceVariant
        else          -> MaterialTheme.colorScheme.error
    }

    Surface(
        modifier       = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        shape          = RoundedCornerShape(12.dp),
        color          = MaterialTheme.colorScheme.surface,
        tonalElevation = 1.dp,
    ) {
        Row(
            modifier              = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment     = Alignment.CenterVertically,
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    session.topicSlug.replace("-", " ").split(" ")
                        .joinToString(" ") { it.replaceFirstChar(Char::uppercase) },
                    style = MaterialTheme.typography.titleMedium,
                )
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(
                        session.targetLevel.replaceFirstChar(Char::uppercase),
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                    if (session.verdict != null) {
                        Text(
                            "•",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                        Text(
                            session.verdict.replace("_", " ").uppercase(),
                            style = MaterialTheme.typography.labelSmall,
                            color = verdictColor,
                        )
                    }
                }
                Text(
                    session.startedAt.take(10),
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
            Icon(
                Icons.AutoMirrored.Filled.ArrowForward,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.size(18.dp),
            )
        }
    }
}
