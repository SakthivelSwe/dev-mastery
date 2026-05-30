package com.example.devmastery.content.data.remote

class ContentRepository(
    private val contentApi: ContentApi
) {
    suspend fun getAllPaths(): Result<List<PathDto>> = runCatching { contentApi.getAllPaths() }

    suspend fun getTopic(slug: String): Result<TopicDto> = runCatching { contentApi.getTopic(slug) }

    suspend fun getPathRoadmap(slug: String): Result<PathRoadmapResponse> = runCatching {
        contentApi.getPathRoadmap(slug)
    }

    suspend fun getSystemDesignArchitectures(): Result<List<SystemDesignArchitectureDto>> = runCatching {
        contentApi.getSystemDesignArchitectures()
    }
}
