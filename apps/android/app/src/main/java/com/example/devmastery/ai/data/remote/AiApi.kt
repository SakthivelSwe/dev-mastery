package com.example.devmastery.ai.data.remote

import retrofit2.http.Body
import retrofit2.http.POST

data class ChatRequest(
    val message: String,
    val topicSlug: String,
    val sectionType: String? = null
)

data class ChatMessage(
    val role: String,   // "user" or "assistant"
    val content: String
)

data class ChatResponse(
    val reply: String
)

interface AiApi {
    // Non-streaming sync endpoint — collects full response as JSON (used by Android)
    @POST("ai/chat/sync")
    suspend fun chat(@Body request: ChatRequest): ChatResponse
}

