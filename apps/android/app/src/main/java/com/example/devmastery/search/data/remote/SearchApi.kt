package com.example.devmastery.search.data.remote

import retrofit2.http.GET
import retrofit2.http.Query

// Mirrors com.devmastery.search.api.SearchService.SearchHit
data class SearchHitDto(
    val id: String,
    val type: String,      // "TOPIC" | "LESSON" | "EXAMPLE"
    val slug: String,
    val title: String,
    val snippet: String? = null,
    val rank: Double = 0.0
)

interface SearchApi {
    @GET("search")
    suspend fun search(
        @Query("q") q: String,
        @Query("limit") limit: Int = 20
    ): List<SearchHitDto>
}

