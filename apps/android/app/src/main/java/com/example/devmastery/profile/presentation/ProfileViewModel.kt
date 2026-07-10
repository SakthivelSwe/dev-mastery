package com.example.devmastery.profile.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.CreationExtras
import com.example.devmastery.DevMasteryApp
import com.example.devmastery.auth.data.local.TokenManager
import com.example.devmastery.progress.data.remote.ProgressRepository
import com.example.devmastery.progress.data.remote.ProgressSummaryDto
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class ProfileHeader(
    val name: String,
    val email: String
)

sealed class ProfileState {
    object Loading : ProfileState()
    data class Success(val header: ProfileHeader, val summary: ProgressSummaryDto) : ProfileState()
    data class Error(val header: ProfileHeader, val message: String) : ProfileState()
}

class ProfileViewModel(
    private val progressRepository: ProgressRepository,
    private val tokenManager: TokenManager
) : ViewModel() {

    private val header = ProfileHeader(
        name = tokenManager.getUserName() ?: "Learner",
        email = tokenManager.getUserEmail() ?: ""
    )

    private val _state = MutableStateFlow<ProfileState>(ProfileState.Loading)
    val state: StateFlow<ProfileState> = _state.asStateFlow()

    init {
        load()
    }

    fun load() {
        _state.value = ProfileState.Loading
        val userId = tokenManager.getUserId()
        if (userId.isNullOrBlank()) {
            _state.value = ProfileState.Error(header, "Not signed in.")
            return
        }
        viewModelScope.launch {
            progressRepository.getSummary(userId)
                .onSuccess { summary -> _state.value = ProfileState.Success(header, summary) }
                .onFailure { error ->
                    _state.value = ProfileState.Error(header, error.message ?: "Failed to load progress")
                }
        }
    }

    companion object {
        val Factory: ViewModelProvider.Factory = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>, extras: CreationExtras): T {
                val app = checkNotNull(
                    extras[ViewModelProvider.AndroidViewModelFactory.APPLICATION_KEY]
                ) as DevMasteryApp
                return ProfileViewModel(
                    app.container.progressRepository,
                    app.container.tokenManager
                ) as T
            }
        }
    }
}

