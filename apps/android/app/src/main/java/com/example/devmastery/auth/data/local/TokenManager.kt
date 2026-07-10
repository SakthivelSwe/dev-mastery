package com.example.devmastery.auth.data.local

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
class TokenManager(
    context: Context
) {
    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val sharedPreferences = EncryptedSharedPreferences.create(
        context,
        "secure_prefs",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    fun saveToken(token: String) {
        sharedPreferences.edit().putString("JWT_TOKEN", token).apply()
    }

    fun getToken(): String? {
        return sharedPreferences.getString("JWT_TOKEN", null)
    }

    /** Persist the signed-in user's identity for profile/settings screens. */
    fun saveUser(id: String, name: String, email: String) {
        sharedPreferences.edit()
            .putString("USER_ID", id)
            .putString("USER_NAME", name)
            .putString("USER_EMAIL", email)
            .apply()
    }

    fun getUserId(): String? = sharedPreferences.getString("USER_ID", null)
    fun getUserName(): String? = sharedPreferences.getString("USER_NAME", null)
    fun getUserEmail(): String? = sharedPreferences.getString("USER_EMAIL", null)

    // ── Opt-in biometric app lock ──
    fun setBiometricLockEnabled(enabled: Boolean) {
        sharedPreferences.edit().putBoolean("BIOMETRIC_LOCK", enabled).apply()
    }
    fun isBiometricLockEnabled(): Boolean =
        sharedPreferences.getBoolean("BIOMETRIC_LOCK", false)

    fun clearToken() {
        sharedPreferences.edit()
            .remove("JWT_TOKEN")
            .remove("USER_ID")
            .remove("USER_NAME")
            .remove("USER_EMAIL")
            .apply()
    }
}
