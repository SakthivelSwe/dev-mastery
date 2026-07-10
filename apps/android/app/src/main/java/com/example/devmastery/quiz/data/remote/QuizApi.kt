package com.example.devmastery.quiz.data.remote

import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path

// Mirrors com.devmastery.quiz.api.QuizService (UUIDs serialize as strings)

data class QuizQuestionDto(
    val id: String,
    val prompt: String,
    val options: List<String> = emptyList()
)

data class QuizViewDto(
    val id: String,
    val title: String,
    val topicId: String? = null,
    val questions: List<QuizQuestionDto> = emptyList()
)

data class QuizResultDto(
    val quizId: String,
    val score: Int = 0,
    val maxScore: Int = 0,
    val perQuestion: Map<String, Boolean> = emptyMap(),
    val newDifficultyLevel: Int = 1
)

interface QuizApi {
    @GET("quizzes/{quizId}")
    suspend fun getQuiz(@Path("quizId") quizId: String): QuizViewDto

    /** Body is a map of questionId -> selected answer text. */
    @POST("quizzes/{quizId}/submit")
    suspend fun submit(
        @Path("quizId") quizId: String,
        @Body answers: Map<String, String>
    ): QuizResultDto
}

