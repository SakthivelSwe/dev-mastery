package com.example.devmastery.auth.data.remote

class AuthRepository(
    private val authApi: AuthApi
) {
    suspend fun login(email: String, password: String): Result<AuthResponse> = runCatching {
        authApi.login(LoginRequest(email, password))
    }

    suspend fun register(email: String, password: String, name: String): Result<AuthResponse> = runCatching {
        authApi.register(RegisterRequest(fullName = name, email = email, password = password))
    }
}
