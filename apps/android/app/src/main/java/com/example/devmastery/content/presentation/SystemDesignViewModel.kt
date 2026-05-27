package com.example.devmastery.content.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.devmastery.content.data.remote.ContentRepository
import com.example.devmastery.content.data.remote.SystemDesignArchitectureDto
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class SystemDesignState {
    object Loading : SystemDesignState()
    data class Success(val architectures: List<SystemDesignArchitectureDto>) : SystemDesignState()
    data class Error(val message: String) : SystemDesignState()
}

class SystemDesignViewModel(
    private val repository: ContentRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow<SystemDesignState>(SystemDesignState.Loading)
    val uiState: StateFlow<SystemDesignState> = _uiState.asStateFlow()

    init {
        loadArchitectures()
    }

    private fun loadArchitectures() {
        viewModelScope.launch {
            _uiState.value = SystemDesignState.Loading
            repository.getSystemDesignArchitectures()
                .onSuccess { architectures ->
                    _uiState.value = SystemDesignState.Success(architectures)
                }
                .onFailure { error ->
                    _uiState.value = SystemDesignState.Error(error.message ?: "Unknown error")
                }
        }
    }

    companion object {
        val Factory: ViewModelProvider.Factory = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(
                modelClass: Class<T>,
                extras: androidx.lifecycle.viewmodel.CreationExtras
            ): T {
                val application = checkNotNull(extras[ViewModelProvider.AndroidViewModelFactory.APPLICATION_KEY]) as com.example.devmastery.DevMasteryApp
                return SystemDesignViewModel(
                    application.container.contentRepository
                ) as T
            }
        }
    }
}
