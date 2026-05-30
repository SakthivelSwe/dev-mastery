package com.example.devmastery.auth.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.CreationExtras
import com.example.devmastery.DevMasteryApp
import com.example.devmastery.auth.data.local.TokenManager
import com.example.devmastery.auth.data.remote.AuthRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class AuthState {
    object Idle : AuthState()
    object Loading : AuthState()
    data class Success(val token: String, val userName: String) : AuthState()
    data class Error(val message: String) : AuthState()
}

class AuthViewModel(
    private val authRepository: AuthRepository,
    private val tokenManager: TokenManager
) : ViewModel() {

    private val _authState = MutableStateFlow<AuthState>(AuthState.Idle)
    val authState: StateFlow<AuthState> = _authState.asStateFlow()

    fun login(email: String, password: String) {
        _authState.value = AuthState.Loading
        viewModelScope.launch {
            authRepository.login(email, password)
                .onSuccess { response ->
                    // Backend AuthResponse is flat: { token, id, email, fullName, role }
                    tokenManager.saveToken(response.token)
                    tokenManager.saveUserId(response.id)
                    tokenManager.saveUserName(response.fullName)
                    tokenManager.saveUserEmail(response.email)
                    _authState.value = AuthState.Success(response.token, response.fullName)
                }
                .onFailure { _authState.value = AuthState.Error(it.message ?: "Login failed") }
        }
    }

    fun register(email: String, password: String, name: String) {
        _authState.value = AuthState.Loading
        viewModelScope.launch {
            authRepository.register(email, password, name)
                .onSuccess { response ->
                    tokenManager.saveToken(response.token)
                    tokenManager.saveUserId(response.id)
                    tokenManager.saveUserName(response.fullName)
                    tokenManager.saveUserEmail(response.email)
                    _authState.value = AuthState.Success(response.token, response.fullName)
                }
                .onFailure { _authState.value = AuthState.Error(it.message ?: "Registration failed") }
        }
    }

    fun resetState() { _authState.value = AuthState.Idle }

    companion object {
        val Factory: ViewModelProvider.Factory = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>, extras: CreationExtras): T {
                val app = checkNotNull(extras[ViewModelProvider.AndroidViewModelFactory.APPLICATION_KEY]) as DevMasteryApp
                return AuthViewModel(app.container.authRepository, app.container.tokenManager) as T
            }
        }
    }
}
