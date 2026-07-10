package com.example.devmastery.content.presentation

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import dev.jeziellago.compose.markdowntext.MarkdownText
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TopicReaderScreen(
    topicSlug: String,
    onBack: () -> Unit,
    viewModel: TopicViewModel = viewModel(factory = TopicViewModel.Factory)
) {
    val topicState by viewModel.topicState.collectAsState()
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val snackbar = remember { SnackbarHostState() }

    // ── TTS reader mode (commute-friendly) ──
    val tts = remember { TtsController(context) }
    val ttsStatus by tts.status.collectAsState()
    DisposableEffect(Unit) { onDispose { tts.shutdown() } }

    // ── Download-for-offline star state ──
    var starred by remember(topicSlug) { mutableStateOf(false) }
    LaunchedEffect(topicSlug) {
        starred = com.example.devmastery.content.data.local
            .TopicCache(context).isStarred(topicSlug)
    }

    LaunchedEffect(topicSlug) {
        viewModel.loadTopic(topicSlug)
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbar) },
        topBar = {
            TopAppBar(
                title = { Text(if (topicState is TopicState.Success) (topicState as TopicState.Success).topic.title else "Loading...") },
                navigationIcon = { TextButton(onClick = onBack) { Text("Back") } },
                actions = {
                    // Listen / Stop for the currently-selected lesson
                    val currentText = (topicState as? TopicState.Success)?.let { s ->
                        s.topic.lessons.getOrNull(s.selectedLayerIndex)?.contentMdx.orEmpty()
                    }.orEmpty()
                    if (currentText.isNotBlank()) {
                        TextButton(
                            onClick = {
                                if (ttsStatus == TtsController.Status.Speaking) tts.stop()
                                else tts.speak(currentText)
                            }
                        ) {
                            Text(if (ttsStatus == TtsController.Status.Speaking) "Stop" else "Listen")
                        }
                    }
                    // Star / unstar for offline access
                    TextButton(
                        onClick = {
                            scope.launch {
                                val cache = com.example.devmastery.content.data.local.TopicCache(context)
                                if (starred) {
                                    cache.unstar(topicSlug)
                                    starred = false
                                    snackbar.showSnackbar("Removed from downloads")
                                } else {
                                    // Save the current topic snapshot for offline reading.
                                    (topicState as? TopicState.Success)?.topic?.let { t ->
                                        cache.save(t)
                                    }
                                    cache.star(topicSlug)
                                    starred = true
                                    snackbar.showSnackbar("Downloaded for offline")
                                }
                            }
                        }
                    ) {
                        Text(if (starred) "★" else "☆")
                    }
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
        ) {
            when (val state = topicState) {
                is TopicState.Loading -> {
                    CircularProgressIndicator(
                        modifier = Modifier
                            .align(Alignment.CenterHorizontally)
                            .padding(top = 32.dp)
                    )
                }
                is TopicState.Success -> {
                    val topic = state.topic
                    val selectedIndex = state.selectedLayerIndex

                    ScrollableTabRow(
                        selectedTabIndex = selectedIndex,
                        edgePadding = 8.dp
                    ) {
                        topic.lessons.forEachIndexed { index, lesson ->
                            Tab(
                                selected = selectedIndex == index,
                                onClick = { viewModel.selectLayer(index) },
                                text = { Text(lesson.title) }
                            )
                        }
                    }

                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(16.dp)
                            .verticalScroll(rememberScrollState())
                    ) {
                        val currentLesson = topic.lessons.getOrNull(selectedIndex)
                        if (currentLesson != null) {
                            when (currentLesson.sectionType) {
                                "feynman" -> {
                                    MarkdownText(markdown = currentLesson.contentMdx)
                                    FeynmanCheckPanel(
                                        onComplete = { viewModel.completeLayer(topic.id, "feynman") }
                                    )
                                }
                                "build" -> {
                                    MarkdownText(markdown = currentLesson.contentMdx)
                                    BuildChallengePanel(
                                        onComplete = { viewModel.completeLayer(topic.id, "build") }
                                    )
                                }
                                "spacedreview" -> {
                                    SpacedReviewWidget(
                                        onSubmitReview = { rating -> 
                                            viewModel.submitSpacedReview(topic.id, rating)
                                            viewModel.completeLayer(topic.id, "spacedreview")
                                        }
                                    )
                                }
                                else -> {
                                    MarkdownText(
                                        markdown = currentLesson.contentMdx,
                                        style = MaterialTheme.typography.bodyLarge,
                                        color = MaterialTheme.colorScheme.onSurface
                                    )
                                }
                            }
                        }
                    }
                }
                is TopicState.Error -> {
                    Text(
                        text = state.message,
                        color = MaterialTheme.colorScheme.error,
                        modifier = Modifier
                            .align(Alignment.CenterHorizontally)
                            .padding(top = 32.dp)
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Button(
                        onClick = onBack,
                        modifier = Modifier.align(Alignment.CenterHorizontally)
                    ) {
                        Text("Go Back")
                    }
                }
            }
        }
    }
}
