package com.example.devmastery.content.presentation

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.devmastery.content.data.remote.SystemDesignArchitectureDto
import com.example.devmastery.content.data.remote.ContentRepository
import kotlinx.coroutines.launch

import androidx.lifecycle.viewmodel.compose.viewModel

@Composable
fun SystemDesignScreen(
    modifier: Modifier = Modifier,
    viewModel: SystemDesignViewModel = viewModel(factory = SystemDesignViewModel.Factory)
) {
    val uiState by viewModel.uiState.collectAsState()
    var activeArchitecture by remember { mutableStateOf<SystemDesignArchitectureDto?>(null) }
    var activeTab by remember { mutableStateOf("Diagram") }

    LaunchedEffect(uiState) {
        if (uiState is SystemDesignState.Success && activeArchitecture == null) {
            val architectures = (uiState as SystemDesignState.Success).architectures
            if (architectures.isNotEmpty()) {
                activeArchitecture = architectures.first()
            }
        }
    }

    if (uiState is SystemDesignState.Loading) {
        Box(modifier = modifier.fillMaxSize().background(Color(0xFF0D1117)), contentAlignment = Alignment.Center) {
            CircularProgressIndicator(color = Color(0xFF58A6FF))
        }
        return
    }

    if (uiState is SystemDesignState.Error) {
        Box(modifier = modifier.fillMaxSize().background(Color(0xFF0D1117)), contentAlignment = Alignment.Center) {
            Text("Error: ${(uiState as SystemDesignState.Error).message}", color = Color.Red)
        }
        return
    }

    val architectures = (uiState as SystemDesignState.Success).architectures

    Row(modifier = modifier.fillMaxSize().background(Color(0xFF0D1117))) {
        // Sidebar List
        Column(
            modifier = Modifier
                .width(280.dp)
                .fillMaxHeight()
                .background(Color(0xFF161B22))
        ) {
            Text(
                text = "System Design",
                color = Color.White,
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(16.dp)
            )
            HorizontalDivider(color = Color(0xFF30363D))
            
            LazyColumn(modifier = Modifier.weight(1f)) {
                items(architectures) { arch ->
                    val isSelected = activeArchitecture?.id == arch.id
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { activeArchitecture = arch }
                            .background(if (isSelected) Color(0xFF1F2428) else Color.Transparent)
                            .padding(16.dp)
                    ) {
                        Text(
                            text = arch.title,
                            color = Color.White,
                            fontWeight = FontWeight.Medium,
                            fontSize = 16.sp
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = arch.difficulty,
                            color = when (arch.difficulty) {
                                "Medium" -> Color(0xFFE3B341)
                                "Hard" -> Color(0xFFF85149)
                                else -> Color(0xFF3FB950)
                            },
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    HorizontalDivider(color = Color(0xFF30363D))
                }
            }
        }

        VerticalDivider(modifier = Modifier.fillMaxHeight(), color = Color(0xFF30363D))

        // Main Content Area
        Box(modifier = Modifier.weight(1f).fillMaxHeight().padding(16.dp)) {
            activeArchitecture?.let { arch ->
                Column(modifier = Modifier.fillMaxSize()) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.Top
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = arch.title,
                                    color = Color.White,
                                    fontSize = 28.sp,
                                    fontWeight = FontWeight.Bold
                                )
                                Spacer(modifier = Modifier.width(16.dp))
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(16.dp))
                                        .background(
                                            when (arch.difficulty) {
                                                "Medium" -> Color(0xFFE3B341).copy(alpha = 0.2f)
                                                "Hard" -> Color(0xFFF85149).copy(alpha = 0.2f)
                                                else -> Color(0xFF3FB950).copy(alpha = 0.2f)
                                            }
                                        )
                                        .padding(horizontal = 12.dp, vertical = 4.dp)
                                ) {
                                    Text(
                                        text = arch.difficulty,
                                        color = when (arch.difficulty) {
                                            "Medium" -> Color(0xFFE3B341)
                                            "Hard" -> Color(0xFFF85149)
                                            else -> Color(0xFF3FB950)
                                        },
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 12.sp
                                    )
                                }
                            }
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = arch.description,
                                color = Color(0xFF8B949E),
                                fontSize = 16.sp
                            )
                        }

                        // Tabs
                        Row(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(Color(0xFF0D1117))
                                .padding(2.dp)
                        ) {
                            listOf("Diagram", "Deep Dive").forEach { tab ->
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(if (activeTab == tab) Color(0xFF238636) else Color.Transparent)
                                        .clickable { activeTab = tab }
                                        .padding(horizontal = 16.dp, vertical = 8.dp)
                                ) {
                                    Text(
                                        text = tab,
                                        color = if (activeTab == tab) Color.White else Color(0xFF8B949E),
                                        fontWeight = FontWeight.Medium,
                                        fontSize = 14.sp
                                    )
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(24.dp))

                    if (activeTab == "Diagram") {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .weight(1f)
                                .clip(RoundedCornerShape(8.dp))
                                .background(Color(0xFF0D1117))
                        ) {
                            MermaidWebView(mermaidData = arch.mermaidDiagram)
                        }
                    } else {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .weight(1f)
                                .clip(RoundedCornerShape(8.dp))
                                .background(Color(0xFF0D1117))
                                .padding(16.dp)
                        ) {
                            Column {
                                Text(
                                    text = "Architecture Deep Dive",
                                    color = Color.White,
                                    fontSize = 20.sp,
                                    fontWeight = FontWeight.Bold
                                )
                                Spacer(modifier = Modifier.height(16.dp))
                                Text(
                                    text = "Here you can add a detailed breakdown of the ${arch.title} architecture, explaining components like the API Gateway, Cache clusters, Database Sharding, and Event Queues.",
                                    color = Color(0xFF8B949E),
                                    fontSize = 16.sp
                                )
                            }
                        }
                    }
                }
            } ?: run {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("Select an architecture from the sidebar.", color = Color(0xFF8B949E))
                }
            }
        }
    }
}
