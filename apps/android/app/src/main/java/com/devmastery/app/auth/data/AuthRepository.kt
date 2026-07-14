package com.devmastery.app.auth.data

import com.devmastery.app.auth.data.remote.AuthApi
import com.devmastery.app.auth.data.remote.AuthResponse
import com.devmastery.app.auth.data.remote.LoginRequest
import com.devmastery.app.auth.data.remote.RegisterRequest
import com.devmastery.app.core.data.local.StoredUser
import com.devmastery.app.core.data.local.TokenManager
import com.google.gson.Gson
import retrofit2.HttpException
import java.net.SocketTimeoutException
import java.net.UnknownHostException
import javax.inject.Inject
import javax.inject.Singleton

sealed class AuthResult<out T> {
    data class Success<T>(val data: T) : AuthResult<T>()
    data class Error(val message: String) : AuthResult<Nothing>()
}

@Singleton
class AuthRepository @Inject constructor(
    private val api: AuthApi,
    private val tokenManager: TokenManager,
) {
    private val gson = Gson()

    suspend fun login(email: String, password: String): AuthResult<AuthResponse> =
        runCatching {
            val res = api.login(LoginRequest(email, password))
            if (res.isSuccessful) {
                val body = res.body()!!
                saveSession(body)
                AuthResult.Success(body)
            } else {
                AuthResult.Error(parseError(res.errorBody()?.string(), res.code()))
            }
        }.getOrElse { AuthResult.Error(mapException(it)) }

    suspend fun register(email: String, password: String, fullName: String): AuthResult<AuthResponse> =
        runCatching {
            val res = api.register(RegisterRequest(email, password, fullName))
            if (res.isSuccessful) {
                val body = res.body()!!
                saveSession(body)
                AuthResult.Success(body)
            } else {
                AuthResult.Error(parseError(res.errorBody()?.string(), res.code()))
            }
        }.getOrElse { AuthResult.Error(mapException(it)) }

    suspend fun logout() = tokenManager.clearAuth()

    // ── Helpers ──────────────────────────────────────────────────────────────

    private suspend fun saveSession(res: AuthResponse) {
        tokenManager.saveToken(res.token)
        tokenManager.saveUser(
            StoredUser(
                id       = res.user.id,
                email    = res.user.email,
                fullName = res.user.fullName,
                roles    = res.user.roles,
            )
        )
    }

    private fun parseError(body: String?, code: Int): String {
        if (body != null) {
            runCatching {
                val err = gson.fromJson(body, Map::class.java)
                val msg = err["message"] as? String ?: err["error"] as? String
                if (!msg.isNullOrBlank()) return msg
            }
        }
        return when (code) {
            400 -> "Invalid request — check your inputs."
            401 -> "Incorrect email or password."
            409 -> "Email already registered — please sign in."
            429 -> "Too many attempts. Please wait a minute."
            500 -> "Server error — please try again later."
            else -> "Sign-in failed ($code)."
        }
    }

    private fun mapException(t: Throwable): String = when (t) {
        is UnknownHostException    -> "No internet connection."
        is SocketTimeoutException  -> "Server is slow, please try again."
        is HttpException           -> parseError(t.response()?.errorBody()?.string(), t.code())
        else                       -> t.message ?: "Unexpected error."
    }
}
