package com.example.devmastery.content.data.remote

import retrofit2.http.GET
import retrofit2.http.Path

data class LessonDto(
    val id: String,
    val topicId: String,
    val sectionType: String,
    val title: String,
    val contentMdx: String,
    val orderIndex: Int
)

data class TopicDto(
    val id: String,
    val slug: String,
    val title: String,
    val description: String?,
    val pathSlug: String,
    val pathTitle: String,
    val level: Int,
    val hasVisualizer: Boolean,
    val lessons: List<LessonDto>
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

// ── Learning paths (mirrors web LearningPath in apps/web/src/lib/api.ts) ──

data class TopicSummaryDto(
    val id: String,
    val slug: String,
    val title: String,
    val level: Int = 1,
    val order: Int = 0
)

data class LearningPathDto(
    val id: String,
    val slug: String,
    val title: String,
    val description: String? = null,
    val icon: String? = null,
    val accentColor: String? = null,
    val totalTopics: Int = 0,
    val topics: List<TopicSummaryDto> = emptyList()
)

interface ContentApi {
    @GET("paths")
    suspend fun getAllPaths(): List<LearningPathDto>

    @GET("paths/{slug}")
    suspend fun getPath(@Path("slug") slug: String): LearningPathDto

    @GET("paths/{slug}/roadmap")
    suspend fun getPathRoadmap(@Path("slug") slug: String): PathRoadmapResponse

    @GET("topics/{slug}")
    suspend fun getTopic(@Path("slug") slug: String): TopicDto

    @GET("system-design")
    suspend fun getSystemDesignArchitectures(): List<SystemDesignArchitectureDto>
}
