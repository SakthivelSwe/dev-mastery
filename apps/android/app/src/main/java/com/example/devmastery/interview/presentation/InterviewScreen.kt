@file:OptIn(ExperimentalMaterial3Api::class)

package com.example.devmastery.interview.presentation

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.devmastery.ai.presentation.ChatMessage
import com.example.devmastery.interview.data.remote.InterviewScoreCardDto
import dev.jeziellago.compose.markdowntext.MarkdownText

@Composable
fun InterviewScreen(
    onBack: () -> Unit,
    onOpenHistory: () -> Unit = {},
    viewModel: InterviewViewModel = viewModel(factory = InterviewViewModel.Factory)
) {
    val state by viewModel.state.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Mock Interview") },
                navigationIcon = { TextButton(onClick = onBack) { Text("Back") } },
                actions = {
                    TextButton(onClick = onOpenHistory) { Text("History") }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer,
                    titleContentColor = MaterialTheme.colorScheme.onPrimaryContainer,
                )
            )
        }
    ) { padding ->
        Box(modifier = Modifier.fillMaxSize().padding(padding)) {
            when (state.phase) {
                InterviewPhase.SETUP -> SetupForm(
                    topicSlug = state.topicSlug,
                    level = state.level,
                    onTopicChange = viewModel::setTopic,
                    onLevelChange = viewModel::setLevel,
                    onStart = viewModel::start
                )
                InterviewPhase.INTERVIEWING, InterviewPhase.SCORED -> InterviewChat(
                    state = state,
                    onSend = viewModel::send,
                    onFinish = viewModel::finish,
                    onReset = viewModel::reset
                )
            }
        }
    }
}

@Composable
private fun SetupForm(
    topicSlug: String,
    level: String,
    onTopicChange: (String) -> Unit,
    onLevelChange: (String) -> Unit,
    onStart: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text(
            "Practice against an AI interviewer that asks one question at a time, probes your answers, and scores you at the end.",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )

        OutlinedTextField(
            value = topicSlug,
            onValueChange = onTopicChange,
            label = { Text("Topic slug") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth()
        )

        Text("Target level", style = MaterialTheme.typography.labelLarge)
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            listOf("junior", "mid", "senior", "staff").forEach { l ->
                FilterChip(
                    selected = level == l,
                    onClick = { onLevelChange(l) },
                    label = { Text(l.replaceFirstChar { it.uppercase() }) }
                )
            }
        }

        Button(onClick = onStart, modifier = Modifier.fillMaxWidth()) {
            Text("Start interview")
        }
    }
}

@Composable
private fun InterviewChat(
    state: InterviewUiState,
    onSend: (String) -> Unit,
    onFinish: () -> Unit,
    onReset: () -> Unit
) {
    var input by remember { mutableStateOf("") }
    val listState = rememberLazyListState()
    val visibleMessages = state.messages.filterNot { it.content.startsWith("[SYSTEM PRIMER") }

    LaunchedEffect(visibleMessages.size, visibleMessages.lastOrNull()?.content, state.scoreCard) {
        val total = visibleMessages.size + (if (state.scoreCard != null) 1 else 0)
        if (total > 0) listState.animateScrollToItem(total - 1)
    }

    Column(modifier = Modifier.fillMaxSize()) {
        LazyColumn(
            state = listState,
            modifier = Modifier.weight(1f).fillMaxWidth(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            items(visibleMessages.size) { index ->
                Bubble(visibleMessages[index])
            }
            if (state.isLoading) {
                item {
                    Text(
                        "Interviewer is typing…",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
            state.scoreCard?.let { item { ScoreCard(it) } }
        }

        Surface(tonalElevation = 3.dp) {
            Column(modifier = Modifier.padding(12.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    OutlinedTextField(
                        value = input,
                        onValueChange = { input = it },
                        placeholder = { Text("Your answer…") },
                        modifier = Modifier.weight(1f),
                        maxLines = 4
                    )
                    Spacer(Modifier.width(8.dp))
                    Button(
                        onClick = { onSend(input); input = "" },
                        enabled = input.isNotBlank() && !state.isLoading
                    ) { Text("Send") }
                }
                Spacer(Modifier.height(8.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedButton(
                        onClick = onFinish,
                        enabled = !state.isLoading && visibleMessages.size >= 2,
                        modifier = Modifier.weight(1f)
                    ) { Text("Finish & score") }
                    OutlinedButton(onClick = onReset, modifier = Modifier.weight(1f)) {
                        Text("New interview")
                    }
                }
                if (state.saveStatus == SaveStatus.SAVING) {
                    Text("Saving transcript…", style = MaterialTheme.typography.labelSmall)
                } else if (state.saveStatus == SaveStatus.ERROR) {
                    Text(
                        "Save failed.",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.error
                    )
                }
            }
        }
    }
}

@Composable
private fun Bubble(message: ChatMessage) {
    val isUser = message.role == ChatMessage.Role.USER
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = if (isUser) Arrangement.End else Arrangement.Start
    ) {
        Box(
            modifier = Modifier
                .widthIn(max = 300.dp)
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
            if (isUser) Text(message.content, color = color)
            else MarkdownText(markdown = message.content.ifBlank { "…" }, color = color)
        }
    }
}

@Composable
private fun ScoreCard(card: InterviewScoreCardDto) {
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

