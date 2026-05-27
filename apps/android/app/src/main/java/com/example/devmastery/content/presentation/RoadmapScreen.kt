package com.example.devmastery.content.presentation

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
// Removed Icons import
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.devmastery.content.data.remote.LevelRoadmapDto
import com.example.devmastery.content.data.remote.TopicRoadmapDto

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RoadmapScreen(
    pathSlug: String,
    viewModel: RoadmapViewModel,
    onTopicClick: (String, String) -> Unit,
    onNavigateBack: () -> Unit
) {
    LaunchedEffect(pathSlug) {
        viewModel.loadRoadmap(pathSlug)
    }

    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Roadmap") },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color(0xFF0d1117),
                    titleContentColor = Color.White
                )
            )
        },
        containerColor = Color(0xFF0d1117)
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            when (val state = uiState) {
                is RoadmapUiState.Loading -> {
                    CircularProgressIndicator(
                        modifier = Modifier.align(Alignment.Center),
                        color = Color(0xFF58a6ff)
                    )
                }
                is RoadmapUiState.Error -> {
                    Text(
                        text = state.message,
                        color = Color.Red,
                        modifier = Modifier.align(Alignment.Center)
                    )
                }
                is RoadmapUiState.Success -> {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        item {
                            Text(
                                text = state.data.path.title,
                                style = MaterialTheme.typography.headlineMedium,
                                color = Color.White,
                                fontWeight = FontWeight.Bold
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "Total Topics: ${state.data.path.totalTopics}",
                                color = Color(0xFF8b949e)
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                        }

                        items(state.data.levels) { level ->
                            LevelSection(level = level, pathSlug = pathSlug, onTopicClick = onTopicClick)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun LevelSection(
    level: LevelRoadmapDto,
    pathSlug: String,
    onTopicClick: (String, String) -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, Color(0xFF30363D), RoundedCornerShape(12.dp))
            .background(Color(0xFF161b22), RoundedCornerShape(12.dp))
            .padding(16.dp)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.fillMaxWidth()
        ) {
            Box(
                modifier = Modifier
                    .size(32.dp)
                    .background(Color(0xFF21262D), RoundedCornerShape(16.dp)),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = level.level.toString(),
                    color = Color(0xFF8b949e),
                    fontWeight = FontWeight.Bold
                )
            }
            Spacer(modifier = Modifier.width(12.dp))
            Text(
                text = "Level ${level.level}: ${level.label}",
                color = Color.White,
                fontWeight = FontWeight.Bold,
                style = MaterialTheme.typography.titleMedium
            )
        }
        
        Spacer(modifier = Modifier.height(12.dp))

        // Progress bar
        val progress = if (level.topicCount > 0) level.completedCount.toFloat() / level.topicCount else 0f
        LinearProgressIndicator(
            progress = { progress },
            modifier = Modifier
                .fillMaxWidth()
                .height(4.dp),
            color = Color(0xFF6DB33F),
            trackColor = Color(0xFF21262D)
        )
        Spacer(modifier = Modifier.height(16.dp))

        // Topics list
        level.topics.forEach { topic ->
            TopicCard(topic = topic, onClick = { onTopicClick(pathSlug, topic.slug) })
            Spacer(modifier = Modifier.height(8.dp))
        }
    }
}

@Composable
fun TopicCard(
    topic: TopicRoadmapDto,
    onClick: () -> Unit
) {
    val borderColor = if (topic.completed) Color(0xFF6DB33F) else Color(0xFF30363D)
    val bgColor = Color(0xFF0d1117)
    
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, borderColor, RoundedCornerShape(8.dp))
            .background(bgColor, RoundedCornerShape(8.dp))
            .clickable(onClick = onClick)
            .padding(12.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = topic.title,
                color = if (topic.completed) Color(0xFF6DB33F) else Color.White,
                fontWeight = FontWeight.SemiBold
            )
            Spacer(modifier = Modifier.height(4.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = "${topic.estimatedMins} mins",
                    color = Color(0xFF8b949e),
                    style = MaterialTheme.typography.bodySmall
                )
                if (topic.hasVisualizer) {
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "• Visualizer",
                        color = Color(0xFF58a6ff),
                        style = MaterialTheme.typography.bodySmall
                    )
                }
                if (topic.hasCodeLab) {
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "• Code Lab",
                        color = Color(0xFFe3b341),
                        style = MaterialTheme.typography.bodySmall
                    )
                }
            }
        }
        
        if (topic.completed) {
            Text(
                text = "✓",
                color = Color(0xFF6DB33F),
                fontWeight = FontWeight.Bold,
                style = MaterialTheme.typography.titleLarge
            )
        }
    }
}
