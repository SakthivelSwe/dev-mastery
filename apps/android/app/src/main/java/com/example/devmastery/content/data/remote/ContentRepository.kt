package com.example.devmastery.content.data.remote

class ContentRepository(
    private val contentApi: ContentApi
) {
    suspend fun getTopic(slug: String): Result<TopicDto> {
        return try {
            val response = contentApi.getTopic(slug)
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getPathRoadmap(slug: String): Result<PathRoadmapResponse> {
        return try {
            val response = contentApi.getPathRoadmap(slug)
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    suspend fun getSystemDesignArchitectures(): Result<List<SystemDesignArchitectureDto>> {
        return try {
            val response = contentApi.getSystemDesignArchitectures()
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
