package com.example.devmastery.auth.data.local

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import java.security.KeyStore

class TokenManager(
    context: Context
) {
    // NOTE: EncryptedSharedPreferences (security-crypto alpha) can throw at
    // create() time when the Android Keystore master key is invalidated or the
    // encrypted prefs file is corrupted — a common situation after an app
    // reinstall, a device restore, or on some OEM ROMs (e.g. MIUI/Xiaomi).
    // Because this class is built eagerly in Application.onCreate, an unhandled
    // exception here crashes the app on EVERY launch ("opens then closes").
    // We recover by wiping the corrupt key + prefs and retrying once, and fall
    // back to plain SharedPreferences as a last resort so the app never
    // crash-loops on startup.
    private val sharedPreferences: SharedPreferences = createPrefs(context)

    private fun createPrefs(context: Context): SharedPreferences {
        try {
            return buildEncryptedPrefs(context)
        } catch (e: Exception) {
            Log.w(TAG, "EncryptedSharedPreferences unavailable; attempting recovery.", e)
        }

        // Recovery: delete the (possibly corrupt) encrypted prefs file and the
        // stored master key, then rebuild from scratch.
        return try {
            deleteCorruptState(context)
            buildEncryptedPrefs(context)
        } catch (e: Exception) {
            Log.e(TAG, "Encrypted prefs recovery failed; using plaintext fallback.", e)
            // Last-resort fallback: unencrypted prefs. Keeps the app usable; the
            // JWT is re-fetched on next login anyway.
            context.getSharedPreferences(FALLBACK_PREFS, Context.MODE_PRIVATE)
        }
    }

    private fun buildEncryptedPrefs(context: Context): SharedPreferences {
        val masterKey = MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()
        return EncryptedSharedPreferences.create(
            context,
            SECURE_PREFS,
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
    }

    private fun deleteCorruptState(context: Context) {
        // Remove the encrypted prefs file.
        runCatching { context.deleteSharedPreferences(SECURE_PREFS) }
        // Remove the Keystore entry so a fresh master key is generated.
        runCatching {
            val keyStore = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
            if (keyStore.containsAlias(MASTER_KEY_ALIAS)) {
                keyStore.deleteEntry(MASTER_KEY_ALIAS)
            }
        }
    }

    private companion object {
        const val TAG = "TokenManager"
        const val SECURE_PREFS = "secure_prefs"
        const val FALLBACK_PREFS = "secure_prefs_fallback"
        const val MASTER_KEY_ALIAS = MasterKey.DEFAULT_MASTER_KEY_ALIAS
    }

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
