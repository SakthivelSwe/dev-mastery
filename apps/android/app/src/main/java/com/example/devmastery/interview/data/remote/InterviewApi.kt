package com.example.devmastery.interview.data.remote

import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path

// Mirrors the interview contract in apps/web/src/lib/api.ts

data class TranscriptTurnDto(
    val role: String,   // "user" | "model"
    val content: String,
    val at: String? = null
)

data class SaveInterviewRequest(
    val topicSlug: String,
    val targetLevel: String,
    val startedAt: String,
    val endedAt: String,
    val transcript: List<TranscriptTurnDto>,
    val scoreCard: InterviewScoreCardDto? = null
)

data class SaveInterviewResponse(val id: String)

data class GradeInterviewRequest(val scorecardText: String)

data class InterviewScoreCardDto(
    val verdict: String = "",
    val technical: Int = 0,
    val communication: Int = 0,
    val problemSolving: Int = 0,
    val seniority: Int = 0,
    val strengths: List<String> = emptyList(),
    val improvements: List<String> = emptyList()
)

data class InterviewSessionSummaryDto(
    val id: String,
    val topicSlug: String,
    val targetLevel: String,
    val startedAt: String,
    val endedAt: String? = null,
    val verdict: String? = null
)

// GET /v1/interviews/{id} — mirrors com.devmastery.ai.api.InterviewService.SessionDetail
data class InterviewSessionDetailDto(
    val summary: InterviewSessionSummaryDto,
    val transcript: List<TranscriptTurnDto> = emptyList(),
    val scoreCard: InterviewScoreCardDto? = null
)

interface InterviewApi {
    @POST("interviews")
    suspend fun save(@Body request: SaveInterviewRequest): SaveInterviewResponse

    @GET("interviews")
    suspend fun history(): List<InterviewSessionSummaryDto>

    @GET("interviews/{id}")
    suspend fun detail(@Path("id") id: String): InterviewSessionDetailDto

    @POST("interviews/{id}/grade")
    suspend fun grade(
        @Path("id") id: String,
        @Body request: GradeInterviewRequest
    ): InterviewScoreCardDto
}

