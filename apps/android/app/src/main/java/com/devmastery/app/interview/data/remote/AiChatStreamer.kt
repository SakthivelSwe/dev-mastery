package com.devmastery.app.interview.data.remote

import com.devmastery.app.core.data.local.TokenManager
import com.devmastery.app.core.data.remote.ApiClient
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import okhttp3.sse.EventSource
import okhttp3.sse.EventSourceListener
import okhttp3.sse.EventSources
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Connects to /v1/ai/chat via OkHttp SSE.
 * Emits each text token as a String through the returned Flow.
 * On completion emits null to signal end-of-stream.
 */
@Singleton
class AiChatStreamer @Inject constructor(
    private val client: OkHttpClient,
    private val tokenManager: TokenManager,
) {
    fun streamChat(
        message: String,
        topicSlug: String,
        sectionType: String = "theory",
    ): Flow<String?> = callbackFlow {
        val token = kotlinx.coroutines.runBlocking { tokenManager.getToken() }
        val url   = "${ApiClient.BASE_URL}/v1/ai/chat" +
                    "?topicSlug=${topicSlug}&sectionType=${sectionType}&message=${java.net.URLEncoder.encode(message, "UTF-8")}"

        val request = Request.Builder()
            .url(url)
            .apply { if (token != null) addHeader("Authorization", "Bearer $token") }
            .build()

        val listener = object : EventSourceListener() {
            override fun onEvent(eventSource: EventSource, id: String?, type: String?, data: String) {
                if (data != "[DONE]") trySend(data)
            }
            override fun onClosed(eventSource: EventSource) {
                trySend(null)
                close()
            }
            override fun onFailure(eventSource: EventSource, t: Throwable?, response: Response?) {
                close(t ?: Exception("SSE error: ${response?.code}"))
            }
        }

        val factory = EventSources.createFactory(client)
        val source  = factory.newEventSource(request, listener)

        awaitClose { source.cancel() }
    }
}
