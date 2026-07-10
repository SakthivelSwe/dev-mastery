package com.example.devmastery.progress.data.remote

class ProgressRepository(
    private val progressApi: ProgressApi
) {
    suspend fun completeLayer(topicId: String, layerName: String): Result<Unit> {
        return try {
            progressApi.completeLayer(LayerCompletionRequest(topicId, layerName))
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getDueReviews(): Result<List<SpacedReviewDto>> {
        return try {
            val response = progressApi.getDueReviews()
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun submitReview(topicId: String, rating: String): Result<Unit> {
        return try {
            progressApi.submitReview(topicId, ReviewRatingRequest(rating))
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getSummary(userId: String): Result<ProgressSummaryDto> {
        return try {
            Result.success(progressApi.getSummary(userId))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
