package com.devmastery.app.interview.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.devmastery.app.interview.data.InterviewRepository
import com.devmastery.app.interview.data.remote.AiChatStreamer
import com.devmastery.app.interview.data.remote.InterviewScoreCard
import com.devmastery.app.interview.data.remote.InterviewSessionSummary
import com.devmastery.app.interview.data.remote.InterviewTranscriptTurn
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.launch
import java.time.Instant
import javax.inject.Inject

data class ChatMessage(
    val role: String,     // "user" | "model"
    val content: String,
    val isStreaming: Boolean = false,
)

data class InterviewUiState(
    val topicSlug: String   = "java-hashmap-internal",
    val level: String       = "mid",
    val started: Boolean    = false,
    val messages: List<ChatMessage> = emptyList(),
    val isLoading: Boolean  = false,
    val scoreCard: InterviewScoreCard? = null,
    val sessionId: String?  = null,
    val startedAt: String?  = null,
    val error: String?      = null,
)

// ── History ───────────────────────────────────────────────────────────────────

sealed class HistoryUiState {
    object Loading : HistoryUiState()
    data class Success(val sessions: List<InterviewSessionSummary>) : HistoryUiState()
    data class Error(val msg: String) : HistoryUiState()
}

@HiltViewModel
class InterviewViewModel @Inject constructor(
    private val repo: InterviewRepository,
    private val streamer: AiChatStreamer,
) : ViewModel() {

    private val _state = MutableStateFlow(InterviewUiState())
    val state: StateFlow<InterviewUiState> = _state.asStateFlow()

    private val _historyState = MutableStateFlow<HistoryUiState>(HistoryUiState.Loading)
    val historyState: StateFlow<HistoryUiState> = _historyState.asStateFlow()

    // ── Config ────────────────────────────────────────────────────────────────

    fun setTopicSlug(slug: String) { _state.value = _state.value.copy(topicSlug = slug) }
    fun setLevel(level: String)    { _state.value = _state.value.copy(level = level) }

    // ── Start ─────────────────────────────────────────────────────────────────

    fun startInterview() {
        val startedAt = Instant.now().toString()
        val opening   = buildOpening(_state.value.level, _state.value.topicSlug)
        _state.value  = _state.value.copy(started = true, startedAt = startedAt, messages = emptyList())
        sendMessage(opening, isOpening = true)
    }

    // ── Send message ──────────────────────────────────────────────────────────

    fun sendMessage(content: String, isOpening: Boolean = false) {
        val userMsg = if (!isOpening) content else null
        val current = _state.value

        val messages = if (userMsg != null)
            current.messages + ChatMessage("user", userMsg)
        else current.messages

        _state.value = current.copy(
            messages  = messages + ChatMessage("model", "", isStreaming = true),
            isLoading = true,
        )

        viewModelScope.launch {
            var accumulated = ""
            streamer.streamChat(
                message     = content,
                topicSlug   = current.topicSlug,
                sectionType = "interview",
            )
            .catch { _state.value = _state.value.copy(isLoading = false, error = it.message) }
            .collect { token ->
                if (token == null) {
                    // Stream ended
                    val finalMessages = _state.value.messages.toMutableList()
                    finalMessages[finalMessages.lastIndex] =
                        ChatMessage("model", accumulated, isStreaming = false)
                    _state.value = _state.value.copy(messages = finalMessages, isLoading = false)
                } else {
                    accumulated += token
                    val streamingMessages = _state.value.messages.toMutableList()
                    streamingMessages[streamingMessages.lastIndex] =
                        ChatMessage("model", accumulated, isStreaming = true)
                    _state.value = _state.value.copy(messages = streamingMessages)
                }
            }
        }
    }

    // ── Finish ────────────────────────────────────────────────────────────────

    fun finishAndGrade() {
        val current = _state.value
        val endedAt = Instant.now().toString()
        val transcript = current.messages.map {
            InterviewTranscriptTurn(it.role, it.content)
        }
        viewModelScope.launch {
            // Save session
            val idResult = repo.saveSession(
                topicSlug   = current.topicSlug,
                targetLevel = current.level,
                startedAt   = current.startedAt ?: endedAt,
                endedAt     = endedAt,
                transcript  = transcript,
                scoreCard   = null,
            )
            val sessionId = idResult.getOrNull() ?: return@launch

            // Grade — last AI message contains the scorecard text
            val lastAiMsg = current.messages.lastOrNull { it.role == "model" }?.content ?: ""
            val scoreCard = repo.gradeSession(sessionId, lastAiMsg).getOrNull()
            _state.value  = current.copy(sessionId = sessionId, scoreCard = scoreCard)
        }
    }

    // ── History ───────────────────────────────────────────────────────────────

    fun loadHistory() {
        viewModelScope.launch {
            _historyState.value = HistoryUiState.Loading
            repo.listSessions().fold(
                onSuccess = { _historyState.value = HistoryUiState.Success(it) },
                onFailure = { _historyState.value = HistoryUiState.Error(it.message ?: "Error") },
            )
        }
    }

    fun resetInterview() {
        _state.value = InterviewUiState()
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private fun buildOpening(level: String, topicSlug: String) =
        "You are a strict senior engineer interviewing a $level engineer on the topic: " +
        "${topicSlug.replace("-", " ")}. Ask one focused technical question. Be concise."
}
