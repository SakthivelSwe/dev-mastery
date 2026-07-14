package com.devmastery.app.auth.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.devmastery.app.auth.data.AuthRepository
import com.devmastery.app.auth.data.AuthResult
import com.devmastery.app.core.data.local.StoredUser
import com.devmastery.app.core.data.local.TokenManager
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed class AuthUiState {
    object Idle      : AuthUiState()
    object Loading   : AuthUiState()
    data class Success(val user: StoredUser) : AuthUiState()
    data class Error(val message: String)    : AuthUiState()
}

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val repo: AuthRepository,
    private val tokenManager: TokenManager,
) : ViewModel() {

    private val _state = MutableStateFlow<AuthUiState>(AuthUiState.Idle)
    val state: StateFlow<AuthUiState> = _state.asStateFlow()

    /** Auto-login: check for a stored token on cold start. */
    fun checkAutoLogin(onAuthed: () -> Unit, onGuest: () -> Unit) {
        viewModelScope.launch {
            val token = tokenManager.getToken()
            val user  = tokenManager.getUser()
            if (token != null && user != null) onAuthed() else onGuest()
        }
    }

    fun login(email: String, password: String) {
        viewModelScope.launch {
            _state.value = AuthUiState.Loading
            _state.value = when (val r = repo.login(email.trim(), password)) {
                is AuthResult.Success -> AuthUiState.Success(
                    StoredUser(r.data.user.id, r.data.user.email, r.data.user.fullName, r.data.user.roles)
                )
                is AuthResult.Error -> AuthUiState.Error(r.message)
            }
        }
    }

    fun register(email: String, password: String, fullName: String) {
        viewModelScope.launch {
            _state.value = AuthUiState.Loading
            _state.value = when (val r = repo.register(email.trim(), password, fullName.trim())) {
                is AuthResult.Success -> AuthUiState.Success(
                    StoredUser(r.data.user.id, r.data.user.email, r.data.user.fullName, r.data.user.roles)
                )
                is AuthResult.Error -> AuthUiState.Error(r.message)
            }
        }
    }

    fun logout(onDone: () -> Unit) {
        viewModelScope.launch {
            repo.logout()
            _state.value = AuthUiState.Idle
            onDone()
        }
    }

    fun resetState() { _state.value = AuthUiState.Idle }
}
