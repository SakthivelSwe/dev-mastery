package com.example.devmastery.auth.data.remote

import retrofit2.http.Body
import retrofit2.http.POST

data class LoginRequest(val email: String, val password: String)

data class RegisterRequest(
    val fullName: String,
    val email: String,
    val password: String
)

/**
 * Maps to AuthService.UserView on the server:
 *   record UserView(UUID id, String email, String fullName, List<String> roles)
 *
 * NOTE: Gson maps JSON field "fullName" → fullName, "roles" → roles.
 *       The old "name" field caused silent null deserialization; fixed here.
 */
data class UserDto(
    val id: String,
    val email: String,
    val fullName: String,
    val roles: List<String> = listOf("USER")
) {
    /** Convenience accessor used by TokenManager and the UI. */
    val displayName: String get() = fullName
}

/**
 * Maps to AuthService.AuthResult on the server:
 *   record AuthResult(String token, UserView user)
 */
data class AuthResponse(
    val token: String,
    val user: UserDto
)

interface AuthApi {
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): AuthResponse

    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): AuthResponse
}
