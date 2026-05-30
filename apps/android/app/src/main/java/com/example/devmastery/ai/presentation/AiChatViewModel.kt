package com.example.devmastery.ai.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.CreationExtras
import com.example.devmastery.DevMasteryApp
import com.example.devmastery.ai.data.remote.AiRepository
import com.example.devmastery.ai.data.remote.ChatMessage
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class AiChatUiState(
    val messages: List<ChatMessage> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null
)

class AiChatViewModel(
    private val aiRepository: AiRepository,
    private val topicSlug: String
) : ViewModel() {

    private val _uiState = MutableStateFlow(AiChatUiState())
    val uiState: StateFlow<AiChatUiState> = _uiState.asStateFlow()

    fun sendMessage(message: String) {
        val userMsg = ChatMessage("user", message)
        _uiState.value = _uiState.value.copy(
            messages = _uiState.value.messages + userMsg,
            isLoading = true,
            error = null
        )

        viewModelScope.launch {
            aiRepository.sendMessage(message, topicSlug)
                .onSuccess { reply ->
                    val assistantMsg = ChatMessage("assistant", reply)
                    _uiState.value = _uiState.value.copy(
                        messages = _uiState.value.messages + assistantMsg,
                        isLoading = false
                    )
                }
                .onFailure { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = error.message ?: "Failed to get response"
                    )
                }
        }
    }

    companion object {
        fun factory(topicSlug: String): ViewModelProvider.Factory =
            object : ViewModelProvider.Factory {
                @Suppress("UNCHECKED_CAST")
                override fun <T : ViewModel> create(modelClass: Class<T>, extras: CreationExtras): T {
                    val app = checkNotNull(extras[ViewModelProvider.AndroidViewModelFactory.APPLICATION_KEY]) as DevMasteryApp
                    return AiChatViewModel(app.container.aiRepository, topicSlug) as T
                }
            }
    }
}

