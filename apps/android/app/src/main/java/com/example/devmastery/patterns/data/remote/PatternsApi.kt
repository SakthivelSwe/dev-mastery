package com.example.devmastery.patterns.data.remote

import retrofit2.http.GET
import retrofit2.http.Path

// Mirrors the web contract in apps/web/src/app/patterns/page.tsx + PatternVisualizer.tsx

data class PatternSummaryDto(
    val id: String,
    val slug: String,
    val name: String,
    val description: String? = null,
    val difficultyLevel: String? = null
)

data class PatternProblemDto(
    val id: String,
    val title: String,
    val difficulty: String? = null,
    val leetcodeUrl: String? = null,
    val starterCode: String? = null
)

data class PatternDetailDto(
    val id: String,
    val slug: String,
    val name: String,
    val description: String? = null,
    val difficultyLevel: String? = null,
    val problems: List<PatternProblemDto> = emptyList()
)

interface PatternsApi {
    @GET("patterns")
    suspend fun list(): List<PatternSummaryDto>

    @GET("patterns/{slug}")
    suspend fun detail(@Path("slug") slug: String): PatternDetailDto
}

