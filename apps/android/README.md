# DevMastery — Android app (`apps/android`)

Kotlin + Jetpack Compose native client for the DevMastery learning platform.
Built against the same Spring Boot REST API (`services/devmastery-core`) that
powers the Next.js web app in `apps/web`.

---

## What's inside

| Layer | Tech |
|---|---|
| UI | Jetpack Compose (Material 3), Navigation-Compose |
| Networking | Retrofit + OkHttp (raw SSE for AI chat/interview streaming) |
| Serialization | Gson (aligned with Spring's Jackson output) |
| Storage | `EncryptedSharedPreferences` (AES-256-GCM) for the JWT + user identity; Gson disk cache for offline topics |
| DI | Manual `AppContainer` (single graph, lazy singletons) |
| Background | WorkManager (daily spaced-review reminders) |
| Splash | `androidx.core.splashscreen` (`Theme.DevMastery.Starting`) |
| Testing | JUnit 4 + `MainDispatcherRule` for coroutines |

Package layout:

```
com.example.devmastery/
├── ai/            AI chat streaming (SSE)
├── auth/          login, register, TokenManager
├── content/       topic reader, roadmap, path browsing
├── core/          network (AuthInterceptor, ConnectivityObserver, OfflineBanner), notifications
├── dashboard/
├── di/            AppContainer
├── interview/     mock interview + history
├── patterns/      LeetCode patterns
├── profile/       profile, edit, avatar, certificates
├── quiz/
├── review/        spaced review
├── search/        global search
├── theme/         brand tokens matching the web CSS variables
├── visualizer/    embeds web /visualizer in a hardened WebView
└── Navigation.kt  central NavHost
```

---

## Build

**Prereqs:** JDK 17+ (Zulu 21 works — Gradle auto-provisions JDK 17 via
foojay), Android SDK with `platforms;android-36` + `build-tools;36.0.0`.

**One-time setup:**
```powershell
# Either set an env var…
setx ANDROID_HOME "$env:LOCALAPPDATA\Android\Sdk"
# …or create apps/android/local.properties:
#   sdk.dir=C\:\\Android\\Sdk
```

**Build & test:**
```powershell
cd apps/android
.\gradlew.bat :app:assembleDebug        # → app/build/outputs/apk/debug/app-debug.apk
.\gradlew.bat :app:testDebugUnitTest    # runs ViewModel unit tests
.\gradlew.bat :app:assembleRelease      # production build (needs SIGNING_* env)
```

---

## Endpoint configuration

Endpoints come from `BuildConfig`, wired in `app/build.gradle.kts`:

| Build type | `API_BASE_URL` | `WEB_BASE_URL` (visualizer WebView) |
|---|---|---|
| `debug`   | `http://10.0.2.2:8080/v1/` (emulator loopback) | `http://10.0.2.2:3000` |
| `release` | `https://devmastery-core.onrender.com/v1/` | `https://devmastery.pages.dev` |

Read them from Kotlin via `com.example.devmastery.BuildConfig.API_BASE_URL`.

---

## Security posture

- **HTTPS enforced** in production. Cleartext HTTP allowed only for dev hosts
  via `res/xml/network_security_config.xml`.
- **`android:allowBackup="false"`** — prevents `adb backup` extraction of
  the encrypted token store.
- **`HttpLoggingInterceptor` at BODY level** runs **only** in debug builds
  (never leaks tokens/passwords in release logcat).
- **WebView hardening** — file/content access off, mixed content blocked,
  geolocation off, navigation locked to the trusted host (external links
  open in the system browser); Mermaid `securityLevel: 'strict'`.
- **Token storage** in `EncryptedSharedPreferences`, cleared on logout and
  on any 401 (`AuthInterceptor`).

See `docs/ANDROID-PARITY-PLAN.md` § 8a for the full audit + fixes.

---

## Testing

```powershell
.\gradlew.bat :app:testDebugUnitTest
```

Current coverage:
- `ReviewViewModelTest` (3 tests) — due-reviews load, empty state, optimistic
  removal on grade submission.
- `QuizViewModelTest` (3 tests) — load, answer selection, submit → adaptive
  difficulty result.

Add new tests under `app/src/test/java/**`. Use `MainDispatcherRule` for any
ViewModel that launches coroutines in `init` / `viewModelScope`.

---

## The contract rule

**`services/devmastery-core` (Spring Boot) is the API contract.** For any new
Android feature, open the matching controller + service in the backend, copy the
exact endpoint + record fields into a Kotlin DTO, and you'll get guaranteed
compatibility with zero backend changes. `apps/web/src/lib/api.ts` is a
useful secondary reference for how the web client uses those same endpoints.

---

## Roadmap

The full phased plan (Phases 0–17 covering feature parity, hardening,
release polish, and mobile-native superpowers) lives in
`docs/ANDROID-PARITY-PLAN.md`. That doc is the source of truth for what's
done vs. what's next.

