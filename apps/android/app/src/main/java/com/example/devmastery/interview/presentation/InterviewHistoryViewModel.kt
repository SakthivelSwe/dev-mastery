package com.example.devmastery.interview.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.CreationExtras
import com.example.devmastery.DevMasteryApp
import com.example.devmastery.interview.data.remote.InterviewRepository
import com.example.devmastery.interview.data.remote.InterviewSessionDetailDto
import com.example.devmastery.interview.data.remote.InterviewSessionSummaryDto
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class InterviewHistoryState {
    object Loading : InterviewHistoryState()
    object Empty : InterviewHistoryState()
    data class Success(val sessions: List<InterviewSessionSummaryDto>) : InterviewHistoryState()
    data class Error(val message: String) : InterviewHistoryState()
}

sealed class InterviewDetailState {
    object Loading : InterviewDetailState()
    data class Success(val detail: InterviewSessionDetailDto) : InterviewDetailState()
    data class Error(val message: String) : InterviewDetailState()
}

class InterviewHistoryViewModel(
    private val repository: InterviewRepository
) : ViewModel() {

    private val _history = MutableStateFlow<InterviewHistoryState>(InterviewHistoryState.Loading)
    val history: StateFlow<InterviewHistoryState> = _history.asStateFlow()

    private val _detail = MutableStateFlow<InterviewDetailState>(InterviewDetailState.Loading)
    val detail: StateFlow<InterviewDetailState> = _detail.asStateFlow()

    fun loadHistory() {
        _history.value = InterviewHistoryState.Loading
        viewModelScope.launch {
            repository.history()
                .onSuccess { list ->
                    _history.value =
                        if (list.isEmpty()) InterviewHistoryState.Empty
                        else InterviewHistoryState.Success(list)
                }
                .onFailure { _history.value = InterviewHistoryState.Error(it.message ?: "Failed to load history") }
        }
    }

    fun loadDetail(id: String) {
        _detail.value = InterviewDetailState.Loading
        viewModelScope.launch {
            repository.detail(id)
                .onSuccess { _detail.value = InterviewDetailState.Success(it) }
                .onFailure { _detail.value = InterviewDetailState.Error(it.message ?: "Failed to load session") }
        }
    }

    companion object {
        val Factory: ViewModelProvider.Factory = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>, extras: CreationExtras): T {
                val app = checkNotNull(
                    extras[ViewModelProvider.AndroidViewModelFactory.APPLICATION_KEY]
                ) as DevMasteryApp
                return InterviewHistoryViewModel(app.container.interviewRepository) as T
            }
        }
    }
}

