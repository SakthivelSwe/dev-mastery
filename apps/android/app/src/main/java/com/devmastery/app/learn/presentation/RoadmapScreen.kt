package com.devmastery.app.learn.presentation

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.devmastery.app.learn.data.remote.RoadmapLevelDto
import com.devmastery.app.learn.data.remote.RoadmapTopicDto

@Composable
fun RoadmapScreen(
    pathSlug: String,
    onBack: () -> Unit,
    onTopicClick: (String) -> Unit,
    viewModel: ContentViewModel = hiltViewModel(),
) {
    LaunchedEffect(pathSlug) { viewModel.loadRoadmap(pathSlug) }
    val state by viewModel.roadmapState.collectAsStateWithLifecycle()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Roadmap") },
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
            is RoadmapUiState.Loading -> Box(
                Modifier.fillMaxSize().padding(padding),
                contentAlignment = Alignment.Center,
            ) { CircularProgressIndicator() }

            is RoadmapUiState.Error -> Box(
                Modifier.fillMaxSize().padding(padding),
                contentAlignment = Alignment.Center,
            ) { Text(s.msg, color = MaterialTheme.colorScheme.error) }

            is RoadmapUiState.Success -> LazyColumn(
                modifier       = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(
                    start = 16.dp, end = 16.dp,
                    top   = padding.calculateTopPadding() + 8.dp,
                    bottom = 16.dp,
                ),
                verticalArrangement = Arrangement.spacedBy(20.dp),
            ) {
                items(s.roadmap.levels) { level ->
                    RoadmapLevelSection(level = level, onTopicClick = onTopicClick)
                }
            }
        }
    }
}

@Composable
private fun RoadmapLevelSection(level: RoadmapLevelDto, onTopicClick: (String) -> Unit) {
    Column {
        Row(
            verticalAlignment     = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            Surface(
                shape = CircleShape,
                color = MaterialTheme.colorScheme.primaryContainer,
            ) {
                Text(
                    "L${level.level}",
                    style    = MaterialTheme.typography.labelLarge,
                    color    = MaterialTheme.colorScheme.onPrimaryContainer,
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                )
            }
            Text(
                level.label,
                style      = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
            )
            Spacer(Modifier.weight(1f))
            Text(
                "${level.completedCount}/${level.topicCount}",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
        Spacer(Modifier.height(10.dp))
        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
            level.topics.forEach { topic ->
                RoadmapTopicRow(topic = topic, onClick = { onTopicClick(topic.slug) })
            }
        }
    }
}

@Composable
private fun RoadmapTopicRow(topic: RoadmapTopicDto, onClick: () -> Unit) {
    Surface(
        modifier       = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        shape          = RoundedCornerShape(10.dp),
        color          = MaterialTheme.colorScheme.surface,
        tonalElevation = 1.dp,
    ) {
        Row(
            modifier              = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment     = Alignment.CenterVertically,
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(topic.title, style = MaterialTheme.typography.bodyLarge)
                Text(
                    "${topic.estimatedMins} min",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
            if (topic.completed) {
                Icon(
                    Icons.Default.CheckCircle,
                    contentDescription = "Completed",
                    tint   = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.size(20.dp),
                )
            }
        }
    }
}
