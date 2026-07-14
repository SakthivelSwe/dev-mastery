package com.devmastery.app.core.di

import android.content.Context
import com.devmastery.app.auth.data.remote.AuthApi
import com.devmastery.app.core.data.local.TokenManager
import com.devmastery.app.core.data.remote.ApiClient
import com.devmastery.app.dashboard.data.remote.DashboardApi
import com.devmastery.app.interview.data.remote.InterviewApi
import com.devmastery.app.learn.data.remote.ContentApi
import com.devmastery.app.learn.data.remote.ProgressApi
import com.devmastery.app.review.data.remote.ReviewApi
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    @Provides @Singleton
    fun provideTokenManager(@ApplicationContext ctx: Context): TokenManager = TokenManager(ctx)

    @Provides @Singleton
    fun provideOkHttpClient(tokenManager: TokenManager): OkHttpClient {
        ApiClient.init(tokenManager)
        return ApiClient.okHttpClient
    }

    @Provides @Singleton
    fun provideRetrofit(okHttpClient: OkHttpClient): Retrofit = ApiClient.retrofit

    // ── API services ─────────────────────────────────────────────────────

    @Provides @Singleton
    fun provideAuthApi(retrofit: Retrofit): AuthApi = retrofit.create(AuthApi::class.java)

    @Provides @Singleton
    fun provideContentApi(retrofit: Retrofit): ContentApi = retrofit.create(ContentApi::class.java)

    @Provides @Singleton
    fun provideProgressApi(retrofit: Retrofit): ProgressApi = retrofit.create(ProgressApi::class.java)

    @Provides @Singleton
    fun provideDashboardApi(retrofit: Retrofit): DashboardApi = retrofit.create(DashboardApi::class.java)

    @Provides @Singleton
    fun provideReviewApi(retrofit: Retrofit): ReviewApi = retrofit.create(ReviewApi::class.java)

    @Provides @Singleton
    fun provideInterviewApi(retrofit: Retrofit): InterviewApi = retrofit.create(InterviewApi::class.java)
}
