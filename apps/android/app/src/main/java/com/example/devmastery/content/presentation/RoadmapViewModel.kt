package com.example.devmastery.content.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.devmastery.content.data.remote.ContentRepository
import com.example.devmastery.content.data.remote.PathRoadmapResponse
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class RoadmapUiState {
    object Loading : RoadmapUiState()
    data class Success(val data: PathRoadmapResponse) : RoadmapUiState()
    data class Error(val message: String) : RoadmapUiState()
}

class RoadmapViewModel(
    private val repository: ContentRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow<RoadmapUiState>(RoadmapUiState.Loading)
    val uiState: StateFlow<RoadmapUiState> = _uiState.asStateFlow()

    fun loadRoadmap(pathSlug: String) {
        viewModelScope.launch {
            _uiState.value = RoadmapUiState.Loading
            val result = repository.getPathRoadmap(pathSlug)
            result.onSuccess { data ->
                _uiState.value = RoadmapUiState.Success(data)
            }.onFailure { error ->
                _uiState.value = RoadmapUiState.Error(error.message ?: "Unknown error occurred")
            }
        }
    }
}
