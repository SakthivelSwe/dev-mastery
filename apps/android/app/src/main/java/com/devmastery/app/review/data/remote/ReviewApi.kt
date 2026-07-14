package com.devmastery.app.review.data.remote

import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path

data class ReviewItemDto(
    val topicId: String,
    val topicSlug: String?,
    val dueDate: String,
    val repetitions: Int,
    val easeFactor: Double,
)

data class RatingRequest(val rating: Int)

interface ReviewApi {
    @GET("v1/progress/reviews/due")
    suspend fun getDueReviews(): List<ReviewItemDto>

    @POST("v1/progress/reviews/{topicId}")
    suspend fun submitRating(
        @Path("topicId") topicId: String,
        @Body req: RatingRequest,
    )
}
