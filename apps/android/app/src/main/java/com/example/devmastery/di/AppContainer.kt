package com.example.devmastery.di

import android.content.Context
import com.example.devmastery.BuildConfig
import com.example.devmastery.auth.data.local.TokenManager
import com.example.devmastery.auth.data.remote.AuthApi
import com.example.devmastery.auth.data.remote.AuthRepository
import com.example.devmastery.content.data.remote.ContentApi
import com.example.devmastery.content.data.remote.ContentRepository
import com.example.devmastery.core.network.AuthInterceptor
import com.example.devmastery.ai.data.remote.AiApi
import com.example.devmastery.ai.data.remote.AiChatStreamer
import com.example.devmastery.ai.data.remote.AiRepository
import okhttp3.Cache
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

class AppContainer(private val context: Context) {
    private val BASE_URL = BuildConfig.API_BASE_URL

    // Created first so the auth interceptor can read the token on every request.
    val tokenManager = TokenManager(context)

    // 10 MB shared HTTP response cache. The backend now sends
    // `Cache-Control: public, max-age=600, stale-while-revalidate=3600`
    // on public content endpoints — OkHttp will honour it automatically and
    // serve most /paths, /topics/{slug}, /patterns calls straight from disk,
    // which is critical while Render's free tier is cold-starting (30–60s).
    private val httpCache = Cache(
        directory = java.io.File(context.cacheDir, "http_cache"),
        maxSize   = 10L * 1024L * 1024L,
    )

    private val okHttpClient = OkHttpClient.Builder()
        .cache(httpCache)
        // Render free-tier cold starts can push the first request past the
        // default 10s. Give the first byte a fighting chance without holding
        // sockets open forever on subsequent fast requests.
        .connectTimeout(20, TimeUnit.SECONDS)
        .readTimeout(45, TimeUnit.SECONDS)
        .callTimeout(60, TimeUnit.SECONDS)
        .retryOnConnectionFailure(true)
        .addInterceptor(AuthInterceptor(tokenManager))
        .apply {
            // Full request/response logging (incl. Authorization headers) only in
            // debug builds — never leak tokens/passwords to logcat in release.
            if (BuildConfig.DEBUG) {
                addInterceptor(
                    // HEADERS (not BODY) in debug too — BODY-level logging on
                    // every response noticeably slows down the emulator and
                    // spams logcat. Flip to BODY temporarily when debugging.
                    HttpLoggingInterceptor().apply { level = HttpLoggingInterceptor.Level.HEADERS }
                )
            }
        }
        .build()

    private val retrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(okHttpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()

    val authRepository by lazy {
        AuthRepository(retrofit.create(AuthApi::class.java)) 
    }
    
    val contentRepository by lazy { 
        ContentRepository(
            retrofit.create(ContentApi::class.java),
            com.example.devmastery.content.data.local.TopicCache(context)
        )
    }

    val progressApi by lazy {
        retrofit.create(com.example.devmastery.progress.data.remote.ProgressApi::class.java)
    }

    val progressRepository by lazy {
        com.example.devmastery.progress.data.remote.ProgressRepository(progressApi)
    }

    val aiRepository by lazy {
        AiRepository(
            retrofit.create(AiApi::class.java),
            AiChatStreamer(okHttpClient, BASE_URL)
        )
    }

    val patternsRepository by lazy {
        com.example.devmastery.patterns.data.remote.PatternsRepository(
            retrofit.create(com.example.devmastery.patterns.data.remote.PatternsApi::class.java)
        )
    }

    val interviewRepository by lazy {
        com.example.devmastery.interview.data.remote.InterviewRepository(
            retrofit.create(com.example.devmastery.interview.data.remote.InterviewApi::class.java)
        )
    }

    val profileRepository by lazy {
        com.example.devmastery.profile.data.remote.ProfileRepository(
            retrofit.create(com.example.devmastery.profile.data.remote.ProfileApi::class.java)
        )
    }

    val quizRepository by lazy {
        com.example.devmastery.quiz.data.remote.QuizRepository(
            retrofit.create(com.example.devmastery.quiz.data.remote.QuizApi::class.java)
        )
    }

    val searchRepository by lazy {
        com.example.devmastery.search.data.remote.SearchRepository(
            retrofit.create(com.example.devmastery.search.data.remote.SearchApi::class.java)
        )
    }
}
