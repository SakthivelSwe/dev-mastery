package com.example.devmastery.content.data.remote

import com.example.devmastery.content.data.local.TopicCache

class ContentRepository(
    private val contentApi: ContentApi,
    private val topicCache: TopicCache? = null
) {
    suspend fun getTopic(slug: String): Result<TopicDto> {
        return try {
            val response = contentApi.getTopic(slug)
            topicCache?.save(response)          // refresh the offline copy
            Result.success(response)
        } catch (e: Exception) {
            // Offline / server error — fall back to the last cached copy if we have one.
            val cached = topicCache?.load(slug)
            if (cached != null) Result.success(cached) else Result.failure(e)
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

    suspend fun getAllPaths(): Result<List<LearningPathDto>> = try {
        Result.success(contentApi.getAllPaths())
    } catch (e: Exception) {
        Result.failure(e)
    }

    suspend fun getPath(slug: String): Result<LearningPathDto> = try {
        Result.success(contentApi.getPath(slug))
    } catch (e: Exception) {
        Result.failure(e)
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
