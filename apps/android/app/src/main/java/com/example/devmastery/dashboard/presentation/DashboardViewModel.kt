package com.example.devmastery.dashboard.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.CreationExtras
import com.example.devmastery.DevMasteryApp
import com.example.devmastery.auth.data.local.TokenManager
import com.example.devmastery.content.data.remote.ContentRepository
import com.example.devmastery.content.data.remote.PathDto
import com.example.devmastery.progress.data.remote.ProgressRepository
import com.example.devmastery.progress.data.remote.ProgressSummaryDto
import kotlinx.coroutines.async
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class DashboardData(
    val userName: String,
    val summary: ProgressSummaryDto,
    val paths: List<PathDto>
)

sealed class DashboardState {
    object Loading : DashboardState()
    data class Success(val data: DashboardData) : DashboardState()
    data class Error(val message: String) : DashboardState()
}

class DashboardViewModel(
    private val contentRepository: ContentRepository,
    private val progressRepository: ProgressRepository,
    private val tokenManager: TokenManager
) : ViewModel() {

    private val _state = MutableStateFlow<DashboardState>(DashboardState.Loading)
    val state: StateFlow<DashboardState> = _state.asStateFlow()

    init { load() }

    fun load() {
        _state.value = DashboardState.Loading
        viewModelScope.launch {
            val pathsDeferred   = async { contentRepository.getAllPaths() }
            val summaryDeferred = async { progressRepository.getSummary() }

            val pathsResult   = pathsDeferred.await()
            val summaryResult = summaryDeferred.await()

            val paths   = pathsResult.getOrElse { emptyList() }
            val summary = summaryResult.getOrElse {
                ProgressSummaryDto(0, 1, 0, 0, 0)
            }
            val userName = tokenManager.getUserName() ?: "Learner"

            _state.value = DashboardState.Success(DashboardData(userName, summary, paths))
        }
    }

    companion object {
        val Factory: ViewModelProvider.Factory = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>, extras: CreationExtras): T {
                val app = checkNotNull(extras[ViewModelProvider.AndroidViewModelFactory.APPLICATION_KEY]) as DevMasteryApp
                return DashboardViewModel(
                    app.container.contentRepository,
                    app.container.progressRepository,
                    app.container.tokenManager
                ) as T
            }
        }
    }
}

