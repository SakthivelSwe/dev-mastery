package com.example.devmastery.content.presentation

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import dev.jeziellago.compose.markdowntext.MarkdownText

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.SmartToy

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TopicReaderScreen(
    topicSlug: String,
    onBack: () -> Unit,
    onAiChat: () -> Unit = {},
    viewModel: TopicViewModel = viewModel(factory = TopicViewModel.Factory)
) {
    val topicState by viewModel.topicState.collectAsState()

    LaunchedEffect(topicSlug) {
        viewModel.loadTopic(topicSlug)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(if (topicState is TopicState.Success) (topicState as TopicState.Success).topic.title else "Loading...") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    IconButton(onClick = onAiChat) {
                        Icon(Icons.Default.SmartToy, contentDescription = "AI Chat",
                            tint = MaterialTheme.colorScheme.primary)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface,
                    titleContentColor = MaterialTheme.colorScheme.onSurface,
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
