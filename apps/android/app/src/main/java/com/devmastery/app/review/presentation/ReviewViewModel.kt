package com.devmastery.app.review.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.devmastery.app.review.data.ReviewRepository
import com.devmastery.app.review.data.remote.ReviewItemDto
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed class ReviewUiState {
    object Loading : ReviewUiState()
    data class Success(val items: List<ReviewItemDto>, val currentIndex: Int = 0) : ReviewUiState()
    object Empty : ReviewUiState()
    data class Error(val msg: String) : ReviewUiState()
    object Done : ReviewUiState()
}

@HiltViewModel
class ReviewViewModel @Inject constructor(
    private val repo: ReviewRepository,
) : ViewModel() {

    private val _state = MutableStateFlow<ReviewUiState>(ReviewUiState.Loading)
    val state: StateFlow<ReviewUiState> = _state.asStateFlow()

    init { loadReviews() }

    fun loadReviews() {
        viewModelScope.launch {
            _state.value = ReviewUiState.Loading
            repo.getDueReviews().fold(
                onSuccess = { items ->
                    _state.value = if (items.isEmpty()) ReviewUiState.Empty
                                   else ReviewUiState.Success(items, 0)
                },
                onFailure = { _state.value = ReviewUiState.Error(it.message ?: "Error") },
            )
        }
    }

    fun submitRating(topicId: String, rating: Int) {
        viewModelScope.launch {
            repo.submitRating(topicId, rating)
            val current = _state.value as? ReviewUiState.Success ?: return@launch
            val next = current.currentIndex + 1
            _state.value = if (next >= current.items.size) ReviewUiState.Done
                           else current.copy(currentIndex = next)
        }
    }
}
