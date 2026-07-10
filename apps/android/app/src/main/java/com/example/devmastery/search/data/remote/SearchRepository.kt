package com.example.devmastery.search.data.remote

class SearchRepository(
    private val searchApi: SearchApi
) {
    suspend fun search(query: String, limit: Int = 20): Result<List<SearchHitDto>> = try {
        Result.success(searchApi.search(query, limit))
    } catch (e: Exception) {
        Result.failure(e)
    }
}

