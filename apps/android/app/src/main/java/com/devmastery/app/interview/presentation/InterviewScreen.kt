package com.devmastery.app.interview.presentation

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.Stop
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.devmastery.app.interview.data.remote.InterviewScoreCard

@Composable
fun InterviewScreen(
    onOpenHistory: () -> Unit,
    viewModel: InterviewViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    if (state.scoreCard != null) {
        ScoreCardScreen(
            scoreCard = state.scoreCard!!,
            onDone    = { viewModel.resetInterview() },
        )
        return
    }

    if (!state.started) {
        InterviewSetupScreen(
            topicSlug    = state.topicSlug,
            level        = state.level,
            onSlugChange = viewModel::setTopicSlug,
            onLevelChange= viewModel::setLevel,
            onStart      = viewModel::startInterview,
            onHistory    = onOpenHistory,
        )
    } else {
        InterviewChatScreen(
            state     = state,
            onSend    = viewModel::sendMessage,
            onFinish  = viewModel::finishAndGrade,
        )
    }
}

// ── Setup Screen ──────────────────────────────────────────────────────────────

@Composable
private fun InterviewSetupScreen(
    topicSlug: String,
    level: String,
    onSlugChange: (String) -> Unit,
    onLevelChange: (String) -> Unit,
    onStart: () -> Unit,
    onHistory: () -> Unit,
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Mock Interview") },
                actions = {
                    IconButton(onClick = onHistory) {
                        Icon(Icons.Default.History, "History")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background
                ),
            )
        }
    ) { padding ->
        Column(
            modifier            = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(24.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            Text("Configure your session", style = MaterialTheme.typography.titleMedium)

            OutlinedTextField(
                value         = topicSlug,
                onValueChange = onSlugChange,
                label         = { Text("Topic slug") },
                modifier      = Modifier.fillMaxWidth(),
                singleLine    = true,
            )

            Text("Seniority level", style = MaterialTheme.typography.labelMedium)
            listOf("junior", "mid", "senior", "staff").let { levels ->
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    levels.forEach { l ->
                        FilterChip(
                            selected = level == l,
                            onClick  = { onLevelChange(l) },
                            label    = { Text(l.replaceFirstChar(Char::uppercase)) },
                        )
                    }
                }
            }

            Spacer(Modifier.weight(1f))

            Button(
                onClick  = onStart,
                modifier = Modifier.fillMaxWidth().height(52.dp),
            ) {
                Text("Start Interview", style = MaterialTheme.typography.titleMedium)
            }
        }
    }
}

// ── Chat Screen ───────────────────────────────────────────────────────────────

@Composable
private fun InterviewChatScreen(
    state: InterviewUiState,
    onSend: (String) -> Unit,
    onFinish: () -> Unit,
) {
    val listState = rememberLazyListState()
    var input by remember { mutableStateOf("") }

    LaunchedEffect(state.messages.size) {
        if (state.messages.isNotEmpty()) {
            listState.animateScrollToItem(state.messages.lastIndex)
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Interview · ${state.level.replaceFirstChar(Char::uppercase)}") },
                actions = {
                    TextButton(onClick = onFinish) {
                        Icon(Icons.Default.Stop, null, Modifier.size(16.dp))
                        Spacer(Modifier.width(4.dp))
                        Text("Finish")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background
                ),
            )
        },
        bottomBar = {
            Row(
                modifier              = Modifier
                    .fillMaxWidth()
                    .padding(12.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment     = Alignment.CenterVertically,
            ) {
                OutlinedTextField(
                    value         = input,
                    onValueChange = { input = it },
                    modifier      = Modifier.weight(1f),
                    placeholder   = { Text("Your answer…") },
                    keyboardOptions = KeyboardOptions(imeAction = ImeAction.Send),
                    keyboardActions = KeyboardActions(onSend = {
                        if (input.isNotBlank() && !state.isLoading) {
                            onSend(input); input = ""
                        }
                    }),
                )
                IconButton(
                    onClick  = {
                        if (input.isNotBlank() && !state.isLoading) {
                            onSend(input); input = ""
                        }
                    },
                    enabled = !state.isLoading && input.isNotBlank(),
                ) {
                    Icon(Icons.AutoMirrored.Filled.Send, "Send")
                }
            }
        }
    ) { padding ->
        LazyColumn(
            state          = listState,
            modifier       = Modifier
                .fillMaxSize()
                .padding(padding),
            contentPadding = PaddingValues(12.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            items(state.messages) { msg ->
                ChatBubble(msg)
            }
        }
    }
}

@Composable
private fun ChatBubble(msg: ChatMessage) {
    val isUser = msg.role == "user"
    Row(
        modifier              = Modifier.fillMaxWidth(),
        horizontalArrangement = if (isUser) Arrangement.End else Arrangement.Start,
    ) {
        Surface(
            shape  = RoundedCornerShape(
                topStart    = if (isUser) 16.dp else 4.dp,
                topEnd      = if (isUser) 4.dp else 16.dp,
                bottomStart = 16.dp,
                bottomEnd   = 16.dp,
            ),
            color  = if (isUser) MaterialTheme.colorScheme.primary
                     else MaterialTheme.colorScheme.surfaceVariant,
            modifier = Modifier.widthIn(max = 300.dp),
        ) {
            Text(
                text     = if (msg.isStreaming && msg.content.isBlank()) "…" else msg.content,
                color    = if (isUser) MaterialTheme.colorScheme.onPrimary
                           else MaterialTheme.colorScheme.onSurfaceVariant,
                style    = MaterialTheme.typography.bodyMedium,
                modifier = Modifier.padding(12.dp),
            )
        }
    }
}

// ── ScoreCard Screen ──────────────────────────────────────────────────────────

@Composable
fun ScoreCardScreen(scoreCard: InterviewScoreCard, onDone: () -> Unit) {
    val verdictColor = when (scoreCard.verdict) {
        "strong_hire" -> MaterialTheme.colorScheme.primary
        "lean_yes"    -> MaterialTheme.colorScheme.tertiary
        else          -> MaterialTheme.colorScheme.error
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Interview Result") },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background
                ),
            )
        }
    ) { padding ->
        LazyColumn(
            modifier       = Modifier.fillMaxSize().padding(padding),
            contentPadding = PaddingValues(20.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            item {
                Surface(
                    shape  = RoundedCornerShape(16.dp),
                    color  = MaterialTheme.colorScheme.surface,
                    modifier = Modifier.fillMaxWidth(),
                ) {
                    Column(
                        modifier            = Modifier.padding(20.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                    ) {
                        Text("Verdict", style = MaterialTheme.typography.labelMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant)
                        Text(
                            scoreCard.verdict.replace("_", " ").uppercase(),
                            style      = MaterialTheme.typography.headlineMedium,
                            fontWeight = FontWeight.Bold,
                            color      = verdictColor,
                        )
                    }
                }
            }
            item {
                ScoreRow("Technical",       scoreCard.technical)
                ScoreRow("Communication",   scoreCard.communication)
                ScoreRow("Problem Solving", scoreCard.problemSolving)
                ScoreRow("Seniority",       scoreCard.seniority)
            }
            if (scoreCard.strengths.isNotEmpty()) {
                item {
                    FeedbackSection("Strengths ✅", scoreCard.strengths, MaterialTheme.colorScheme.primaryContainer)
                }
            }
            if (scoreCard.improvements.isNotEmpty()) {
                item {
                    FeedbackSection("Improvements 📈", scoreCard.improvements, MaterialTheme.colorScheme.errorContainer)
                }
            }
            item {
                Button(onClick = onDone, modifier = Modifier.fillMaxWidth()) {
                    Text("New Interview")
                }
            }
        }
    }
}

@Composable
private fun ScoreRow(label: String, score: Int) {
    Row(
        modifier              = Modifier.fillMaxWidth().padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment     = Alignment.CenterVertically,
    ) {
        Text(label, style = MaterialTheme.typography.bodyMedium)
        Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
            Text("$score/10", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
        }
    }
}

@Composable
private fun FeedbackSection(title: String, items: List<String>, bgColor: androidx.compose.ui.graphics.Color) {
    Surface(
        shape = RoundedCornerShape(12.dp),
        color = bgColor,
        modifier = Modifier.fillMaxWidth(),
    ) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text(title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
            items.forEach { Text("• $it", style = MaterialTheme.typography.bodySmall) }
        }
    }
}
