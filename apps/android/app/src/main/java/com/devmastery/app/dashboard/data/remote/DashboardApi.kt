package com.devmastery.app.dashboard.data.remote

import retrofit2.http.GET

data class PathProgressDto(
    val pathSlug: String,
    val completedTopics: Int,
    val totalTopics: Int,
    val percentComplete: Double,
    val xpEarned: Int,
)

data class ActivityItemDto(
    val date: String,
    val xpEarned: Int,
    val topicsCompleted: Int,
)

data class DashboardDto(
    val totalXp: Int,
    val streak: Int,
    val rank: String,
    val dailyXp: Int,
    val dailyGoal: Int,
    val totalCompleted: Int,
    val pathProgress: List<PathProgressDto>,
    val recentActivity: List<ActivityItemDto>,
)

interface DashboardApi {
    @GET("v1/progress/summary")
    suspend fun getDashboard(): DashboardDto
}
