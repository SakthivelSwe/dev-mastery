package com.example.devmastery

import androidx.compose.runtime.*
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.devmastery.ai.presentation.AiChatScreen
import com.example.devmastery.auth.presentation.LoginScreen
import com.example.devmastery.auth.presentation.RegisterScreen
import com.example.devmastery.content.presentation.RoadmapScreen
import com.example.devmastery.content.presentation.RoadmapViewModel
import com.example.devmastery.content.presentation.SystemDesignScreen
import com.example.devmastery.content.presentation.TopicReaderScreen
import com.example.devmastery.dashboard.presentation.DashboardScreen
import com.example.devmastery.profile.presentation.ProfileScreen

@Composable
fun MainNavigation() {
    val navController = rememberNavController()
    val app = (androidx.compose.ui.platform.LocalContext.current.applicationContext as DevMasteryApp)

    // Auto-login: skip login screen if a token already exists
    val startDestination = if (app.container.tokenManager.isLoggedIn()) "dashboard" else "login"

    NavHost(navController = navController, startDestination = startDestination) {

        composable("login") {
            LoginScreen(
                onLoginSuccess = {
                    navController.navigate("dashboard") { popUpTo("login") { inclusive = true } }
                },
                onNavigateToRegister = {
                    navController.navigate("register")
                }
            )
        }

        composable("register") {
            RegisterScreen(
                onRegisterSuccess = {
                    navController.navigate("dashboard") { popUpTo("login") { inclusive = true } }
                },
                onNavigateToLogin = { navController.popBackStack() }
            )
        }

        composable("dashboard") {
            DashboardScreen(
                onNavigateToRoadmap  = { pathSlug -> navController.navigate("roadmap/$pathSlug") },
                onNavigateToProfile  = { navController.navigate("profile") }
            )
        }

        composable("roadmap/{pathSlug}") { back ->
            val pathSlug = back.arguments?.getString("pathSlug") ?: return@composable
            val vm: RoadmapViewModel = viewModel(
                factory = object : androidx.lifecycle.ViewModelProvider.Factory {
                    override fun <T : androidx.lifecycle.ViewModel> create(modelClass: Class<T>): T {
                        @Suppress("UNCHECKED_CAST")
                        return RoadmapViewModel(app.container.contentRepository) as T
                    }
                }
            )
            RoadmapScreen(
                pathSlug       = pathSlug,
                viewModel      = vm,
                onTopicClick   = { _, topicSlug -> navController.navigate("topic/$topicSlug") },
                onNavigateBack = { navController.popBackStack() }
            )
        }

        composable("topic/{slug}") { back ->
            val slug = back.arguments?.getString("slug") ?: return@composable
            TopicReaderScreen(
                topicSlug = slug,
                onBack    = { navController.popBackStack() },
                onAiChat  = { navController.navigate("ai-chat/$slug") }
            )
        }

        composable("ai-chat/{topicSlug}") { back ->
            val topicSlug = back.arguments?.getString("topicSlug") ?: return@composable
            AiChatScreen(
                topicSlug = topicSlug,
                onBack    = { navController.popBackStack() }
            )
        }

        composable("system-design") {
            SystemDesignScreen()
        }

        composable("profile") {
            ProfileScreen(
                onBack   = { navController.popBackStack() },
                onLogout = {
                    navController.navigate("login") {
                        popUpTo(0) { inclusive = true }
                    }
                }
            )
        }
    }
}
