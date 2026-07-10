package com.example.devmastery.content.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.CreationExtras
import com.example.devmastery.DevMasteryApp
import com.example.devmastery.content.data.remote.ContentRepository
import com.example.devmastery.content.data.remote.LearningPathDto
import com.example.devmastery.content.data.remote.PathRoadmapResponse
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class PathsListState {
    object Loading : PathsListState()
    data class Success(val paths: List<LearningPathDto>) : PathsListState()
    data class Error(val message: String) : PathsListState()
}

sealed class PathOverviewState {
    object Loading : PathOverviewState()
    data class Success(val path: LearningPathDto) : PathOverviewState()
    data class Error(val message: String) : PathOverviewState()
}

sealed class RoadmapState {
    object Loading : RoadmapState()
    data class Success(val roadmap: PathRoadmapResponse) : RoadmapState()
    data class Error(val message: String) : RoadmapState()
}

class PathsViewModel(
    private val repository: ContentRepository
) : ViewModel() {

    private val _list = MutableStateFlow<PathsListState>(PathsListState.Loading)
    val list: StateFlow<PathsListState> = _list.asStateFlow()

    private val _overview = MutableStateFlow<PathOverviewState>(PathOverviewState.Loading)
    val overview: StateFlow<PathOverviewState> = _overview.asStateFlow()

    private val _roadmap = MutableStateFlow<RoadmapState>(RoadmapState.Loading)
    val roadmap: StateFlow<RoadmapState> = _roadmap.asStateFlow()

    fun loadAllPaths() {
        _list.value = PathsListState.Loading
        viewModelScope.launch {
            repository.getAllPaths()
                .onSuccess { _list.value = PathsListState.Success(it) }
                .onFailure { _list.value = PathsListState.Error(it.message ?: "Failed to load paths") }
        }
    }

    fun loadPath(slug: String) {
        _overview.value = PathOverviewState.Loading
        viewModelScope.launch {
            repository.getPath(slug)
                .onSuccess { _overview.value = PathOverviewState.Success(it) }
                .onFailure { _overview.value = PathOverviewState.Error(it.message ?: "Failed to load path") }
        }
    }

    fun loadRoadmap(slug: String) {
        _roadmap.value = RoadmapState.Loading
        viewModelScope.launch {
            repository.getPathRoadmap(slug)
                .onSuccess { _roadmap.value = RoadmapState.Success(it) }
                .onFailure { _roadmap.value = RoadmapState.Error(it.message ?: "Failed to load roadmap") }
        }
    }

    companion object {
        val Factory: ViewModelProvider.Factory = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>, extras: CreationExtras): T {
                val app = checkNotNull(
                    extras[ViewModelProvider.AndroidViewModelFactory.APPLICATION_KEY]
                ) as DevMasteryApp
                return PathsViewModel(app.container.contentRepository) as T
            }
        }
    }
}

