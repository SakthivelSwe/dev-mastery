package com.example.devmastery.progress.data.remote

import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
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

// ─── Progress summary (mirrors web `UserProgress` in apps/web/src/lib/api.ts) ──

data class PathProgressDto(
    val pathSlug: String,
    val completedTopics: Int,
    val totalTopics: Int,
    val percentComplete: Double,
    val xpEarned: Int
)

data class ActivityItemDto(
    val date: String,
    val xpEarned: Int,
    val topicsCompleted: Int
)

data class ProgressSummaryDto(
    val totalXp: Int,
    val streak: Int,
    val rank: String,
    val pathProgress: List<PathProgressDto> = emptyList(),
    val recentActivity: List<ActivityItemDto> = emptyList()
)

interface ProgressApi {
    @POST("progress/layers/complete")
    suspend fun completeLayer(@Body request: LayerCompletionRequest)

    @GET("progress/reviews/due")
    suspend fun getDueReviews(): List<SpacedReviewDto>

    @POST("progress/reviews/{topicId}")
    suspend fun submitReview(@Path("topicId") topicId: String, @Body request: ReviewRatingRequest)

    @GET("progress/summary")
    suspend fun getSummary(@Header("X-User-Id") userId: String): ProgressSummaryDto
}
