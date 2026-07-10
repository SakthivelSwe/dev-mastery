package com.example.devmastery.quiz.presentation

import com.example.devmastery.MainDispatcherRule
import com.example.devmastery.quiz.data.remote.QuizApi
import com.example.devmastery.quiz.data.remote.QuizQuestionDto
import com.example.devmastery.quiz.data.remote.QuizRepository
import com.example.devmastery.quiz.data.remote.QuizResultDto
import com.example.devmastery.quiz.data.remote.QuizViewDto
import junit.framework.TestCase.assertEquals
import junit.framework.TestCase.assertTrue
import kotlinx.coroutines.test.runTest
import org.junit.Rule
import org.junit.Test

class QuizViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val quiz = QuizViewDto(
        id = "quiz-1",
        title = "Sample Quiz",
        topicId = "topic-1",
        questions = listOf(
            QuizQuestionDto("q1", "1 + 1 = ?", listOf("1", "2", "3")),
            QuizQuestionDto("q2", "Capital of France?", listOf("Paris", "Rome"))
        )
    )

    private class FakeQuizApi(
        private val quiz: QuizViewDto,
        private val result: QuizResultDto
    ) : QuizApi {
        override suspend fun getQuiz(quizId: String): QuizViewDto = quiz
        override suspend fun submit(quizId: String, answers: Map<String, String>): QuizResultDto = result
    }

    private fun viewModel(): QuizViewModel {
        val result = QuizResultDto("quiz-1", score = 2, maxScore = 2, newDifficultyLevel = 3)
        return QuizViewModel(QuizRepository(FakeQuizApi(quiz, result)), "quiz-1")
    }

    @Test
    fun loadsQuiz_intoTakingState() = runTest {
        val state = viewModel().state.value
        assertTrue(state is QuizState.Taking)
        assertEquals(2, (state as QuizState.Taking).quiz.questions.size)
    }

    @Test
    fun selectAnswer_recordsChoice() = runTest {
        val vm = viewModel()
        vm.selectAnswer("q1", "2")
        val state = vm.state.value as QuizState.Taking
        assertEquals("2", state.answers["q1"])
    }

    @Test
    fun submit_producesDoneStateWithScore() = runTest {
        val vm = viewModel()
        vm.selectAnswer("q1", "2")
        vm.selectAnswer("q2", "Paris")
        vm.submit()
        val state = vm.state.value
        assertTrue(state is QuizState.Done)
        state as QuizState.Done
        assertEquals(2, state.result.score)
        assertEquals(3, state.result.newDifficultyLevel)
    }
}
