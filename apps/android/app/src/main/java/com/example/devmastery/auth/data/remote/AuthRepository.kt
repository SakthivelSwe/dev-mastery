package com.example.devmastery.auth.data.remote

class AuthRepository(
    private val authApi: AuthApi
) {
    suspend fun login(email: String, password: String): Result<AuthResponse> {
        return try {
            val response = authApi.login(LoginRequest(email, password))
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
