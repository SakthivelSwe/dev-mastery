package com.example.devmastery.ai.data.remote

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.flow.flowOn
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.util.concurrent.TimeUnit

/**
 * Streams the AI assistant's Server-Sent-Events response token-by-token.
 *
 * Mirrors the web SSE contract in `apps/web/src/hooks/useAiChat.ts`:
 *   POST /v1/ai/chat  { userQuery, topicSlug, sectionType, history: [] }
 *   → lines "data: <token>", newlines escaped as "\\n", terminated by "data: [DONE]".
 *
 * The shared OkHttpClient already carries the AuthInterceptor, so the bearer
 * token is attached automatically.
 */
class AiChatStreamer(
    baseClient: OkHttpClient,
    private val baseUrl: String
) {
    // SSE needs a long read timeout — the model streams over many seconds.
    private val client = baseClient.newBuilder()
        .readTimeout(0, TimeUnit.MILLISECONDS)
        .build()

    fun stream(
        userQuery: String,
        topicSlug: String,
        sectionType: String?
    ): Flow<String> = callbackFlow {
        val json = JSONObject().apply {
            put("userQuery", userQuery)
            put("topicSlug", topicSlug)
            put("sectionType", sectionType ?: JSONObject.NULL)
            put("history", JSONArray())
        }

        val request = Request.Builder()
            .url(baseUrl + "ai/chat")
            .addHeader("Accept", "text/event-stream")
            .post(json.toString().toRequestBody("application/json".toMediaType()))
            .build()

        val call = client.newCall(request)
        try {
            call.execute().use { response ->
                if (!response.isSuccessful) {
                    close(IllegalStateException("HTTP ${response.code}"))
                    return@use
                }
                val source = response.body?.source()
                if (source == null) {
                    close(IllegalStateException("Empty response body"))
                    return@use
                }
                while (!source.exhausted()) {
                    val line = source.readUtf8Line() ?: break
                    if (!line.startsWith("data:")) continue
                    val token = line.substring(5).let {
                        if (it.startsWith(" ")) it.substring(1) else it
                    }
                    if (token.isEmpty() || token == "[DONE]") {
                        if (token == "[DONE]") break else continue
                    }
                    // Server escapes newlines as "\\n" — restore them.
                    trySend(token.replace("\\n", "\n"))
                }
            }
            close()
        } catch (e: Exception) {
            close(e)
        }

        awaitClose { call.cancel() }
    }.flowOn(Dispatchers.IO)
}

