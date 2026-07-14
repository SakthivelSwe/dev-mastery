package com.devmastery.app.auth.presentation

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusDirection
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.devmastery.app.core.ui.components.DevMasteryLogo
import com.devmastery.app.core.ui.components.PrimaryButton

@Composable
fun RegisterScreen(
    onRegisterSuccess: () -> Unit,
    onNavigateToLogin: () -> Unit,
    viewModel: AuthViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val focus = LocalFocusManager.current

    var fullName by remember { mutableStateOf("") }
    var email    by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }

    LaunchedEffect(state) {
        if (state is AuthUiState.Success) {
            viewModel.resetState()
            onRegisterSuccess()
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Spacer(Modifier.height(80.dp))
        DevMasteryLogo()
        Spacer(Modifier.height(40.dp))

        Surface(
            shape          = RoundedCornerShape(16.dp),
            color          = MaterialTheme.colorScheme.surface,
            tonalElevation = 2.dp,
            modifier       = Modifier.fillMaxWidth(),
        ) {
            Column(Modifier.padding(24.dp)) {
                Text(
                    "Create your account.",
                    style = MaterialTheme.typography.headlineLarge,
                    color = MaterialTheme.colorScheme.onSurface,
                )
                Spacer(Modifier.height(4.dp))
                Text(
                    "Start your learning journey today.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                Spacer(Modifier.height(20.dp))

                AnimatedVisibility(state is AuthUiState.Error) {
                    val msg = (state as? AuthUiState.Error)?.message ?: ""
                    Surface(
                        shape    = RoundedCornerShape(8.dp),
                        color    = MaterialTheme.colorScheme.errorContainer,
                        modifier = Modifier.fillMaxWidth(),
                    ) {
                        Text(
                            msg,
                            color    = MaterialTheme.colorScheme.onErrorContainer,
                            style    = MaterialTheme.typography.bodySmall,
                            modifier = Modifier.padding(12.dp),
                        )
                    }
                }
                if (state is AuthUiState.Error) Spacer(Modifier.height(12.dp))

                AuthTextField(
                    label        = "Full name",
                    value        = fullName,
                    onValue      = { fullName = it },
                    keyboardType = KeyboardType.Text,
                    capitalization = KeyboardCapitalization.Words,
                    imeAction    = ImeAction.Next,
                    onImeAction  = { focus.moveFocus(FocusDirection.Down) },
                )
                Spacer(Modifier.height(12.dp))
                AuthTextField(
                    label        = "Email",
                    value        = email,
                    onValue      = { email = it },
                    keyboardType = KeyboardType.Email,
                    imeAction    = ImeAction.Next,
                    onImeAction  = { focus.moveFocus(FocusDirection.Down) },
                )
                Spacer(Modifier.height(12.dp))
                AuthTextField(
                    label        = "Password",
                    value        = password,
                    onValue      = { password = it },
                    isPassword   = true,
                    imeAction    = ImeAction.Done,
                    onImeAction  = {
                        focus.clearFocus()
                        viewModel.register(email, password, fullName)
                    },
                )
                Spacer(Modifier.height(20.dp))

                PrimaryButton(
                    text      = "Create account",
                    isLoading = state is AuthUiState.Loading,
                    onClick   = { viewModel.register(email, password, fullName) },
                    modifier  = Modifier.fillMaxWidth(),
                )
            }
        }

        Spacer(Modifier.height(20.dp))
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(
                "Already have an account? ",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            TextButton(onClick = onNavigateToLogin, contentPadding = PaddingValues(0.dp)) {
                Text("Sign in", style = MaterialTheme.typography.labelLarge)
            }
        }
    }
}
