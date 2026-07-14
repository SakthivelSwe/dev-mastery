plugins {
  alias(libs.plugins.android.application)
  alias(libs.plugins.compose.compiler)
  alias(libs.plugins.kotlin.serialization)
  alias(libs.plugins.hilt)
  alias(libs.plugins.kotlin.android)
  alias(libs.plugins.kotlin.ksp)
}

configurations.all {
    exclude(group = "org.jetbrains", module = "annotations-java5")
}

android {
  namespace   = "com.devmastery.app"
  compileSdk  = 36

  defaultConfig {
    applicationId = "com.devmastery.app"
    minSdk        = 34
    targetSdk     = 36
    versionCode   = 1
    versionName   = "1.0"

    // Backend URL — override in local.properties: API_BASE_URL=http://192.168.x.x:8080
    buildConfigField("String", "API_BASE_URL",
      "\"${project.findProperty("API_BASE_URL") ?: "http://10.0.2.2:8080"}\"")
  }

  buildTypes {
    release {
      isMinifyEnabled   = true
      isShrinkResources = true
      proguardFiles(
        getDefaultProguardFile("proguard-android-optimize.txt"),
        "proguard-rules.pro"
      )
    }
    debug {
      isMinifyEnabled = false
    }
  }

  compileOptions {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
  }

  buildFeatures {
    compose     = true
    buildConfig = true
    aidl        = false
    shaders     = false
  }

  packaging {
    resources {
      excludes += "/META-INF/{AL2.0,LGPL2.1}"
      excludes += "META-INF/DEPENDENCIES"
    }
  }

  kotlinOptions {
    freeCompilerArgs += listOf("-opt-in=androidx.compose.material3.ExperimentalMaterial3Api")
  }
}

kotlin {
  jvmToolchain(17)
}


dependencies {
  val composeBom = platform(libs.androidx.compose.bom)
  implementation(composeBom)
  androidTestImplementation(composeBom)

  // ── Core AndroidX ─────────────────────────────────────────────────────
  implementation(libs.androidx.core.ktx)
  implementation(libs.androidx.lifecycle.runtime.ktx)
  implementation(libs.androidx.activity.compose)
  implementation(libs.androidx.lifecycle.runtime.compose)
  implementation(libs.androidx.lifecycle.viewmodel.compose)
  implementation(libs.androidx.datastore.preferences)

  // ── Compose UI ────────────────────────────────────────────────────────
  implementation(libs.androidx.compose.ui)
  implementation(libs.androidx.compose.ui.tooling.preview)
  implementation(libs.androidx.compose.material3)
  implementation("androidx.compose.material:material-icons-extended")
  implementation(libs.androidx.compose.foundation)
  debugImplementation(libs.androidx.compose.ui.tooling)
  debugImplementation(libs.androidx.compose.ui.test.manifest)

  // ── Navigation (stable Compose Nav) ──────────────────────────────────────
  implementation("androidx.navigation:navigation-compose:2.7.7")

  // ── Hilt DI ───────────────────────────────────────────────────────────
  implementation(libs.hilt.android)
  ksp(libs.hilt.compiler)
  implementation(libs.hilt.navigation.compose)

  // ── Networking ────────────────────────────────────────────────────────
  implementation(libs.retrofit)
  implementation(libs.retrofit.gson)
  implementation(libs.okhttp)
  implementation(libs.okhttp.sse)
  implementation(libs.okhttp.logging)

  // ── Coroutines ────────────────────────────────────────────────────────
  implementation(libs.kotlinx.coroutines.android)
  implementation(libs.kotlinx.serialization.json)

  // ── Markdown rendering ────────────────────────────────────────────────
  implementation(libs.markwon.core)
  implementation(libs.markwon.ext.tables)
  implementation(libs.markwon.ext.strikethrough)
  implementation(libs.markwon.html)
  implementation(libs.markwon.syntax.highlight)

  // ── Image loading ─────────────────────────────────────────────────────
  implementation(libs.coil.compose)

  // ── Testing ───────────────────────────────────────────────────────────
  testImplementation(libs.junit)
  testImplementation(libs.kotlinx.coroutines.test)
  androidTestImplementation(libs.androidx.test.core)
  androidTestImplementation(libs.androidx.test.ext.junit)
  androidTestImplementation(libs.androidx.test.runner)
  androidTestImplementation(libs.androidx.test.espresso.core)
  androidTestImplementation(libs.androidx.compose.ui.test.junit4)
}

