package com.example.devmastery.patterns.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.CreationExtras
import com.example.devmastery.DevMasteryApp
import com.example.devmastery.patterns.data.remote.PatternDetailDto
import com.example.devmastery.patterns.data.remote.PatternSummaryDto
import com.example.devmastery.patterns.data.remote.PatternsRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class PatternsState {
    object Loading : PatternsState()
    data class Success(val patterns: List<PatternSummaryDto>) : PatternsState()
    data class Error(val message: String) : PatternsState()
}

class PatternsViewModel(
    private val repository: PatternsRepository
) : ViewModel() {

    private val _state = MutableStateFlow<PatternsState>(PatternsState.Loading)
    val state: StateFlow<PatternsState> = _state.asStateFlow()

    private val _detail = MutableStateFlow<PatternDetailDto?>(null)
    val detail: StateFlow<PatternDetailDto?> = _detail.asStateFlow()

    init {
        load()
    }

    fun load() {
        _state.value = PatternsState.Loading
        viewModelScope.launch {
            repository.list()
                .onSuccess { _state.value = PatternsState.Success(it) }
                .onFailure {
                    _state.value = PatternsState.Error(it.message ?: "Failed to load patterns")
                }
        }
    }

    fun openDetail(slug: String) {
        _detail.value = null
        viewModelScope.launch {
            repository.detail(slug).onSuccess { _detail.value = it }
        }
    }

    fun closeDetail() {
        _detail.value = null
    }

    companion object {
        val Factory: ViewModelProvider.Factory = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>, extras: CreationExtras): T {
                val app = checkNotNull(
                    extras[ViewModelProvider.AndroidViewModelFactory.APPLICATION_KEY]
                ) as DevMasteryApp
                return PatternsViewModel(app.container.patternsRepository) as T
            }
        }
    }
}

