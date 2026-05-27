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

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TopicReaderScreen(
    topicSlug: String,
    onBack: () -> Unit,
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
                .padding(16.dp)
                .verticalScroll(rememberScrollState())
        ) {
            when (val state = topicState) {
                is TopicState.Loading -> {
                    CircularProgressIndicator(modifier = Modifier.align(Alignment.CenterHorizontally))
                }
                is TopicState.Success -> {
                    Text(
                        text = state.topic.markdownContent,
                        style = MaterialTheme.typography.bodyLarge
                    )
                }
                is TopicState.Error -> {
                    Text(
                        text = state.message,
                        color = MaterialTheme.colorScheme.error,
                        modifier = Modifier.align(Alignment.CenterHorizontally)
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Button(onClick = onBack) {
                        Text("Go Back")
                    }
                }
            }
        }
    }
}
