package com.example.devmastery.di

import android.content.Context
import com.example.devmastery.auth.data.local.TokenManager
import com.example.devmastery.auth.data.remote.AuthApi
import com.example.devmastery.auth.data.remote.AuthRepository
import com.example.devmastery.content.data.remote.ContentApi
import com.example.devmastery.content.data.remote.ContentRepository
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

class AppContainer(private val context: Context) {
    private val BASE_URL = "http://10.0.2.2:8080/v1/"

    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor(HttpLoggingInterceptor().apply { level = HttpLoggingInterceptor.Level.BODY })
        .build()

    private val retrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(okHttpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()

    val tokenManager by lazy { TokenManager(context) }
    
    val authRepository by lazy { 
        AuthRepository(retrofit.create(AuthApi::class.java)) 
    }
    
    val contentRepository by lazy { 
        ContentRepository(retrofit.create(ContentApi::class.java)) 
    }
}
