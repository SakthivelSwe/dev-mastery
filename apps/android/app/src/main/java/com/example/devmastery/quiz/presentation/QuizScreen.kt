package com.example.devmastery.quiz.presentation

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.devmastery.quiz.data.remote.QuizQuestionDto
import com.example.devmastery.quiz.data.remote.QuizResultDto
import com.example.devmastery.quiz.data.remote.QuizViewDto

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun QuizScreen(
    quizId: String,
    onBack: () -> Unit,
    viewModel: QuizViewModel = viewModel(factory = QuizViewModel.factory(quizId))
) {
    val state by viewModel.state.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Quiz") },
                navigationIcon = { TextButton(onClick = onBack) { Text("Back") } },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer,
                    titleContentColor = MaterialTheme.colorScheme.onPrimaryContainer,
                )
            )
        }
    ) { padding ->
        Box(modifier = Modifier.fillMaxSize().padding(padding)) {
            when (val s = state) {
                is QuizState.Loading -> CircularProgressIndicator(Modifier.align(Alignment.Center))

                is QuizState.Error -> Column(
                    Modifier.align(Alignment.Center).padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(s.message, color = MaterialTheme.colorScheme.error)
                    Spacer(Modifier.height(12.dp))
                    Button(onClick = { viewModel.load() }) { Text("Retry") }
                }

                is QuizState.Taking -> TakingView(
                    quiz = s.quiz,
                    answers = s.answers,
                    submitting = s.submitting,
                    onSelect = viewModel::selectAnswer,
                    onSubmit = viewModel::submit
                )

                is QuizState.Done -> ResultView(s.result, onBack)
            }
        }
    }
}

@Composable
private fun TakingView(
    quiz: QuizViewDto,
    answers: Map<String, String>,
    submitting: Boolean,
    onSelect: (String, String) -> Unit,
    onSubmit: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text(quiz.title, style = MaterialTheme.typography.headlineSmall)
        quiz.questions.forEachIndexed { index, question ->
            QuestionCard(
                index = index + 1,
                question = question,
                selected = answers[question.id],
                onSelect = { onSelect(question.id, it) }
            )
        }
        Button(
            onClick = onSubmit,
            enabled = !submitting && answers.size == quiz.questions.size && quiz.questions.isNotEmpty(),
            modifier = Modifier.fillMaxWidth()
        ) {
            if (submitting) {
                CircularProgressIndicator(
                    Modifier.size(20.dp), strokeWidth = 2.dp,
                    color = MaterialTheme.colorScheme.onPrimary
                )
            } else {
                Text("Submit answers")
            }
        }
    }
}

@Composable
private fun QuestionCard(
    index: Int,
    question: QuizQuestionDto,
    selected: String?,
    onSelect: (String) -> Unit
) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text("$index. ${question.prompt}", fontWeight = FontWeight.SemiBold)
            Spacer(Modifier.height(8.dp))
            question.options.forEach { option ->
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .fillMaxWidth()
                        .selectable(selected = selected == option, onClick = { onSelect(option) })
                        .padding(vertical = 4.dp)
                ) {
                    RadioButton(selected = selected == option, onClick = { onSelect(option) })
                    Spacer(Modifier.width(4.dp))
                    Text(option)
                }
            }
        }
    }
}

@Composable
private fun ResultView(result: QuizResultDto, onBack: () -> Unit) {
    val pct = if (result.maxScore > 0) result.score * 100 / result.maxScore else 0
    Column(
        modifier = Modifier.fillMaxSize().padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("Your score", style = MaterialTheme.typography.titleMedium)
        Spacer(Modifier.height(8.dp))
        Text(
            "${result.score} / ${result.maxScore}  ($pct%)",
            style = MaterialTheme.typography.headlineMedium,
            fontWeight = FontWeight.Bold
        )
        Spacer(Modifier.height(8.dp))
        Text(
            "Next difficulty level: ${result.newDifficultyLevel}",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center
        )
        Spacer(Modifier.height(24.dp))
        Button(onClick = onBack) { Text("Done") }
    }
}

