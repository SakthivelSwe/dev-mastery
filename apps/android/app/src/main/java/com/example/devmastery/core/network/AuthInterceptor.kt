package com.example.devmastery.core.network

import com.example.devmastery.auth.data.local.TokenManager
import okhttp3.Interceptor
import okhttp3.Response

/**
 * Attaches the stored JWT as a Bearer token to every outgoing request and
 * clears it on a 401 so the app falls back to the login screen. This is the
 * Android equivalent of the web app's Authorization header handling in
 * `apps/web/src/lib/api.ts`.
 */
class AuthInterceptor(
    private val tokenManager: TokenManager
) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val original = chain.request()
        val token = tokenManager.getToken()

        val request = if (!token.isNullOrBlank()) {
            original.newBuilder()
                .addHeader("Authorization", "Bearer $token")
                .build()
        } else {
            original
        }

        val response = chain.proceed(request)

        // Session expired / invalid — drop the token so guards can redirect.
        if (response.code == 401) {
            tokenManager.clearToken()
        }

        return response
    }
}

