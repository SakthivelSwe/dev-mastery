package com.example.devmastery.content.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.devmastery.content.data.remote.ContentRepository
import com.example.devmastery.content.data.remote.TopicDto
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewmodel.CreationExtras
import com.example.devmastery.DevMasteryApp
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class TopicState {
    object Loading : TopicState()
    data class Success(val topic: TopicDto) : TopicState()
    data class Error(val message: String) : TopicState()
}

class TopicViewModel(
    private val contentRepository: ContentRepository
) : ViewModel() {

    private val _topicState = MutableStateFlow<TopicState>(TopicState.Loading)
    val topicState: StateFlow<TopicState> = _topicState.asStateFlow()

    fun loadTopic(slug: String) {
        _topicState.value = TopicState.Loading
        viewModelScope.launch {
            val result = contentRepository.getTopic(slug)
            result.onSuccess { topic ->
                _topicState.value = TopicState.Success(topic)
            }.onFailure { error ->
                _topicState.value = TopicState.Error(error.message ?: "Failed to load topic")
            }
        }
    }

    companion object {
        val Factory: ViewModelProvider.Factory = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(
                modelClass: Class<T>,
                extras: CreationExtras
            ): T {
                val application = checkNotNull(extras[ViewModelProvider.AndroidViewModelFactory.APPLICATION_KEY]) as DevMasteryApp
                return TopicViewModel(
                    application.container.contentRepository
                ) as T
            }
        }
    }
}
