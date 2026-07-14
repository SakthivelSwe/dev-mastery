package com.devmastery.app.dashboard.presentation

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.devmastery.app.core.ui.theme.*
import com.devmastery.app.dashboard.data.remote.DashboardDto
import com.devmastery.app.dashboard.data.remote.PathProgressDto

@Composable
fun DashboardScreen(
    onOpenPath: (String) -> Unit,
    viewModel: DashboardViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment     = Alignment.CenterVertically,
                    ) {
                        Icon(
                            Icons.Default.Bolt,
                            contentDescription = null,
                            tint   = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(20.dp),
                        )
                        Text("Dashboard", style = MaterialTheme.typography.titleLarge)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background,
                ),
            )
        }
    ) { padding ->
        when (val s = state) {
            is DashboardUiState.Loading -> Box(
                Modifier.fillMaxSize().padding(padding),
                contentAlignment = Alignment.Center,
            ) { CircularProgressIndicator() }

            is DashboardUiState.Error -> Box(
                Modifier.fillMaxSize().padding(padding),
                contentAlignment = Alignment.Center,
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(s.message, color = MaterialTheme.colorScheme.error)
                    Spacer(Modifier.height(12.dp))
                    Button(onClick = { viewModel.load() }) { Text("Retry") }
                }
            }

            is DashboardUiState.Success -> DashboardContent(
                data     = s.data,
                padding  = padding,
                onOpenPath = onOpenPath,
            )
        }
    }
}

@Composable
private fun DashboardContent(
    data: DashboardDto,
    padding: PaddingValues,
    onOpenPath: (String) -> Unit,
) {
    LazyColumn(
        modifier            = Modifier.fillMaxSize(),
        contentPadding      = PaddingValues(
            start  = 16.dp, end = 16.dp,
            top    = padding.calculateTopPadding() + 8.dp,
            bottom = padding.calculateBottomPadding() + 16.dp,
        ),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        item { StatsRow(data) }
        item {
            Text(
                "Your Learning Paths",
                style    = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
                color    = MaterialTheme.colorScheme.onBackground,
            )
        }
        items(data.pathProgress) { path ->
            PathCard(path = path, onClick = { onOpenPath(path.pathSlug) })
        }
    }
}

@Composable
private fun StatsRow(data: DashboardDto) {
    Row(
        modifier              = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        StatChip(
            icon  = Icons.Default.Bolt,
            label = "XP",
            value = "${data.totalXp}",
            color = DarkAccent,
            modifier = Modifier.weight(1f),
        )
        StatChip(
            icon  = Icons.Default.LocalFireDepartment,
            label = "Streak",
            value = "${data.streak}d",
            color = AccentJava,
            modifier = Modifier.weight(1f),
        )
        StatChip(
            icon  = Icons.Default.Star,
            label = "Rank",
            value = data.rank,
            color = AccentDsa,
            modifier = Modifier.weight(1f),
        )
    }
}

@Composable
private fun StatChip(
    icon: ImageVector,
    label: String,
    value: String,
    color: Color,
    modifier: Modifier = Modifier,
) {
    Surface(
        modifier       = modifier,
        shape          = RoundedCornerShape(12.dp),
        color          = MaterialTheme.colorScheme.surface,
        tonalElevation = 2.dp,
    ) {
        Column(
            modifier              = Modifier.padding(14.dp),
            horizontalAlignment   = Alignment.CenterHorizontally,
            verticalArrangement   = Arrangement.spacedBy(4.dp),
        ) {
            Icon(icon, null, tint = color, modifier = Modifier.size(22.dp))
            Text(value, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            Text(label, style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

@Composable
private fun PathCard(path: PathProgressDto, onClick: () -> Unit) {
    val accent = pathAccent(path.pathSlug)
    Surface(
        modifier       = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        shape          = RoundedCornerShape(14.dp),
        color          = MaterialTheme.colorScheme.surface,
        tonalElevation = 2.dp,
    ) {
        Column(Modifier.padding(16.dp)) {
            Row(
                modifier              = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment     = Alignment.CenterVertically,
            ) {
                Text(
                    slugToTitle(path.pathSlug),
                    style      = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold,
                )
                Text(
                    "${path.completedTopics}/${path.totalTopics}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
            Spacer(Modifier.height(10.dp))
            LinearProgressIndicator(
                progress  = { (path.percentComplete / 100f).toFloat() },
                modifier  = Modifier.fillMaxWidth().height(6.dp).clip(CircleShape),
                color     = accent,
                trackColor= MaterialTheme.colorScheme.surfaceVariant,
            )
        }
    }
}

private fun pathAccent(slug: String) = when {
    slug.contains("java")        -> AccentJava
    slug.contains("dsa")         -> AccentDsa
    slug.contains("spring")      -> AccentSpring
    slug.contains("react")       -> AccentReact
    slug.contains("system")      -> AccentAi
    slug.contains("software")    -> AccentKotlin
    slug.contains("leetcode")    -> AccentInterview
    slug.contains("micro")       -> AccentSpring
    else                         -> DarkAccent
}

private fun slugToTitle(slug: String) = slug
    .replace("-", " ")
    .split(" ")
    .joinToString(" ") { it.replaceFirstChar(Char::uppercase) }
