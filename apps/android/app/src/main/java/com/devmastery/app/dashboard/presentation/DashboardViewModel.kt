package com.devmastery.app.dashboard.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.devmastery.app.dashboard.data.DashboardRepository
import com.devmastery.app.dashboard.data.remote.DashboardDto
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed class DashboardUiState {
    object Loading : DashboardUiState()
    data class Success(val data: DashboardDto) : DashboardUiState()
    data class Error(val message: String) : DashboardUiState()
}

@HiltViewModel
class DashboardViewModel @Inject constructor(
    private val repo: DashboardRepository,
) : ViewModel() {

    private val _state = MutableStateFlow<DashboardUiState>(DashboardUiState.Loading)
    val state: StateFlow<DashboardUiState> = _state.asStateFlow()

    init { load() }

    fun load() {
        viewModelScope.launch {
            _state.value = DashboardUiState.Loading
            repo.getDashboard().fold(
                onSuccess = { _state.value = DashboardUiState.Success(it) },
                onFailure = { _state.value = DashboardUiState.Error(it.message ?: "Failed to load dashboard") },
            )
        }
    }
}
