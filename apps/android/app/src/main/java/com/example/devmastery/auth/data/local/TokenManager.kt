package com.example.devmastery.auth.data.local

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

class TokenManager(context: Context) {

    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val prefs = EncryptedSharedPreferences.create(
        context,
        "devmastery_secure_prefs",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    fun saveToken(token: String) = prefs.edit().putString("JWT_TOKEN", token).apply()
    fun getToken(): String?      = prefs.getString("JWT_TOKEN", null)
    fun clearToken()             = prefs.edit().remove("JWT_TOKEN").apply()

    fun saveUserId(userId: String) = prefs.edit().putString("USER_ID", userId).apply()
    fun getUserId(): String?       = prefs.getString("USER_ID", null)

    fun saveUserName(name: String) = prefs.edit().putString("USER_NAME", name).apply()
    fun getUserName(): String?     = prefs.getString("USER_NAME", null)

    fun saveUserEmail(email: String) = prefs.edit().putString("USER_EMAIL", email).apply()
    fun getUserEmail(): String?      = prefs.getString("USER_EMAIL", null)

    fun isLoggedIn(): Boolean = getToken() != null

    fun clearAll() = prefs.edit().clear().apply()
}
