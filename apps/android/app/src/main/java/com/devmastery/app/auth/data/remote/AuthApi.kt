package com.devmastery.app.auth.data.remote

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

// ── Request bodies ─────────────────────────────────────────────────────────

data class LoginRequest(val email: String, val password: String)
data class RegisterRequest(val email: String, val password: String, val fullName: String)

// ── Response bodies ────────────────────────────────────────────────────────

data class UserDto(
    val id: String,
    val email: String,
    val fullName: String,
    val roles: List<String> = emptyList(),
)

data class AuthResponse(
    val token: String,
    val user: UserDto,
)

data class ErrorBody(
    val message: String? = null,
    val error: String? = null,
)

// ── Retrofit interface ─────────────────────────────────────────────────────

interface AuthApi {
    @POST("v1/auth/login")
    suspend fun login(@Body req: LoginRequest): Response<AuthResponse>

    @POST("v1/auth/register")
    suspend fun register(@Body req: RegisterRequest): Response<AuthResponse>
}
