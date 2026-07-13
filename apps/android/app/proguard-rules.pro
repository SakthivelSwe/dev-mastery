# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.kts.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# ─── Google ErrorProne Annotations (compile-time only, not in runtime classpath) ───
# Required by androidx.security.crypto -> Google Tink dependency
-dontwarn com.google.errorprone.annotations.**
-dontwarn com.google.errorprone.**


# Keep Kotlin metadata so reflection works correctly
-keepattributes *Annotation*
-keepattributes SourceFile,LineNumberTable

# Keep Retrofit interfaces
-keepattributes Signature
-keepclasseswithmembers class * {
    @retrofit2.http.* <methods>;
}

# Retrofit / OkHttp / Okio — upstream shipped rules are packaged with the
# dependencies, but keep these belt-and-braces entries in case R8 misses one.
-dontwarn retrofit2.**
-dontwarn org.codehaus.mojo.animal_sniffer.*
-dontwarn javax.annotation.**
-keep class retrofit2.** { *; }

# Gson data classes
-keepclassmembers,allowobfuscation class * {
    @com.google.gson.annotations.SerializedName <fields>;
}
# Gson generic type info survives R8
-keep,allowobfuscation,allowshrinking class com.google.gson.reflect.TypeToken
-keep,allowobfuscation,allowshrinking class * extends com.google.gson.reflect.TypeToken

# Keep OkHttp
-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn org.conscrypt.**
-dontwarn org.bouncycastle.**
-dontwarn org.openjsse.**

# Keep Compose
-keep class androidx.compose.** { *; }
-dontwarn androidx.compose.**

# Keep Kotlinx serialization
-keepattributes *Annotation*, InnerClasses
-dontnote kotlinx.serialization.AnnotationsKt

# Keep application classes
-keep class com.example.devmastery.** { *; }

# ─── WorkManager + Room (androidx.startup auto-init) ───
# R8 full-mode strips Room's generated *_Impl classes because they are only
# referenced reflectively by Room.getGeneratedImplementation(). Without these
# rules the release build crashes at launch with:
#   "Failed to create an instance of class androidx.work.impl.WorkDatabase"
# thrown from androidx.startup.InitializationProvider.onCreate.
-keep class androidx.room.** { *; }
-dontwarn androidx.room.**
-keep class * extends androidx.room.RoomDatabase { <init>(); *; }
-keep class androidx.work.** { *; }
-dontwarn androidx.work.**
-keep class androidx.work.impl.WorkDatabase_Impl { *; }
-keep class androidx.sqlite.** { *; }
-dontwarn androidx.sqlite.**
-keep class androidx.startup.** { *; }
-keep class * implements androidx.startup.Initializer { *; }
# Belt-and-braces: keep every Room-generated implementation class.
-keep class **_Impl { *; }

# ─── AndroidX WorkManager ────────────────────────────────────────────────────
# WorkManager uses Room internally. R8 renames WorkDatabase and related classes
# causing "Failed to create an instance of class WorkDatabase" at startup.
-keep class androidx.work.** { *; }
-keep interface androidx.work.** { *; }
-keepnames class androidx.work.** { *; }

# WorkManager's ListenableWorker subclasses must be kept by name so the
# WorkerFactory can instantiate them via reflection.
-keep public class * extends androidx.work.ListenableWorker {
    public <init>(android.content.Context, androidx.work.WorkerParameters);
}

# ─── Room (used internally by WorkManager) ───────────────────────────────────
-keep class androidx.room.** { *; }
-keepclassmembers class * extends androidx.room.RoomDatabase {
    abstract *;
}
# Room generates _Impl classes at compile time; keep them by pattern.
-keep class **_Impl { *; }
-keep class **_Impl$* { *; }

# ─── AndroidX Startup (InitializationProvider crash) ─────────────────────────
# The androidx.startup.InitializationProvider is a ContentProvider that
# bootstraps WorkManager. R8 must not rename or remove it.
-keep class androidx.startup.** { *; }
-keep class * implements androidx.startup.Initializer { *; }
-keepnames class * implements androidx.startup.Initializer

# ─── SQLite / SupportSQLiteDatabase (Room dependency) ────────────────────────
-keep class androidx.sqlite.** { *; }
-dontwarn androidx.sqlite.**
