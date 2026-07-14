package com.devmastery.app.learn.data.remote

import retrofit2.http.GET
import retrofit2.http.Path
import retrofit2.http.Query

// ── DTOs ───────────────────────────────────────────────────────────────────

data class TopicSummaryDto(
    val id: String,
    val slug: String,
    val title: String,
    val level: Int,
    val order: Int,
)

data class LearningPathDto(
    val id: String,
    val slug: String,
    val title: String,
    val description: String,
    val icon: String,
    val accentColor: String,
    val totalTopics: Int,
    val topics: List<TopicSummaryDto>,
)

data class TopicLayersDto(
    val why: String          = "",
    val theory: String       = "",
    val visual: String       = "",
    val code: String         = "",
    val real_world: String   = "",
    val interview: String    = "",
    val feynman: String      = "",
    val build: String        = "",
    val spaced_review: String= "",
)

data class TopicDto(
    val id: String,
    val slug: String,
    val title: String,
    val level: Int,
    val pathSlug: String      = "",
    val pathTitle: String     = "",
    val sections: TopicLayersDto? = null,
    val layers: TopicLayersDto?   = null,
    val xpReward: Int         = 10,
    val estimatedMins: Int    = 25,
    val tags: List<String>    = emptyList(),
) {
    val resolvedLayers: TopicLayersDto get() = sections ?: layers ?: TopicLayersDto()
}

data class RoadmapTopicDto(
    val slug: String,
    val title: String,
    val estimatedMins: Int,
    val completed: Boolean,
)

data class RoadmapLevelDto(
    val level: Int,
    val label: String,
    val topicCount: Int,
    val completedCount: Int,
    val topics: List<RoadmapTopicDto>,
)

data class RoadmapResponseDto(
    val path: Map<String, Any>,
    val levels: List<RoadmapLevelDto>,
)

// ── Retrofit interface ─────────────────────────────────────────────────────

interface ContentApi {
    @GET("v1/paths")
    suspend fun getPaths(): List<LearningPathDto>

    @GET("v1/paths/{slug}")
    suspend fun getPath(@Path("slug") slug: String): LearningPathDto

    @GET("v1/paths/{slug}/roadmap")
    suspend fun getRoadmap(@Path("slug") slug: String): RoadmapResponseDto

    @GET("v1/topics/{slug}")
    suspend fun getTopic(@Path("slug") slug: String): TopicDto

    @GET("v1/topics/search")
    suspend fun searchTopics(@Query("q") query: String): List<TopicSummaryDto>
}
