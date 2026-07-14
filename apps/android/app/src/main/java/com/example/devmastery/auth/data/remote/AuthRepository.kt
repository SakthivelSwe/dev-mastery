package com.example.devmastery.auth.data.remote

import com.google.gson.Gson
import retrofit2.HttpException
import java.net.SocketTimeoutException
import java.net.UnknownHostException

class AuthRepository(
    private val authApi: AuthApi
) {
    suspend fun login(email: String, password: String): Result<AuthResponse> {
        return try {
            val response = authApi.login(LoginRequest(email, password))
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(mapException(e))
        }
    }

    suspend fun register(fullName: String, email: String, password: String): Result<AuthResponse> {
        return try {
            val response = authApi.register(RegisterRequest(fullName, email, password))
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(mapException(e))
        }
    }

    /**
     * Converts raw exceptions into user-friendly messages:
     *  - HttpException: parse the JSON body for a `message` or `error` field
     *  - UnknownHostException / offline: "No internet connection"
     *  - SocketTimeoutException / Render cold-start: friendly retry prompt
     *  - Anything else: generic fallback
     */
    private fun mapException(e: Exception): Exception = when (e) {
        is HttpException -> {
            val body = runCatching {
                val raw = e.response()?.errorBody()?.string() ?: ""
                val json = Gson().fromJson(raw, Map::class.java)
                // Spring returns { "message": "...", "error": "Bad Request" }
                (json["message"] as? String)?.takeIf { it.isNotBlank() }
                    ?: (json["error"] as? String)?.takeIf { it.isNotBlank() }
                    ?: when (e.code()) {
                        400 -> "Invalid request — please check your details."
                        401 -> "Incorrect email or password."
                        403 -> "Access denied."
                        409 -> "Email already registered — please sign in."
                        422 -> "Validation failed — please check your input."
                        500, 503 -> "Server error — please try again in a moment."
                        else  -> "Request failed (HTTP ${e.code()})."
                    }
            }.getOrElse {
                when (e.code()) {
                    401  -> "Incorrect email or password."
                    409  -> "Email already registered — please sign in."
                    else -> "Request failed (HTTP ${e.code()})."
                }
            }
            Exception(body)
        }
        is UnknownHostException -> Exception("No internet connection. Please check your network.")
        is SocketTimeoutException -> Exception("Server is taking too long. Please try again.")
        else -> Exception(e.message?.takeIf { it.isNotBlank() } ?: "An unexpected error occurred.")
    }
}
