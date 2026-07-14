package com.devmastery.app.review.presentation

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle

@Composable
fun SpacedReviewScreen(
    viewModel: ReviewViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Spaced Review") },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background,
                ),
            )
        }
    ) { padding ->
        Box(Modifier.fillMaxSize().padding(padding)) {
            when (val s = state) {
                is ReviewUiState.Loading -> CircularProgressIndicator(Modifier.align(Alignment.Center))

                is ReviewUiState.Empty -> EmptyReviewState()

                is ReviewUiState.Done -> DoneState(onRestart = { viewModel.loadReviews() })

                is ReviewUiState.Error -> Column(
                    Modifier.align(Alignment.Center),
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    Text(s.msg, color = MaterialTheme.colorScheme.error)
                    Spacer(Modifier.height(12.dp))
                    Button(onClick = { viewModel.loadReviews() }) { Text("Retry") }
                }

                is ReviewUiState.Success -> ReviewCard(
                    item     = s.items[s.currentIndex],
                    current  = s.currentIndex + 1,
                    total    = s.items.size,
                    onRate   = { rating -> viewModel.submitRating(s.items[s.currentIndex].topicId, rating) },
                )
            }
        }
    }
}

@Composable
private fun ReviewCard(
    item: com.devmastery.app.review.data.remote.ReviewItemDto,
    current: Int,
    total: Int,
    onRate: (Int) -> Unit,
) {
    Column(
        modifier              = Modifier
            .fillMaxSize()
            .padding(24.dp),
        verticalArrangement   = Arrangement.SpaceBetween,
    ) {
        Column {
            LinearProgressIndicator(
                progress  = { current.toFloat() / total },
                modifier  = Modifier.fillMaxWidth().height(4.dp),
            )
            Spacer(Modifier.height(8.dp))
            Text(
                "$current / $total",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }

        Surface(
            modifier       = Modifier.fillMaxWidth(),
            shape          = RoundedCornerShape(20.dp),
            color          = MaterialTheme.colorScheme.surface,
            tonalElevation = 4.dp,
        ) {
            Column(
                modifier              = Modifier.padding(32.dp),
                horizontalAlignment   = Alignment.CenterHorizontally,
                verticalArrangement   = Arrangement.spacedBy(12.dp),
            ) {
                Text(
                    "Topic",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                Text(
                    item.topicSlug?.replace("-", " ")?.split(" ")
                        ?.joinToString(" ") { it.replaceFirstChar(Char::uppercase) } ?: item.topicId,
                    style     = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Bold,
                    textAlign  = TextAlign.Center,
                )
                Text(
                    "Due: ${item.dueDate.take(10)}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }

        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(
                "How well did you recall this?",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Spacer(Modifier.height(12.dp))
            Row(
                modifier              = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                listOf(
                    1 to "😬", 2 to "😕", 3 to "😐", 4 to "😊", 5 to "🎯",
                ).forEach { (rating, emoji) ->
                    ElevatedButton(
                        onClick  = { onRate(rating) },
                        modifier = Modifier.weight(1f),
                    ) {
                        Text("$emoji\n$rating", textAlign = TextAlign.Center)
                    }
                }
            }
        }
    }
}

@Composable
private fun EmptyReviewState() {
    Column(
        modifier              = Modifier.fillMaxSize(),
        horizontalAlignment   = Alignment.CenterHorizontally,
        verticalArrangement   = Arrangement.Center,
    ) {
        Text("🎉", style = MaterialTheme.typography.displayLarge)
        Spacer(Modifier.height(16.dp))
        Text("All caught up!", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(8.dp))
        Text("No reviews due. Keep learning!", color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
}

@Composable
private fun DoneState(onRestart: () -> Unit) {
    Column(
        modifier              = Modifier.fillMaxSize(),
        horizontalAlignment   = Alignment.CenterHorizontally,
        verticalArrangement   = Arrangement.Center,
    ) {
        Text("✅", style = MaterialTheme.typography.displayLarge)
        Spacer(Modifier.height(16.dp))
        Text("Session complete!", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(8.dp))
        Text("Great work — see you next time.", color = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(Modifier.height(24.dp))
        OutlinedButton(onClick = onRestart) { Text("Check for more") }
    }
}
