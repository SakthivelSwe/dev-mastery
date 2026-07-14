package com.devmastery.app

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Book
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Repeat
import androidx.compose.material.icons.filled.School
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.devmastery.app.auth.presentation.AuthViewModel
import com.devmastery.app.auth.presentation.LoginScreen
import com.devmastery.app.auth.presentation.RegisterScreen
import com.devmastery.app.core.data.local.TokenManager
import com.devmastery.app.core.ui.theme.DevMasteryTheme
import com.devmastery.app.dashboard.presentation.DashboardScreen
import com.devmastery.app.interview.presentation.InterviewHistoryScreen
import com.devmastery.app.interview.presentation.InterviewScreen
import com.devmastery.app.learn.presentation.PathScreen
import com.devmastery.app.learn.presentation.RoadmapScreen
import com.devmastery.app.learn.presentation.TopicScreen
import com.devmastery.app.profile.presentation.ProfileScreen
import com.devmastery.app.review.presentation.SpacedReviewScreen
import kotlinx.coroutines.launch

// ── Route constants ───────────────────────────────────────────────────────────
object Routes {
    const val LOGIN     = "login"
    const val REGISTER  = "register"
    const val DASHBOARD = "dashboard"
    const val PATH      = "path/{slug}"
    const val ROADMAP   = "roadmap/{slug}"
    const val TOPIC     = "topic/{slug}"
    const val REVIEW    = "review"
    const val INTERVIEW = "interview"
    const val HISTORY   = "interview/history"
    const val PROFILE   = "profile"

    fun path(slug: String)    = "path/$slug"
    fun roadmap(slug: String) = "roadmap/$slug"
    fun topic(slug: String)   = "topic/$slug"
}

// ── Bottom nav items ─────────────────────────────────────────────────────────
private data class BottomNavItem(val route: String, val label: String, val icon: ImageVector)
private val BOTTOM_NAV = listOf(
    BottomNavItem(Routes.DASHBOARD, "Home",      Icons.Default.Home),
    BottomNavItem(Routes.REVIEW,    "Review",    Icons.Default.Repeat),
    BottomNavItem(Routes.INTERVIEW, "Interview", Icons.Default.School),
    BottomNavItem(Routes.PROFILE,   "Profile",   Icons.Default.Person),
)
private val BOTTOM_NAV_ROUTES = BOTTOM_NAV.map { it.route }.toSet()

// ── Root composable ───────────────────────────────────────────────────────────
@Composable
fun DevMasteryRoot(tokenManager: TokenManager) {
    // Theme preference from DataStore
    val themeFlow by tokenManager.themeFlow().collectAsStateWithLifecycle(initialValue = "dark")
    val isDark     = themeFlow == "dark"
    val scope      = rememberCoroutineScope()

    DevMasteryTheme(darkTheme = isDark) {
        AppNavHost(
            isDark       = isDark,
            onThemeToggle = {
                scope.launch {
                    tokenManager.saveTheme(if (isDark) "light" else "dark")
                }
            },
            tokenManager = tokenManager,
        )
    }
}

@Composable
private fun AppNavHost(
    isDark: Boolean,
    onThemeToggle: () -> Unit,
    tokenManager: TokenManager,
) {
    val navController = rememberNavController()
    val authVm: AuthViewModel = hiltViewModel()

    // Determine start destination from stored token
    var startDest by remember { mutableStateOf<String?>(null) }
    LaunchedEffect(Unit) {
        authVm.checkAutoLogin(
            onAuthed = { startDest = Routes.DASHBOARD },
            onGuest  = { startDest = Routes.LOGIN },
        )
    }

    if (startDest == null) {
        // Splash / loading
        com.devmastery.app.core.ui.components.LoadingScreen()
        return
    }

    val currentEntry  by navController.currentBackStackEntryAsState()
    val currentRoute  = currentEntry?.destination?.route
    val showBottomBar = BOTTOM_NAV_ROUTES.any { currentRoute?.startsWith(it.split("/").first()) == true }

    Scaffold(
        bottomBar = {
            if (showBottomBar) {
                NavigationBar {
                    BOTTOM_NAV.forEach { item ->
                        NavigationBarItem(
                            selected = currentRoute == item.route,
                            onClick  = {
                                navController.navigate(item.route) {
                                    popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            },
                            icon  = { Icon(item.icon, item.label) },
                            label = { Text(item.label) },
                        )
                    }
                }
            }
        }
    ) { padding ->
        NavHost(
            navController    = navController,
            startDestination = startDest!!,
            modifier         = Modifier.padding(padding),
        ) {
            // ── Auth ──────────────────────────────────────────────────────────
            composable(Routes.LOGIN) {
                LoginScreen(
                    onLoginSuccess       = { navController.navigate(Routes.DASHBOARD) { popUpTo(Routes.LOGIN) { inclusive = true } } },
                    onNavigateToRegister = { navController.navigate(Routes.REGISTER) },
                    viewModel            = authVm,
                )
            }
            composable(Routes.REGISTER) {
                RegisterScreen(
                    onRegisterSuccess = { navController.navigate(Routes.DASHBOARD) { popUpTo(Routes.LOGIN) { inclusive = true } } },
                    onNavigateToLogin = { navController.popBackStack() },
                    viewModel         = authVm,
                )
            }

            // ── Dashboard ─────────────────────────────────────────────────────
            composable(Routes.DASHBOARD) {
                DashboardScreen(
                    onOpenPath = { slug -> navController.navigate(Routes.path(slug)) }
                )
            }

            // ── Learning ──────────────────────────────────────────────────────
            composable(Routes.PATH) { back ->
                val slug = back.arguments?.getString("slug") ?: return@composable
                PathScreen(
                    pathSlug     = slug,
                    onBack       = { navController.popBackStack() },
                    onTopicClick = { t -> navController.navigate(Routes.topic(t)) },
                    onOpenRoadmap= { navController.navigate(Routes.roadmap(slug)) },
                )
            }
            composable(Routes.ROADMAP) { back ->
                val slug = back.arguments?.getString("slug") ?: return@composable
                RoadmapScreen(
                    pathSlug     = slug,
                    onBack       = { navController.popBackStack() },
                    onTopicClick = { t -> navController.navigate(Routes.topic(t)) },
                )
            }
            composable(Routes.TOPIC) { back ->
                val slug = back.arguments?.getString("slug") ?: return@composable
                TopicScreen(
                    topicSlug = slug,
                    onBack    = { navController.popBackStack() },
                )
            }

            // ── Review ────────────────────────────────────────────────────────
            composable(Routes.REVIEW) { SpacedReviewScreen() }

            // ── Interview ─────────────────────────────────────────────────────
            composable(Routes.INTERVIEW) {
                InterviewScreen(
                    onOpenHistory = { navController.navigate(Routes.HISTORY) }
                )
            }
            composable(Routes.HISTORY) {
                InterviewHistoryScreen(
                    onBack         = { navController.popBackStack() },
                    onOpenSession  = { /* Session detail — future */ },
                )
            }

            // ── Profile ───────────────────────────────────────────────────────
            composable(Routes.PROFILE) {
                ProfileScreen(
                    isDark       = isDark,
                    onThemeToggle= onThemeToggle,
                    onLogout     = {
                        navController.navigate(Routes.LOGIN) {
                            popUpTo(0) { inclusive = true }
                        }
                    },
                    authViewModel = authVm,
                )
            }
        }
    }
}
