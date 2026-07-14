package com.devmastery.app.core.data.remote

import com.devmastery.app.BuildConfig
import com.devmastery.app.core.data.local.TokenManager
import kotlinx.coroutines.runBlocking
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

/**
 * Central Retrofit + OkHttp configuration.
 * - Attaches JWT Bearer token on every request.
 * - On 401, clears the stored token so the NavGraph redirects to Login.
 */
object ApiClient {

    private var tokenManager: TokenManager? = null

    fun init(tm: TokenManager) {
        tokenManager = tm
    }

    val BASE_URL: String get() = BuildConfig.API_BASE_URL

    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = if (BuildConfig.DEBUG) HttpLoggingInterceptor.Level.BODY
                else HttpLoggingInterceptor.Level.NONE
    }

    val okHttpClient: OkHttpClient by lazy {
        OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(60,  TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .addInterceptor { chain ->
                val token = runBlocking { tokenManager?.getToken() }
                val req = if (token != null)
                    chain.request().newBuilder()
                        .addHeader("Authorization", "Bearer $token")
                        .build()
                else chain.request()
                val response = chain.proceed(req)
                if (response.code == 401) {
                    runBlocking { tokenManager?.clearAuth() }
                }
                response
            }
            .addInterceptor(loggingInterceptor)
            .build()
    }

    val retrofit: Retrofit by lazy {
        Retrofit.Builder()
            .baseUrl("$BASE_URL/")
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    inline fun <reified T> create(): T = retrofit.create(T::class.java)
}
