package com.example.devmastery.content.data.local

import android.content.Context
import com.example.devmastery.content.data.remote.TopicDto
import com.google.gson.Gson
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File

/**
 * Lightweight on-disk cache for topic content — the Android equivalent of the
 * web PWA's StaleWhileRevalidate content cache. Repositories try the network
 * first and fall back to this cache when offline, so previously-visited topics
 * remain readable without a connection.
 *
 * Uses Gson (already a project dependency) + the app's private files dir, so it
 * needs no annotation processing or extra libraries.
 */
class TopicCache(context: Context) {
    private val gson = Gson()
    private val dir = File(context.filesDir, "topic-cache").apply { mkdirs() }
    // Marker files for the "starred / downloaded for offline" set.
    private val starDir = File(context.filesDir, "topic-cache-stars").apply { mkdirs() }

    private fun fileFor(slug: String) = File(dir, "$slug.json")
    private fun starFor(slug: String) = File(starDir, slug)

    suspend fun save(topic: TopicDto) = withContext(Dispatchers.IO) {
        runCatching { fileFor(topic.slug).writeText(gson.toJson(topic)) }
        Unit
    }

    suspend fun load(slug: String): TopicDto? = withContext(Dispatchers.IO) {
        val f = fileFor(slug)
        if (!f.exists()) return@withContext null
        runCatching { gson.fromJson(f.readText(), TopicDto::class.java) }.getOrNull()
    }

    // ── "Downloaded for offline" (starred) ──

    suspend fun star(slug: String) = withContext(Dispatchers.IO) {
        runCatching { starFor(slug).createNewFile() }
        Unit
    }

    suspend fun unstar(slug: String) = withContext(Dispatchers.IO) {
        runCatching { starFor(slug).delete(); fileFor(slug).delete() }
        Unit
    }

    suspend fun isStarred(slug: String): Boolean = withContext(Dispatchers.IO) {
        starFor(slug).exists()
    }

    /** All topic slugs currently downloaded for offline. */
    suspend fun starredSlugs(): List<String> = withContext(Dispatchers.IO) {
        starDir.listFiles()?.map { it.name }?.sorted() ?: emptyList()
    }

    /** Total disk bytes used by the cache — for the Settings "Downloaded" panel. */
    suspend fun cacheSizeBytes(): Long = withContext(Dispatchers.IO) {
        (dir.listFiles()?.sumOf { it.length() } ?: 0L)
    }

    /** Clear ALL cached topics (both starred and opportunistic). */
    suspend fun clearAll() = withContext(Dispatchers.IO) {
        dir.listFiles()?.forEach { it.delete() }
        starDir.listFiles()?.forEach { it.delete() }
    }
}

