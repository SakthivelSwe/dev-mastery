package com.example.devmastery.ai.data.remote

import retrofit2.http.Body
import retrofit2.http.POST

// ── Feynman scoring (mirrors web useFeynmanScore in apps/web/src/hooks/useAiChat.ts) ──

data class FeynmanScoreRequest(
    val topicSlug: String,
    val topicTitle: String,
    val explanation: String
)

data class FeynmanScoreDto(
    val score: Int = 0,
    val feedback: String = "",
    val gaps: List<String> = emptyList(),
    val passed: Boolean = false
)

interface AiApi {
    @POST("ai/feynman/score")
    suspend fun scoreFeynman(@Body request: FeynmanScoreRequest): FeynmanScoreDto
}

