package com.devmastery.app.learn.data

import com.devmastery.app.learn.data.remote.ContentApi
import com.devmastery.app.learn.data.remote.LearningPathDto
import com.devmastery.app.learn.data.remote.RoadmapResponseDto
import com.devmastery.app.learn.data.remote.TopicDto
import com.devmastery.app.learn.data.remote.TopicSummaryDto
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ContentRepository @Inject constructor(private val api: ContentApi) {

    suspend fun getPaths(): Result<List<LearningPathDto>>         = runCatching { api.getPaths() }
    suspend fun getPath(slug: String): Result<LearningPathDto>    = runCatching { api.getPath(slug) }
    suspend fun getRoadmap(slug: String): Result<RoadmapResponseDto> = runCatching { api.getRoadmap(slug) }
    suspend fun getTopic(slug: String): Result<TopicDto>          = runCatching { api.getTopic(slug) }
    suspend fun searchTopics(q: String): Result<List<TopicSummaryDto>> = runCatching { api.searchTopics(q) }
}
