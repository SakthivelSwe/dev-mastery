package com.example.devmastery.interview.data.remote

class InterviewRepository(
    private val interviewApi: InterviewApi
) {
    suspend fun save(request: SaveInterviewRequest): Result<String> = try {
        Result.success(interviewApi.save(request).id)
    } catch (e: Exception) {
        Result.failure(e)
    }

    suspend fun grade(id: String, scorecardText: String): Result<InterviewScoreCardDto> = try {
        Result.success(interviewApi.grade(id, GradeInterviewRequest(scorecardText)))
    } catch (e: Exception) {
        Result.failure(e)
    }

    suspend fun history(): Result<List<InterviewSessionSummaryDto>> = try {
        Result.success(interviewApi.history())
    } catch (e: Exception) {
        Result.failure(e)
    }

    suspend fun detail(id: String): Result<InterviewSessionDetailDto> = try {
        Result.success(interviewApi.detail(id))
    } catch (e: Exception) {
        Result.failure(e)
    }
}

