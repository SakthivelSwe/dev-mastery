package com.devmastery.app.review.data

import com.devmastery.app.review.data.remote.RatingRequest
import com.devmastery.app.review.data.remote.ReviewApi
import com.devmastery.app.review.data.remote.ReviewItemDto
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ReviewRepository @Inject constructor(private val api: ReviewApi) {
    suspend fun getDueReviews(): Result<List<ReviewItemDto>> = runCatching { api.getDueReviews() }
    suspend fun submitRating(topicId: String, rating: Int): Result<Unit> =
        runCatching { api.submitRating(topicId, RatingRequest(rating)) }
}
