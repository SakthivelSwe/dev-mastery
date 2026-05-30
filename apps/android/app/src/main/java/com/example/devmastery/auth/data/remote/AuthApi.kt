package com.example.devmastery.auth.data.remote

import retrofit2.http.Body
import retrofit2.http.POST

data class LoginRequest(val email: String, val password: String)
// Backend RegisterRequest.java has fields: fullName, email, password
data class RegisterRequest(val fullName: String, val email: String, val password: String)

// Backend AuthResponse is FLAT (matches Java record: token, id, email, fullName, role)
data class AuthResponse(
    val token: String,
    val id: String,
    val email: String,
    val fullName: String,
    val role: String
)

interface AuthApi {
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): AuthResponse

    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): AuthResponse
}
