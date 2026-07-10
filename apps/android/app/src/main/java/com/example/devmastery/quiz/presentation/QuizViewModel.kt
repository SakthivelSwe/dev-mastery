package com.example.devmastery.quiz.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.CreationExtras
import com.example.devmastery.DevMasteryApp
import com.example.devmastery.quiz.data.remote.QuizRepository
import com.example.devmastery.quiz.data.remote.QuizResultDto
import com.example.devmastery.quiz.data.remote.QuizViewDto
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class QuizState {
    object Loading : QuizState()
    data class Taking(
        val quiz: QuizViewDto,
        val answers: Map<String, String> = emptyMap(),
        val submitting: Boolean = false
    ) : QuizState()
    data class Done(val quiz: QuizViewDto, val result: QuizResultDto) : QuizState()
    data class Error(val message: String) : QuizState()
}

class QuizViewModel(
    private val repository: QuizRepository,
    private val quizId: String
) : ViewModel() {

    private val _state = MutableStateFlow<QuizState>(QuizState.Loading)
    val state: StateFlow<QuizState> = _state.asStateFlow()

    init { load() }

    fun load() {
        _state.value = QuizState.Loading
        viewModelScope.launch {
            repository.getQuiz(quizId)
                .onSuccess { _state.value = QuizState.Taking(it) }
                .onFailure { _state.value = QuizState.Error(it.message ?: "Failed to load quiz") }
        }
    }

    fun selectAnswer(questionId: String, option: String) {
        val current = _state.value
        if (current is QuizState.Taking) {
            _state.value = current.copy(answers = current.answers + (questionId to option))
        }
    }

    fun submit() {
        val current = _state.value
        if (current !is QuizState.Taking || current.submitting) return
        _state.value = current.copy(submitting = true)
        viewModelScope.launch {
            repository.submit(quizId, current.answers)
                .onSuccess { _state.value = QuizState.Done(current.quiz, it) }
                .onFailure {
                    _state.value = QuizState.Error(it.message ?: "Failed to submit quiz")
                }
        }
    }

    companion object {
        fun factory(quizId: String): ViewModelProvider.Factory =
            object : ViewModelProvider.Factory {
                @Suppress("UNCHECKED_CAST")
                override fun <T : ViewModel> create(modelClass: Class<T>, extras: CreationExtras): T {
                    val app = checkNotNull(
                        extras[ViewModelProvider.AndroidViewModelFactory.APPLICATION_KEY]
                    ) as DevMasteryApp
                    return QuizViewModel(app.container.quizRepository, quizId) as T
                }
            }
    }
}

