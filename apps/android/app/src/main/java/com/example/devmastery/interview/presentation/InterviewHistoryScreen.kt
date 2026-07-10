@file:OptIn(ExperimentalMaterial3Api::class)

package com.example.devmastery.interview.presentation

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.devmastery.interview.data.remote.InterviewScoreCardDto
import com.example.devmastery.interview.data.remote.InterviewSessionSummaryDto
import com.example.devmastery.interview.data.remote.TranscriptTurnDto
import dev.jeziellago.compose.markdowntext.MarkdownText

// ─────────────────────────────────────────────────────────────────────
// History list  — /interview/history
// ─────────────────────────────────────────────────────────────────────
@Composable
fun InterviewHistoryScreen(
    onBack: () -> Unit,
    onOpenSession: (String) -> Unit,
    viewModel: InterviewHistoryViewModel = viewModel(factory = InterviewHistoryViewModel.Factory)
) {
    val state by viewModel.history.collectAsState()
    LaunchedEffect(Unit) { viewModel.loadHistory() }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Interview history") },
                navigationIcon = { TextButton(onClick = onBack) { Text("Back") } },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer,
                    titleContentColor = MaterialTheme.colorScheme.onPrimaryContainer,
                )
            )
        }
    ) { padding ->
        Box(Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
            when (val s = state) {
                is InterviewHistoryState.Loading -> CircularProgressIndicator()
                is InterviewHistoryState.Empty -> Text(
                    "No past interviews yet.\nStart one from Mock Interview.",
                    textAlign = TextAlign.Center,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(24.dp)
                )
                is InterviewHistoryState.Error -> Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.padding(24.dp)
                ) {
                    Text(s.message, color = MaterialTheme.colorScheme.error)
                    Spacer(Modifier.height(12.dp))
                    Button(onClick = { viewModel.loadHistory() }) { Text("Retry") }
                }
                is InterviewHistoryState.Success -> LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    items(s.sessions, key = { it.id }) { session ->
                        SessionRow(session) { onOpenSession(session.id) }
                    }
                }
            }
        }
    }
}

@Composable
private fun SessionRow(session: InterviewSessionSummaryDto, onClick: () -> Unit) {
    Card(modifier = Modifier.fillMaxWidth(), onClick = onClick) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    session.topicSlug.replace('-', ' ').replaceFirstChar { it.uppercase() },
                    style = MaterialTheme.typography.titleMedium,
                    modifier = Modifier.weight(1f)
                )
                AssistChip(
                    onClick = {},
                    enabled = false,
                    label = { Text(session.targetLevel.replaceFirstChar { it.uppercase() }) }
                )
            }
            Spacer(Modifier.height(4.dp))
            Text(
                session.startedAt.take(10),
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            if (!session.verdict.isNullOrBlank()) {
                Spacer(Modifier.height(6.dp))
                Text(
                    "Verdict: ${session.verdict}",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.primary
                )
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────
// Session detail  — /interview/history/{id}
// ─────────────────────────────────────────────────────────────────────
@Composable
fun InterviewDetailScreen(
    sessionId: String,
    onBack: () -> Unit,
    viewModel: InterviewHistoryViewModel = viewModel(factory = InterviewHistoryViewModel.Factory)
) {
    val state by viewModel.detail.collectAsState()
    LaunchedEffect(sessionId) { viewModel.loadDetail(sessionId) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    val title = (state as? InterviewDetailState.Success)?.detail?.summary?.topicSlug
                        ?.replace('-', ' ')?.replaceFirstChar { it.uppercase() }
                        ?: "Session"
                    Text(title)
                },
                navigationIcon = { TextButton(onClick = onBack) { Text("Back") } },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer,
                    titleContentColor = MaterialTheme.colorScheme.onPrimaryContainer,
                )
            )
        }
    ) { padding ->
        Box(Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
            when (val s = state) {
                is InterviewDetailState.Loading -> CircularProgressIndicator()
                is InterviewDetailState.Error -> Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.padding(24.dp)
                ) {
                    Text(s.message, color = MaterialTheme.colorScheme.error)
                    Spacer(Modifier.height(12.dp))
                    Button(onClick = { viewModel.loadDetail(sessionId) }) { Text("Retry") }
                }
                is InterviewDetailState.Success -> DetailContent(s.detail.summary, s.detail.transcript, s.detail.scoreCard)
            }
        }
    }
}

@Composable
private fun DetailContent(
    summary: InterviewSessionSummaryDto,
    transcript: List<TranscriptTurnDto>,
    scoreCard: InterviewScoreCardDto?
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        item {
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        "Target level: ${summary.targetLevel.replaceFirstChar { it.uppercase() }}",
                        style = MaterialTheme.typography.bodyMedium
                    )
                    Text(
                        "Started: ${summary.startedAt.take(19).replace('T', ' ')}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    summary.endedAt?.let {
                        Text(
                            "Ended: ${it.take(19).replace('T', ' ')}",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
        }

        scoreCard?.let { card ->
            item { ScoreCardBlock(card) }
        }

        item {
            Text(
                "Transcript",
                style = MaterialTheme.typography.titleMedium,
                modifier = Modifier.padding(top = 8.dp)
            )
        }
        items(transcript.size) { index ->
            TranscriptBubble(transcript[index])
        }
    }
}

@Composable
private fun ScoreCardBlock(card: InterviewScoreCardDto) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.secondaryContainer
        )
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text("Verdict: ${card.verdict}", fontWeight = FontWeight.Bold,
                style = MaterialTheme.typography.titleMedium)
            Spacer(Modifier.height(8.dp))
            Text("Technical: ${card.technical}/10")
            Text("Communication: ${card.communication}/10")
            Text("Problem solving: ${card.problemSolving}/10")
            Text("Seniority: ${card.seniority}/10")
            if (card.strengths.isNotEmpty()) {
                Spacer(Modifier.height(8.dp))
                Text("Strengths", fontWeight = FontWeight.SemiBold)
                card.strengths.forEach { Text("• $it") }
            }
            if (card.improvements.isNotEmpty()) {
                Spacer(Modifier.height(8.dp))
                Text("Improvements", fontWeight = FontWeight.SemiBold)
                card.improvements.forEach { Text("• $it") }
            }
        }
    }
}

@Composable
private fun TranscriptBubble(turn: TranscriptTurnDto) {
    val isUser = turn.role.equals("user", ignoreCase = true)
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = if (isUser) Arrangement.End else Arrangement.Start
    ) {
        Box(
            modifier = Modifier
                .widthIn(max = 320.dp)
                .clip(RoundedCornerShape(14.dp))
                .background(
                    if (isUser) MaterialTheme.colorScheme.primary
                    else MaterialTheme.colorScheme.surfaceVariant
                )
                .padding(horizontal = 14.dp, vertical = 10.dp)
        ) {
            val color =
                if (isUser) MaterialTheme.colorScheme.onPrimary
                else MaterialTheme.colorScheme.onSurfaceVariant
            if (isUser) Text(turn.content, color = color)
            else MarkdownText(markdown = turn.content.ifBlank { "…" }, color = color)
        }
    }
}

