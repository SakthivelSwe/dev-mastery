package com.example.devmastery.content.data.remote

import retrofit2.http.GET
import retrofit2.http.Path

data class TopicDto(
    val id: String,
    val title: String,
    val slug: String,
    val markdownContent: String
)

data class TopicRoadmapDto(
    val slug: String,
    val title: String,
    val estimatedMins: Int,
    val completed: Boolean,
    val hasVisualizer: Boolean,
    val hasCodeLab: Boolean
)

data class LevelRoadmapDto(
    val level: Int,
    val label: String,
    val topicCount: Int,
    val completedCount: Int,
    val topics: List<TopicRoadmapDto>
)

data class PathSummaryDto(
    val slug: String,
    val title: String,
    val totalTopics: Int
)

data class PathRoadmapResponse(
    val path: PathSummaryDto,
    val levels: List<LevelRoadmapDto>
)

interface ContentApi {
    @GET("paths/{slug}/roadmap")
    suspend fun getPathRoadmap(@Path("slug") slug: String): PathRoadmapResponse

    @GET("topics/{slug}")
    suspend fun getTopic(@Path("slug") slug: String): TopicDto

    @GET("system-design")
    suspend fun getSystemDesignArchitectures(): List<SystemDesignArchitectureDto>
}
