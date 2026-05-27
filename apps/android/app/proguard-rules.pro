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

# Keep Gson data classes
-keepclassmembers,allowobfuscation class * {
    @com.google.gson.annotations.SerializedName <fields>;
}

# Keep OkHttp
-dontwarn okhttp3.**
-dontwarn okio.**

# Keep Compose
-keep class androidx.compose.** { *; }
-dontwarn androidx.compose.**

# Keep Kotlinx serialization
-keepattributes *Annotation*, InnerClasses
-dontnote kotlinx.serialization.AnnotationsKt

# Keep application classes
-keep class com.example.devmastery.** { *; }
