package com.example.devmastery

import android.net.Uri
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.devmastery.auth.presentation.LoginScreen
import com.example.devmastery.auth.presentation.RegisterScreen
import com.example.devmastery.dashboard.presentation.DashboardScreen

import com.example.devmastery.content.presentation.TopicReaderScreen

import com.example.devmastery.content.presentation.SystemDesignScreen
import com.example.devmastery.content.presentation.PathsListScreen
import com.example.devmastery.content.presentation.PathOverviewScreen
import com.example.devmastery.content.presentation.RoadmapScreen
import com.example.devmastery.search.presentation.SearchScreen
import com.example.devmastery.review.presentation.ReviewScreen
import com.example.devmastery.profile.presentation.ProfileScreen
import com.example.devmastery.profile.presentation.SettingsScreen
import com.example.devmastery.ai.presentation.AiChatScreen
import com.example.devmastery.patterns.presentation.PatternsScreen
import com.example.devmastery.visualizer.presentation.VisualizerScreen
import com.example.devmastery.interview.presentation.InterviewScreen
import com.example.devmastery.interview.presentation.InterviewHistoryScreen
import com.example.devmastery.interview.presentation.InterviewDetailScreen
import com.example.devmastery.profile.presentation.CertificatesScreen
import com.example.devmastery.profile.presentation.ProfileEditScreen
import com.example.devmastery.quiz.presentation.QuizScreen

@Composable
fun MainNavigation(deepLinkUri: Uri? = null) {
    val navController = rememberNavController()

    // Deep-link handling. Supported URIs:
    //   https://devmastery.pages.dev/learn/<pathSlug>/<topicSlug>   → topic reader
    //   https://devmastery.pages.dev/learn/<pathSlug>               → path overview
    //   devmastery://learn/<topicSlug>                              → topic reader
    LaunchedEffect(deepLinkUri) {
        val uri = deepLinkUri ?: return@LaunchedEffect
        val segments = uri.pathSegments.orEmpty()
        when {
            uri.scheme == "devmastery" && uri.host == "review" -> {
                navController.navigate("review")
            }
            uri.scheme == "devmastery" && uri.host == "learn" && segments.isNotEmpty() -> {
                navController.navigate("topic/${segments.first()}")
            }
            segments.size >= 3 && segments[0] == "learn" -> {
                // /learn/{path}/{topic}
                navController.navigate("topic/${segments[2]}")
            }
            segments.size == 2 && segments[0] == "learn" -> {
                // /learn/{path}
                navController.navigate("path/${segments[1]}")
            }
        }
    }

    NavHost(navController = navController, startDestination = "login") {
        composable("login") {
            LoginScreen(
                onLoginSuccess = {
                    navController.navigate("dashboard") {
                        popUpTo("login") { inclusive = true }
                    }
                },
                onNavigateToRegister = { navController.navigate("register") }
            )
        }

        composable("register") {
            RegisterScreen(
                onRegisterSuccess = {
                    navController.navigate("dashboard") {
                        popUpTo("login") { inclusive = true }
                    }
                },
                onNavigateToLogin = { navController.popBackStack() }
            )
        }

        composable("dashboard") {
            DashboardScreen(
                onNavigateToTopic = { topicSlug ->
                    navController.navigate("topic/$topicSlug")
                },
                onNavigateToReview = { navController.navigate("review") },
                onNavigateToProfile = { navController.navigate("profile") },
                onNavigateToAiChat = { navController.navigate("ai/general") },
                onNavigateToPatterns = { navController.navigate("patterns") },
                onNavigateToVisualizer = { navController.navigate("visualizer") },
                onNavigateToInterview = { navController.navigate("interview") },
                onNavigateToPaths = { navController.navigate("paths") },
                onNavigateToSearch = { navController.navigate("search") }
            )
        }

        composable("topic/{slug}") { backStackEntry ->
            val slug = backStackEntry.arguments?.getString("slug") ?: return@composable
            TopicReaderScreen(
                topicSlug = slug,
                onBack = { navController.popBackStack() }
            )
        }

        composable("review") {
            ReviewScreen(onBack = { navController.popBackStack() })
        }

        composable("profile") {
            ProfileScreen(
                onBack = { navController.popBackStack() },
                onOpenSettings = { navController.navigate("settings") },
                onOpenCertificates = { navController.navigate("certificates") }
            )
        }

        composable("certificates") {
            CertificatesScreen(onBack = { navController.popBackStack() })
        }

        composable("quiz/{quizId}") { backStackEntry ->
            val quizId = backStackEntry.arguments?.getString("quizId") ?: return@composable
            QuizScreen(
                quizId = quizId,
                onBack = { navController.popBackStack() }
            )
        }

        composable("settings") {
            SettingsScreen(
                onBack = { navController.popBackStack() },
                onEditProfile = { navController.navigate("profile/edit") },
                onLoggedOut = {
                    navController.navigate("login") {
                        popUpTo(0) { inclusive = true }
                    }
                }
            )
        }

        composable("profile/edit") {
            ProfileEditScreen(onBack = { navController.popBackStack() })
        }

        composable("ai/{topicSlug}") { backStackEntry ->
            val slug = backStackEntry.arguments?.getString("topicSlug") ?: "general"
            AiChatScreen(
                topicSlug = slug,
                onBack = { navController.popBackStack() }
            )
        }

        composable("visualizer") {
            VisualizerScreen(onBack = { navController.popBackStack() })
        }

        composable("patterns") {
            PatternsScreen(onBack = { navController.popBackStack() })
        }

        composable("interview") {
            InterviewScreen(
                onBack = { navController.popBackStack() },
                onOpenHistory = { navController.navigate("interview/history") }
            )
        }

        composable("interview/history") {
            InterviewHistoryScreen(
                onBack = { navController.popBackStack() },
                onOpenSession = { id -> navController.navigate("interview/history/$id") }
            )
        }

        composable("interview/history/{id}") { backStackEntry ->
            val id = backStackEntry.arguments?.getString("id") ?: return@composable
            InterviewDetailScreen(
                sessionId = id,
                onBack = { navController.popBackStack() }
            )
        }

        composable("paths") {
            PathsListScreen(
                onBack = { navController.popBackStack() },
                onOpenPath = { slug -> navController.navigate("path/$slug") }
            )
        }

        composable("path/{slug}") { backStackEntry ->
            val slug = backStackEntry.arguments?.getString("slug") ?: return@composable
            PathOverviewScreen(
                pathSlug = slug,
                onBack = { navController.popBackStack() },
                onOpenRoadmap = { navController.navigate("path/$slug/roadmap") },
                onOpenTopic = { topicSlug -> navController.navigate("topic/$topicSlug") }
            )
        }

        composable("path/{slug}/roadmap") { backStackEntry ->
            val slug = backStackEntry.arguments?.getString("slug") ?: return@composable
            RoadmapScreen(
                pathSlug = slug,
                onBack = { navController.popBackStack() },
                onOpenTopic = { topicSlug -> navController.navigate("topic/$topicSlug") }
            )
        }

        composable("search") {
            SearchScreen(
                onBack = { navController.popBackStack() },
                onOpenTopic = { topicSlug -> navController.navigate("topic/$topicSlug") }
            )
        }

        composable("system-design") {
            SystemDesignScreen()
        }
    }
}
