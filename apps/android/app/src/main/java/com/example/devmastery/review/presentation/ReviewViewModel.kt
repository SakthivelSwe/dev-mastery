package com.example.devmastery.review.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.CreationExtras
import com.example.devmastery.DevMasteryApp
import com.example.devmastery.progress.data.remote.ProgressRepository
import com.example.devmastery.progress.data.remote.SpacedReviewDto
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class ReviewState {
    object Loading : ReviewState()
    object Empty : ReviewState()
    data class Success(val reviews: List<SpacedReviewDto>) : ReviewState()
    data class Error(val message: String) : ReviewState()
}

/** Grades map to the backend's SM-2 rating values (mirrors the web /review page). */
enum class ReviewRating(val apiValue: String, val label: String) {
    AGAIN("AGAIN", "Again"),
    HARD("HARD", "Hard"),
    GOOD("GOOD", "Good"),
    EASY("EASY", "Easy")
}

class ReviewViewModel(
    private val progressRepository: ProgressRepository
) : ViewModel() {

    private val _state = MutableStateFlow<ReviewState>(ReviewState.Loading)
    val state: StateFlow<ReviewState> = _state.asStateFlow()

    init {
        loadDueReviews()
    }

    fun loadDueReviews() {
        _state.value = ReviewState.Loading
        viewModelScope.launch {
            progressRepository.getDueReviews()
                .onSuccess { reviews ->
                    _state.value =
                        if (reviews.isEmpty()) ReviewState.Empty
                        else ReviewState.Success(reviews)
                }
                .onFailure { error ->
                    _state.value = ReviewState.Error(error.message ?: "Failed to load reviews")
                }
        }
    }

    fun submitRating(topicId: String, rating: ReviewRating) {
        viewModelScope.launch {
            progressRepository.submitReview(topicId, rating.apiValue)
                .onSuccess {
                    // Optimistically drop the reviewed card; reload if the queue empties.
                    val current = _state.value
                    if (current is ReviewState.Success) {
                        val remaining = current.reviews.filterNot { it.topicId == topicId }
                        _state.value =
                            if (remaining.isEmpty()) ReviewState.Empty
                            else ReviewState.Success(remaining)
                    }
                }
                .onFailure { error ->
                    _state.value = ReviewState.Error(error.message ?: "Failed to submit review")
                }
        }
    }

    companion object {
        val Factory: ViewModelProvider.Factory = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(
                modelClass: Class<T>,
                extras: CreationExtras
            ): T {
                val application = checkNotNull(
                    extras[ViewModelProvider.AndroidViewModelFactory.APPLICATION_KEY]
                ) as DevMasteryApp
                return ReviewViewModel(application.container.progressRepository) as T
            }
        }
    }
}

