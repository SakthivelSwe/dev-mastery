package com.example.devmastery.quiz.data.remote

class QuizRepository(
    private val quizApi: QuizApi
) {
    suspend fun getQuiz(quizId: String): Result<QuizViewDto> = try {
        Result.success(quizApi.getQuiz(quizId))
    } catch (e: Exception) {
        Result.failure(e)
    }

    suspend fun submit(quizId: String, answers: Map<String, String>): Result<QuizResultDto> = try {
        Result.success(quizApi.submit(quizId, answers))
    } catch (e: Exception) {
        Result.failure(e)
    }
}

