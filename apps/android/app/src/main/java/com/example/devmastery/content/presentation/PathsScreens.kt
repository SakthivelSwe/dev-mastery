@file:OptIn(ExperimentalMaterial3Api::class)

package com.example.devmastery.content.presentation

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.devmastery.content.data.remote.LearningPathDto
import com.example.devmastery.content.data.remote.LevelRoadmapDto
import com.example.devmastery.content.data.remote.PathRoadmapResponse
import com.example.devmastery.content.data.remote.TopicRoadmapDto

// ─────────────────────────────────────────────────────────────────────
// 1) Paths list — /paths
// ─────────────────────────────────────────────────────────────────────
@Composable
fun PathsListScreen(
    onBack: () -> Unit,
    onOpenPath: (String) -> Unit,
    viewModel: PathsViewModel = viewModel(factory = PathsViewModel.Factory)
) {
    val state by viewModel.list.collectAsState()
    LaunchedEffect(Unit) { viewModel.loadAllPaths() }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Learning paths") },
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
                is PathsListState.Loading -> CircularProgressIndicator()
                is PathsListState.Error -> Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.padding(24.dp)
                ) {
                    Text(s.message, color = MaterialTheme.colorScheme.error)
                    Spacer(Modifier.height(12.dp))
                    Button(onClick = { viewModel.loadAllPaths() }) { Text("Retry") }
                }
                is PathsListState.Success -> LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(s.paths, key = { it.id }) { path ->
                        Card(modifier = Modifier.fillMaxWidth(), onClick = { onOpenPath(path.slug) }) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Text(path.title, style = MaterialTheme.typography.titleMedium)
                                path.description?.let {
                                    Spacer(Modifier.height(4.dp))
                                    Text(
                                        it,
                                        style = MaterialTheme.typography.bodySmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                                Spacer(Modifier.height(8.dp))
                                Text(
                                    "${path.totalTopics} topics",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = MaterialTheme.colorScheme.primary
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────
// 2) Path overview — /paths/{slug}
// ─────────────────────────────────────────────────────────────────────
@Composable
fun PathOverviewScreen(
    pathSlug: String,
    onBack: () -> Unit,
    onOpenRoadmap: (String) -> Unit,
    onOpenTopic: (String) -> Unit,
    viewModel: PathsViewModel = viewModel(factory = PathsViewModel.Factory)
) {
    val state by viewModel.overview.collectAsState()
    LaunchedEffect(pathSlug) { viewModel.loadPath(pathSlug) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text((state as? PathOverviewState.Success)?.path?.title ?: "Path") },
                navigationIcon = { TextButton(onClick = onBack) { Text("Back") } },
                actions = {
                    TextButton(onClick = { onOpenRoadmap(pathSlug) }) { Text("Roadmap") }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer,
                    titleContentColor = MaterialTheme.colorScheme.onPrimaryContainer,
                )
            )
        }
    ) { padding ->
        Box(Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
            when (val s = state) {
                is PathOverviewState.Loading -> CircularProgressIndicator()
                is PathOverviewState.Error -> Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.padding(24.dp)
                ) {
                    Text(s.message, color = MaterialTheme.colorScheme.error)
                    Spacer(Modifier.height(12.dp))
                    Button(onClick = { viewModel.loadPath(pathSlug) }) { Text("Retry") }
                }
                is PathOverviewState.Success -> {
                    val path = s.path
                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        item {
                            Card(modifier = Modifier.fillMaxWidth()) {
                                Column(modifier = Modifier.padding(16.dp)) {
                                    Text(path.title, style = MaterialTheme.typography.headlineSmall)
                                    path.description?.let {
                                        Spacer(Modifier.height(6.dp))
                                        Text(it, style = MaterialTheme.typography.bodyMedium)
                                    }
                                    Spacer(Modifier.height(8.dp))
                                    Text(
                                        "${path.totalTopics} topics",
                                        style = MaterialTheme.typography.labelSmall,
                                        color = MaterialTheme.colorScheme.primary
                                    )
                                }
                            }
                            Spacer(Modifier.height(8.dp))
                            Text("Topics", style = MaterialTheme.typography.titleMedium)
                        }
                        items(path.topics, key = { it.id }) { topic ->
                            ListItem(
                                headlineContent = { Text(topic.title) },
                                supportingContent = { Text("Level ${topic.level}") },
                                trailingContent = {
                                    TextButton(onClick = { onOpenTopic(topic.slug) }) { Text("Open") }
                                }
                            )
                            HorizontalDivider()
                        }
                    }
                }
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────
// 3) Roadmap — /paths/{slug}/roadmap  (per-user completion flags)
// ─────────────────────────────────────────────────────────────────────
@Composable
fun RoadmapScreen(
    pathSlug: String,
    onBack: () -> Unit,
    onOpenTopic: (String) -> Unit,
    viewModel: PathsViewModel = viewModel(factory = PathsViewModel.Factory)
) {
    val state by viewModel.roadmap.collectAsState()
    LaunchedEffect(pathSlug) { viewModel.loadRoadmap(pathSlug) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text((state as? RoadmapState.Success)?.roadmap?.path?.title ?: "Roadmap") },
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
                is RoadmapState.Loading -> CircularProgressIndicator()
                is RoadmapState.Error -> Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.padding(24.dp)
                ) {
                    Text(s.message, color = MaterialTheme.colorScheme.error)
                    Spacer(Modifier.height(12.dp))
                    Button(onClick = { viewModel.loadRoadmap(pathSlug) }) { Text("Retry") }
                }
                is RoadmapState.Success -> RoadmapContent(s.roadmap, onOpenTopic)
            }
        }
    }
}

@Composable
private fun RoadmapContent(roadmap: PathRoadmapResponse, onOpenTopic: (String) -> Unit) {
    val totalCompleted = roadmap.levels.sumOf { it.completedCount }
    val total = roadmap.levels.sumOf { it.topicCount }
    val pctFloat = if (total > 0) totalCompleted.toFloat() / total else 0f

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Progress", style = MaterialTheme.typography.titleMedium)
                    Spacer(Modifier.height(8.dp))
                    LinearProgressIndicator(
                        progress = { pctFloat.coerceIn(0f, 1f) },
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(Modifier.height(6.dp))
                    Text(
                        "$totalCompleted / $total topics",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }

        roadmap.levels.forEach { level ->
            item {
                Text(
                    "${level.label}  ·  ${level.completedCount}/${level.topicCount}",
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier.padding(top = 8.dp)
                )
            }
            items(level.topics, key = { it.slug }) { topic ->
                RoadmapTopicRow(topic, onOpenTopic)
            }
        }
    }
}

@Composable
private fun RoadmapTopicRow(topic: TopicRoadmapDto, onOpenTopic: (String) -> Unit) {
    Card(modifier = Modifier.fillMaxWidth(), onClick = { onOpenTopic(topic.slug) }) {
        Row(
            modifier = Modifier.padding(14.dp).fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                if (topic.completed) "✓" else "○",
                style = MaterialTheme.typography.titleMedium,
                color = if (topic.completed) MaterialTheme.colorScheme.primary
                        else MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(Modifier.width(12.dp))
            Column(Modifier.weight(1f)) {
                Text(topic.title, style = MaterialTheme.typography.bodyMedium)
                Text(
                    "≈ ${topic.estimatedMins} min" +
                        (if (topic.hasVisualizer) " · visualizer" else "") +
                        (if (topic.hasCodeLab) " · code lab" else ""),
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

// Extract the level list — the Roadmap DTO's `levels` is already a
// `List<LevelRoadmapDto>` so no adapter needed. This helper is here purely
// so imports resolve if the caller wants to inspect the shape.
@Suppress("unused")
internal fun levelsOf(response: PathRoadmapResponse): List<LevelRoadmapDto> = response.levels

