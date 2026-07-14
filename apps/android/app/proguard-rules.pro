# ──────────────────────────────────────────────────────────────
# DevMastery ProGuard / R8 rules
# ──────────────────────────────────────────────────────────────

# Retrofit + OkHttp
-dontwarn okhttp3.**
-dontwarn okio.**
-keepnames class okhttp3.internal.publicsuffix.PublicSuffixDatabase
-keep class retrofit2.** { *; }
-keepattributes Signature, Exceptions, *Annotation*
-keepclassmembers,allowshrinking,allowobfuscation interface * {
    @retrofit2.http.* <methods>;
}

# Gson models — keep all classes in our data package
-keep class com.devmastery.app.core.domain.model.** { *; }
-keep class com.devmastery.app.auth.data.remote.** { *; }
-keepclassmembers class ** {
    @com.google.gson.annotations.SerializedName <fields>;
}

# Hilt
-keep class dagger.hilt.** { *; }
-keep @dagger.hilt.android.HiltAndroidApp class * { *; }
-keep @dagger.hilt.InstallIn class * { *; }

# Coroutines
-keepclassmembernames class kotlinx.** {
    volatile <fields>;
}

# DataStore
-keep class androidx.datastore.** { *; }

# Kotlin Serialization
-keepattributes *Annotation*, InnerClasses
-dontnote kotlinx.serialization.AnnotationsKt
-keepclassmembers class kotlinx.serialization.json.** { *** Companion; }

# Markwon
-keep class io.noties.markwon.** { *; }

# Compose
-keep class androidx.compose.runtime.** { *; }
