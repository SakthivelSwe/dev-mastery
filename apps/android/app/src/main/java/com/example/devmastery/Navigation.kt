package com.example.devmastery

import androidx.compose.runtime.Composable
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.devmastery.auth.presentation.LoginScreen
import com.example.devmastery.dashboard.presentation.DashboardScreen

import com.example.devmastery.content.presentation.TopicReaderScreen

import com.example.devmastery.content.presentation.SystemDesignScreen

@Composable
fun MainNavigation() {
    val navController = rememberNavController()

    NavHost(navController = navController, startDestination = "login") {
        composable("login") {
            LoginScreen(
                onLoginSuccess = {
                    navController.navigate("dashboard") {
                        popUpTo("login") { inclusive = true }
                    }
                }
            )
        }
        
        composable("dashboard") {
            DashboardScreen(
                onNavigateToTopic = { topicSlug ->
                    navController.navigate("topic/$topicSlug")
                },
                // For now, testing system-design navigation directly or we can add it to dashboard
            )
        }

        composable("topic/{slug}") { backStackEntry ->
            val slug = backStackEntry.arguments?.getString("slug") ?: return@composable
            TopicReaderScreen(
                topicSlug = slug,
                onBack = { navController.popBackStack() }
            )
        }

        composable("system-design") {
            SystemDesignScreen()
        }
    }
}
