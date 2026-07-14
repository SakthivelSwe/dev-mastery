package com.devmastery.app.learn.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.devmastery.app.learn.data.ContentRepository
import com.devmastery.app.learn.data.remote.LearningPathDto
import com.devmastery.app.learn.data.remote.RoadmapResponseDto
import com.devmastery.app.learn.data.remote.TopicDto
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

// ── Paths list ────────────────────────────────────────────────────────────────

sealed class PathsUiState {
    object Loading : PathsUiState()
    data class Success(val paths: List<LearningPathDto>) : PathsUiState()
    data class Error(val msg: String) : PathsUiState()
}

// ── Single path ───────────────────────────────────────────────────────────────

sealed class PathUiState {
    object Loading : PathUiState()
    data class Success(val path: LearningPathDto) : PathUiState()
    data class Error(val msg: String) : PathUiState()
}

// ── Roadmap ───────────────────────────────────────────────────────────────────

sealed class RoadmapUiState {
    object Loading : RoadmapUiState()
    data class Success(val roadmap: RoadmapResponseDto) : RoadmapUiState()
    data class Error(val msg: String) : RoadmapUiState()
}

// ── Topic ─────────────────────────────────────────────────────────────────────

sealed class TopicUiState {
    object Loading : TopicUiState()
    data class Success(val topic: TopicDto) : TopicUiState()
    data class Error(val msg: String) : TopicUiState()
}

@HiltViewModel
class ContentViewModel @Inject constructor(
    private val repo: ContentRepository,
) : ViewModel() {

    // ── All paths ─────────────────────────────────────────────────────────────

    private val _pathsState = MutableStateFlow<PathsUiState>(PathsUiState.Loading)
    val pathsState: StateFlow<PathsUiState> = _pathsState.asStateFlow()

    fun loadPaths() = viewModelScope.launch {
        _pathsState.value = PathsUiState.Loading
        repo.getPaths().fold(
            onSuccess = { _pathsState.value = PathsUiState.Success(it) },
            onFailure = { _pathsState.value = PathsUiState.Error(it.message ?: "Error") },
        )
    }

    // ── Single path ───────────────────────────────────────────────────────────

    private val _pathState = MutableStateFlow<PathUiState>(PathUiState.Loading)
    val pathState: StateFlow<PathUiState> = _pathState.asStateFlow()

    fun loadPath(slug: String) = viewModelScope.launch {
        _pathState.value = PathUiState.Loading
        repo.getPath(slug).fold(
            onSuccess = { _pathState.value = PathUiState.Success(it) },
            onFailure = { _pathState.value = PathUiState.Error(it.message ?: "Error") },
        )
    }

    // ── Roadmap ───────────────────────────────────────────────────────────────

    private val _roadmapState = MutableStateFlow<RoadmapUiState>(RoadmapUiState.Loading)
    val roadmapState: StateFlow<RoadmapUiState> = _roadmapState.asStateFlow()

    fun loadRoadmap(slug: String) = viewModelScope.launch {
        _roadmapState.value = RoadmapUiState.Loading
        repo.getRoadmap(slug).fold(
            onSuccess = { _roadmapState.value = RoadmapUiState.Success(it) },
            onFailure = { _roadmapState.value = RoadmapUiState.Error(it.message ?: "Error") },
        )
    }

    // ── Topic ─────────────────────────────────────────────────────────────────

    private val _topicState = MutableStateFlow<TopicUiState>(TopicUiState.Loading)
    val topicState: StateFlow<TopicUiState> = _topicState.asStateFlow()

    fun loadTopic(slug: String) = viewModelScope.launch {
        _topicState.value = TopicUiState.Loading
        repo.getTopic(slug).fold(
            onSuccess = { _topicState.value = TopicUiState.Success(it) },
            onFailure = { _topicState.value = TopicUiState.Error(it.message ?: "Error") },
        )
    }
}
