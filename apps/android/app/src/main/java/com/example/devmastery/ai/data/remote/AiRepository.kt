package com.example.devmastery.ai.data.remote

class AiRepository(private val aiApi: AiApi) {

    suspend fun sendMessage(
        message: String,
        topicSlug: String,
        sectionType: String? = null
    ): Result<String> = runCatching {
        aiApi.chat(ChatRequest(message, topicSlug, sectionType)).reply
    }
}

