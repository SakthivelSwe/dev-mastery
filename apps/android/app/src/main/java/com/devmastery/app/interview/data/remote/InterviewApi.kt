package com.devmastery.app.interview.data.remote

import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path

// ── DTOs ───────────────────────────────────────────────────────────────────

data class InterviewTranscriptTurn(
    val role: String,      // "user" | "model"
    val content: String,
    val at: String? = null,
)

data class InterviewScoreCard(
    val verdict: String,
    val technical: Int,
    val communication: Int,
    val problemSolving: Int,
    val seniority: Int,
    val strengths: List<String>,
    val improvements: List<String>,
)

data class InterviewSessionSummary(
    val id: String,
    val topicSlug: String,
    val targetLevel: String,
    val startedAt: String,
    val endedAt: String?,
    val verdict: String?,
)

data class InterviewSessionDetail(
    val summary: InterviewSessionSummary,
    val transcript: List<InterviewTranscriptTurn>,
    val scoreCard: InterviewScoreCard?,
)

data class SaveSessionRequest(
    val topicSlug: String,
    val targetLevel: String,
    val startedAt: String,
    val endedAt: String,
    val transcript: List<InterviewTranscriptTurn>,
    val scoreCard: InterviewScoreCard?,
)

data class GradeRequest(val scorecardText: String)

data class SavedIdResponse(val id: String)

// ── Retrofit interface ─────────────────────────────────────────────────────

interface InterviewApi {
    @POST("v1/interviews")
    suspend fun saveSession(@Body req: SaveSessionRequest): SavedIdResponse

    @GET("v1/interviews")
    suspend fun listSessions(): List<InterviewSessionSummary>

    @GET("v1/interviews/{id}")
    suspend fun getSession(@Path("id") id: String): InterviewSessionDetail

    @POST("v1/interviews/{id}/grade")
    suspend fun gradeSession(@Path("id") id: String, @Body req: GradeRequest): InterviewScoreCard
}
