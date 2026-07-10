package com.example.devmastery.patterns.data.remote

class PatternsRepository(
    private val patternsApi: PatternsApi
) {
    suspend fun list(): Result<List<PatternSummaryDto>> = try {
        Result.success(patternsApi.list())
    } catch (e: Exception) {
        Result.failure(e)
    }

    suspend fun detail(slug: String): Result<PatternDetailDto> = try {
        Result.success(patternsApi.detail(slug))
    } catch (e: Exception) {
        Result.failure(e)
    }
}

