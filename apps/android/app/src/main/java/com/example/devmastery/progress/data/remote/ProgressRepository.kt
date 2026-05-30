package com.example.devmastery.progress.data.remote

class ProgressRepository(private val progressApi: ProgressApi) {

    suspend fun getSummary(): Result<ProgressSummaryDto> = runCatching { progressApi.getSummary() }

    suspend fun completeLayer(topicId: String, layerName: String): Result<Unit> = runCatching {
        progressApi.completeLayer(LayerCompletionRequest(topicId, layerName))
    }

    suspend fun getDueReviews(): Result<List<SpacedReviewDto>> = runCatching { progressApi.getDueReviews() }

    suspend fun submitReview(topicId: String, rating: String): Result<Unit> = runCatching {
        progressApi.submitReview(topicId, ReviewRatingRequest(rating))
    }
}
