package com.devmastery.app.core.data.local

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.google.gson.Gson
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "devmastery_prefs")

data class StoredUser(
    val id: String,
    val email: String,
    val fullName: String,
    val roles: List<String>,
)

@Singleton
class TokenManager @Inject constructor(
    @ApplicationContext private val context: Context,
) {
    private val gson = Gson()

    companion object {
        private val KEY_TOKEN  = stringPreferencesKey("auth_token")
        private val KEY_USER   = stringPreferencesKey("auth_user")
        private val KEY_THEME  = stringPreferencesKey("app_theme")
    }

    // ── Token ──────────────────────────────────────────────────────────

    suspend fun saveToken(token: String) {
        context.dataStore.edit { it[KEY_TOKEN] = token }
    }

    suspend fun getToken(): String? =
        context.dataStore.data.map { it[KEY_TOKEN] }.firstOrNull()

    fun tokenFlow(): Flow<String?> =
        context.dataStore.data.map { it[KEY_TOKEN] }

    // ── User ───────────────────────────────────────────────────────────

    suspend fun saveUser(user: StoredUser) {
        context.dataStore.edit { it[KEY_USER] = gson.toJson(user) }
    }

    suspend fun getUser(): StoredUser? =
        context.dataStore.data.map { prefs ->
            prefs[KEY_USER]?.let { runCatching { gson.fromJson(it, StoredUser::class.java) }.getOrNull() }
        }.firstOrNull()

    // ── Auth clear ─────────────────────────────────────────────────────

    suspend fun clearAuth() {
        context.dataStore.edit {
            it.remove(KEY_TOKEN)
            it.remove(KEY_USER)
        }
    }

    // ── Theme ──────────────────────────────────────────────────────────

    suspend fun saveTheme(theme: String) {
        context.dataStore.edit { it[KEY_THEME] = theme }
    }

    fun themeFlow(): Flow<String> =
        context.dataStore.data.map { it[KEY_THEME] ?: "dark" }
}
