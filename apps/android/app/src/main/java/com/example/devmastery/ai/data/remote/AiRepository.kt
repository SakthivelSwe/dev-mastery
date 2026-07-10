package com.example.devmastery.ai.data.remote

import kotlinx.coroutines.flow.Flow

class AiRepository(
    private val aiApi: AiApi,
    private val streamer: AiChatStreamer
) {
    /** Live token stream for the AI mentor chat. */
    fun streamChat(userQuery: String, topicSlug: String, sectionType: String?): Flow<String> =
        streamer.stream(userQuery, topicSlug, sectionType)

    suspend fun scoreFeynman(
        topicSlug: String,
        topicTitle: String,
        explanation: String
    ): Result<FeynmanScoreDto> {
        return try {
            Result.success(aiApi.scoreFeynman(FeynmanScoreRequest(topicSlug, topicTitle, explanation)))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

