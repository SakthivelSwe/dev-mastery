package com.example.devmastery.di

import android.content.Context
import com.example.devmastery.auth.data.local.TokenManager
import com.example.devmastery.auth.data.remote.AuthApi
import com.example.devmastery.auth.data.remote.AuthRepository
import com.example.devmastery.content.data.remote.ContentApi
import com.example.devmastery.content.data.remote.ContentRepository
import com.example.devmastery.ai.data.remote.AiApi
import com.example.devmastery.ai.data.remote.AiRepository
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

class AppContainer(private val context: Context) {

    // Android emulator: 10.0.2.2 maps to host machine's localhost
    companion object {
        const val AUTH_BASE     = "http://10.0.2.2:8081/v1/"
        const val CONTENT_BASE  = "http://10.0.2.2:8082/v1/"
        const val PROGRESS_BASE = "http://10.0.2.2:8083/v1/"
        const val AI_BASE       = "http://10.0.2.2:8084/v1/"   // ai-bot-service (application.yml port 8084)
        // Execution service at 8085 — not yet used in Android
    }

    val tokenManager by lazy { TokenManager(context) }

    /** Plain OkHttp client – used only for auth (login / register, no token needed) */
    private val plainClient = OkHttpClient.Builder()
        .addInterceptor(HttpLoggingInterceptor().apply { level = HttpLoggingInterceptor.Level.BODY })
        .build()

    /** Authenticated OkHttp client – adds Bearer JWT to every request */
    private val authClient by lazy {
        OkHttpClient.Builder()
            .addInterceptor(HttpLoggingInterceptor().apply { level = HttpLoggingInterceptor.Level.BODY })
            .addInterceptor { chain ->
                val token = tokenManager.getToken()
                val userId = tokenManager.getUserId()
                val request = chain.request().newBuilder().apply {
                    if (token != null) addHeader("Authorization", "Bearer $token")
                    if (userId != null) addHeader("X-User-Id", userId)
                }.build()
                chain.proceed(request)
            }
            .build()
    }

    private fun retrofit(baseUrl: String, authenticated: Boolean = false): Retrofit =
        Retrofit.Builder()
            .baseUrl(baseUrl)
            .client(if (authenticated) authClient else plainClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()

    // Auth service (no token for login/register)
    val authRepository by lazy {
        AuthRepository(retrofit(AUTH_BASE).create(AuthApi::class.java))
    }

    // Content service (authenticated)
    val contentRepository by lazy {
        ContentRepository(retrofit(CONTENT_BASE, authenticated = true).create(ContentApi::class.java))
    }

    // Progress service (authenticated)
    val progressRepository by lazy {
        com.example.devmastery.progress.data.remote.ProgressRepository(
            retrofit(PROGRESS_BASE, authenticated = true)
                .create(com.example.devmastery.progress.data.remote.ProgressApi::class.java)
        )
    }

    // AI service (authenticated)
    val aiRepository by lazy {
        AiRepository(retrofit(AI_BASE, authenticated = true).create(AiApi::class.java))
    }
}
