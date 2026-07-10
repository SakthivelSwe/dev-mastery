package com.example.devmastery.ai.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.CreationExtras
import com.example.devmastery.DevMasteryApp
import com.example.devmastery.ai.data.remote.AiRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.launch

data class ChatMessage(
    val role: Role,
    val content: String
) {
    enum class Role { USER, AI }
}

data class AiChatUiState(
    val messages: List<ChatMessage> = emptyList(),
    val isLoading: Boolean = false
)

class AiChatViewModel(
    private val aiRepository: AiRepository,
    private val topicSlug: String,
    private val sectionType: String?
) : ViewModel() {

    private val _state = MutableStateFlow(AiChatUiState())
    val state: StateFlow<AiChatUiState> = _state.asStateFlow()

    fun sendMessage(text: String) {
        val trimmed = text.trim()
        if (trimmed.isEmpty() || _state.value.isLoading) return

        // Append the user message + an empty AI placeholder to stream into.
        _state.value = _state.value.copy(
            messages = _state.value.messages +
                ChatMessage(ChatMessage.Role.USER, trimmed) +
                ChatMessage(ChatMessage.Role.AI, ""),
            isLoading = true
        )

        viewModelScope.launch {
            aiRepository.streamChat(trimmed, topicSlug, sectionType)
                .catch { appendToLast("\n\n⚠️ Couldn't reach the AI service. Please try again.") }
                .collect { token -> appendToLast(token) }
            _state.value = _state.value.copy(isLoading = false)
        }
    }

    private fun appendToLast(delta: String) {
        val msgs = _state.value.messages.toMutableList()
        val lastIndex = msgs.lastIndex
        if (lastIndex >= 0 && msgs[lastIndex].role == ChatMessage.Role.AI) {
            msgs[lastIndex] = msgs[lastIndex].copy(content = msgs[lastIndex].content + delta)
            _state.value = _state.value.copy(messages = msgs)
        }
    }

    companion object {
        fun factory(topicSlug: String, sectionType: String?): ViewModelProvider.Factory =
            object : ViewModelProvider.Factory {
                @Suppress("UNCHECKED_CAST")
                override fun <T : ViewModel> create(modelClass: Class<T>, extras: CreationExtras): T {
                    val app = checkNotNull(
                        extras[ViewModelProvider.AndroidViewModelFactory.APPLICATION_KEY]
                    ) as DevMasteryApp
                    return AiChatViewModel(app.container.aiRepository, topicSlug, sectionType) as T
                }
            }
    }
}

