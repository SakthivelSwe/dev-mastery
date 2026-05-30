package com.example.devmastery.progress.data.remote

import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path

data class LayerCompletionRequest(
    val topicId: String,
    val layerName: String
)

data class ReviewRatingRequest(
    val rating: String
)

data class SpacedReviewDto(
    val id: String,
    val topicId: String,
    val topicSlug: String,
    val easinessFactor: Float,
    val intervalDays: Int,
    val repetitions: Int,
    val nextReviewDate: String
)

data class StreakDto(
    val currentStreak: Int,
    val longestStreak: Int,
    val lastActivityDate: String?
)

data class ProgressSummaryDto(
    val totalXp: Int,
    val level: Int,
    val completedTopics: Int,
    val streak: Int,
    val dueReviewsCount: Int
)

interface ProgressApi {
    @GET("progress/summary")
    suspend fun getSummary(): ProgressSummaryDto

    @GET("progress/streak")
    suspend fun getStreak(): StreakDto

    @POST("progress/layers/complete")
    suspend fun completeLayer(@Body request: LayerCompletionRequest)

    @GET("progress/reviews/due")
    suspend fun getDueReviews(): List<SpacedReviewDto>

    @POST("progress/reviews/{topicId}")
    suspend fun submitReview(@Path("topicId") topicId: String, @Body request: ReviewRatingRequest)
}
