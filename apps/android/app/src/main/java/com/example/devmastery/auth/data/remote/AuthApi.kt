package com.example.devmastery.auth.data.remote

import retrofit2.http.Body
import retrofit2.http.POST

data class LoginRequest(val email: String, val password: String)

data class UserDto(
    val id: String,
    val email: String,
    val name: String,
    val role: String,
    val xp: Int
)

data class AuthResponse(
    val token: String,
    val user: UserDto
)

interface AuthApi {
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): AuthResponse
}
