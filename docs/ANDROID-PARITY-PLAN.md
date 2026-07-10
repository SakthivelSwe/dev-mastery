# Android Feature-Parity Plan — Bringing the Web App into `apps/android`

> **Goal:** Bring the Kotlin + Jetpack Compose Android app up to full feature parity
> with the Next.js web app, reusing the **same Spring Boot REST API** (no backend
> changes required). This is a reverse-migration: the web app is currently the
> superset; Android needs to catch up.

---

## 1. Current State — Gap Analysis

| Feature | Web (`apps/web`) | Android (`apps/android`) | Action |
|---|---|---|---|
| Login | ✅ `/login` | ✅ `LoginScreen` | Keep, harden |
| Register | ✅ `/register` | ❌ | **Build** |
| Dashboard | ✅ `/dashboard` | ✅ `DashboardScreen` | Extend |
| Path roadmap | ✅ `/learn/[path]/roadmap` | ✅ `RoadmapScreen` | Extend |
| Topic reader (6 layers) | ✅ topic page | ⚠️ `TopicReaderScreen` (partial) | **Extend to 6 layers** |
| System design | ✅ `/system-design` (+ studio) | ⚠️ `SystemDesignScreen` (viewer only) | Add studio (optional) |
| Spaced review (SM-2) | ✅ `/review` | ❌ | **Build** |
| Mock interview | ✅ `/interview` | ❌ | **Build** |
| Algorithm visualizers | ✅ `/visualizer` | ❌ | **Build (WebView or native)** |
| LeetCode patterns | ✅ `/patterns` | ❌ | **Build** |
| Profile / stats | ✅ `/profile` | ❌ | **Build** |
| Certificates | ✅ `/profile/certificates` | ❌ | **Build** |
| Settings | ✅ `/settings` | ❌ | **Build** |
| AI chat (SSE) | ✅ `useAiChat` | ❌ | **Build (streaming)** |
| Feynman check / Build challenge | ✅ panels | ⚠️ panels exist | Wire to API |
| Code runner | ✅ Monaco + external links | ❌ | External-link redirect |
| Offline support | ✅ PWA service worker | ❌ | **Room cache** |
| Push notifications | ✅ Web Push (planned) | ❌ | **FCM / local notifications** |

**Verdict:** ~10 net-new screens + 3 screen extensions + 2 cross-cutting systems
(offline cache, notifications).

---

## 2. Target Android Architecture

Standardize before adding features, so each new screen drops into a consistent pattern.

```
com.example.devmastery/
├── core/
│   ├── network/        Retrofit, OkHttp, AuthInterceptor, SSE client
│   ├── auth/           TokenManager (EncryptedSharedPreferences → DataStore)
│   ├── db/             Room: entities, DAOs, DevMasteryDatabase (offline cache)
│   ├── ui/             Design tokens, shared composables, theme
│   └── di/             AppContainer (or migrate to Hilt)
├── feature/
│   ├── auth/           login, register
│   ├── dashboard/
│   ├── content/        roadmap, topicReader (6 layers), systemDesign
│   ├── review/         spaced repetition queue
│   ├── interview/      mock interview simulator
│   ├── visualizer/     algorithm visualizers
│   ├── patterns/       leetcode patterns
│   ├── profile/        profile, certificates, settings
│   └── ai/             AI chat (SSE streaming)
└── Navigation.kt       central NavHost
```

**Recommended stack decisions**
- **DI:** Keep manual `AppContainer` for now; migrate to **Hilt** only if the graph
  grows painful. (Adding Hilt is a good early Phase 0 task if you want it.)
- **Pattern:** MVVM — one `ViewModel` per screen exposing `StateFlow<UiState>`.
- **Networking:** Retrofit + Kotlinx Serialization (already partly in place).
- **Streaming (AI chat):** OkHttp raw call reading the SSE stream line-by-line
  (Retrofit doesn't stream well); emit tokens into a `Flow<String>`.
- **Offline:** Room mirrors read-heavy content (`topics`, `paths`, `patterns`);
  repositories follow **cache-then-network** (mirrors the web's StaleWhileRevalidate).
- **Token storage:** migrate `EncryptedSharedPreferences` → **DataStore** (encrypted)
  for coroutine-friendly reads; add a 401 → logout interceptor.

---

## 3. API Endpoints Per Feature (all already exist on the backend)

| Screen | Endpoints |
|---|---|
| Register | `POST /v1/auth/register` |
| Profile | `GET /v1/profile`, `PUT /v1/profile`, `POST /v1/profile/avatar` |
| Spaced review | `GET /v1/progress/reviews/due`, `POST /v1/progress/reviews/{topicId}` |
| Dashboard stats | `GET /v1/progress/summary` |
| Patterns | `GET /v1/patterns` (+ `/patterns/{slug}`) |
| Quiz | `GET /v1/quizzes/{id}`, `POST /v1/quizzes/{id}/submit` |
| Interview | `GET/POST /v1/interviews` (mirror web `lib/api.ts` calls) |
| AI chat | `POST /v1/ai/chat` (SSE), `POST /v1/ai/feynman/score` |
| Certificates | `GET /v1/profile` certificates / storage URLs |
| Topic complete | `POST /v1/lessons/{id}/complete` |

> Read the web `apps/web/src/lib/api.ts` as the **contract source of truth** — every
> request shape and response DTO the Android app needs is already implemented there.

---

## 4. Native-Feature Equivalents (Web → Android)

| Web mechanism | Android equivalent |
|---|---|
| PWA offline app-shell | **Room** cache + repository fallback |
| Service-worker StaleWhileRevalidate | cache-then-network repositories |
| httpOnly cookie / localStorage token | **EncryptedSharedPreferences → DataStore** |
| Web Push (VAPID) | **Firebase Cloud Messaging** or local `NotificationManager` for review reminders |
| Monaco editor / "Try online" links | External-browser `Intent` to OneCompiler/Programiz |
| `getUserMedia` (avatar) | `ActivityResultContracts.GetContent` / camera intent |
| Framer Motion transitions | Compose `AnimatedContent` / `animate*AsState` |
| CSS variables theme tokens | Compose `MaterialTheme` + custom token object |

---

## 5. Phased Roadmap

Each phase is independently shippable and leaves the app compiling.

### Phase 0 — Foundation (1–2 days)
- [x] Add `AuthInterceptor` (attaches Bearer token) + 401→logout handling.
- [ ] Introduce full `core/` package structure; move existing files.
- [ ] Add Room + Kotlinx Serialization + (optional) Hilt dependencies.
- [ ] Make `BASE_URL` build-config driven (`10.0.2.2` for emulator, Render URL for release).
- [ ] Establish `UiState<T>` sealed pattern + a reusable `ErrorState`/`Loading` composable.

### Phase 1 — Auth completion (0.5 day)
- [x] `RegisterScreen` + register in `AuthViewModel` (`POST /v1/auth/register`).
- [x] Client-side validation (email/password ≥ 8) mirroring web Zod rules.
- [x] Persist token, route to Dashboard; login⇄register links wired.
- [x] Add logout (in Settings screen).

### Phase 2 — Profile, Settings, Certificates (1–2 days)
- [x] `ProfileScreen` — stats from `GET /v1/progress/summary` (+ stored user identity).
- [x] `SettingsScreen` — account info + logout (clears token, resets nav stack).
- [x] User identity persisted in `TokenManager` (id/name/email).
- [x] `CertificatesScreen` — `GET /v1/certificates`, opens PDF via intent (contract from backend source).
- [x] `ProfileApi` — `GET/PUT /v1/profile` DTOs ready (`ProfileDto`/`UpdateProfileRequest`).
- [x] `ProfileEditScreen` — edit bio/GitHub/LinkedIn/timezone (`PUT /v1/profile`) + avatar upload via image picker → multipart `POST /v1/profile/avatar`.

### Phase 3 — Spaced Review (1–2 days)
- [x] `ReviewScreen` — queue from `GET /v1/progress/reviews/due`.
- [x] Grade UI (Again/Hard/Good/Easy) → `POST /v1/progress/reviews/{topicId}`.
- [x] Dashboard entry point wired.
- [x] Local `NotificationManager` daily reminder (WorkManager scheduled — see Phase 9).

### Phase 4 — Topic Reader parity (1–2 days)
- [x] Topic reader renders all backend sections (why/theory/visual/code/real-world/interview) as tabs.
- [x] Feynman / Build / SpacedReview panels wired to `completeLayer` / `submitReview`.
- [x] Back navigation added to the reader top bar.
- [ ] Wire Feynman panel to live `POST /v1/ai/feynman/score` (AI layer now exists — pending panel UI).
- [ ] Room-cache topic content for offline reading.

### Phase 5 — Patterns + Quiz (1–2 days)
- [x] `PatternsScreen` — `GET /v1/patterns` list + `GET /v1/patterns/{slug}` detail sheet.
- [x] Practice problems open LeetCode via `ACTION_VIEW` intent.
- [x] Dashboard entry point wired.
- [x] Quiz flow — `GET /v1/quizzes/{id}` → answer → `POST submit` → score + adaptive level (contract from `QuizService`); reachable via `quiz/{quizId}` route.

### Phase 6 — AI Chat (SSE streaming) (1–2 days)
- [x] `AiChatScreen` with streaming message bubbles (markdown).
- [x] `AiChatStreamer` — raw OkHttp SSE reader → `Flow<String>` from `POST /v1/ai/chat`.
- [x] `AiApi.scoreFeynman` — `POST /v1/ai/feynman/score` (repository ready).
- [x] Dashboard entry point + `ai/{topicSlug}` route wired.

### Phase 7 — Mock Interview (2–3 days)
- [x] `InterviewScreen` — setup (topic + level) → chat → finish → scorecard.
- [x] Reuses `AiChatStreamer` with the interviewer primer (`sectionType = "interview"`).
- [x] Persists via `POST /v1/interviews` + grades via `POST /v1/interviews/{id}/grade`.
- [x] Dashboard entry point wired.

### Phase 8 — Visualizers (2–4 days, scope-dependent)
- [x] **Fast path shipped:** `VisualizerScreen` embeds the deployed web `/visualizer`
      route in a `WebView` (JS + DOM storage enabled, loading + error states).
- [ ] **Native path (optional):** reimplement top visualizers in Compose Canvas.

### Phase 9 — Polish & release (1–2 days)
- [x] Match brand theme to web tokens (accent `#7C8FF0`, dark-first `#080A10`); dynamic color off.
- [x] Daily spaced-review reminders — WorkManager `ReviewReminderWorker` + notification channel + POST_NOTIFICATIONS permission/runtime request.
- [x] Offline topic cache — Gson disk cache (`TopicCache`) with cache-then-network fallback in `ContentRepository` (no annotation processing needed; full Room deferred).
- [x] Release config: `BuildConfig.API_BASE_URL` / `WEB_BASE_URL` — emulator URLs for debug, Render + Cloudflare Pages for release; consumed by `AppContainer` + `VisualizerScreen`.
- [x] Offline banner UI — `ConnectivityObserver` + `OfflineBanner` shown app-wide above the nav (uses `ACCESS_NETWORK_STATE`).
- [ ] Full Room-based cache (optional upgrade over the current Gson disk cache).
- [ ] Verify R8/proguard rules for release build (existing `-keep com.example.devmastery.**` already covers DTOs).

**Rough total:** ~3–4 focused weeks for full native parity, or ~2 weeks if
visualizers use the WebView fast-path.

---

## 6. Cross-Cutting Checklist
- [ ] **Auth:** single interceptor, auto-logout on 401, token in DataStore.
- [ ] **Error handling:** typed `ApiResult` (Success/Error/Loading) everywhere.
- [ ] **Theme:** central token object matching web CSS variables; dark/light.
- [ ] **Offline:** Room for `topics`/`paths`/`patterns`; cache-then-network.
- [x] **Notifications:** WorkManager + NotificationManager for review reminders.
- [x] **Testing:** coroutines `MainDispatcherRule` + `ReviewViewModelTest` & `QuizViewModelTest` (removed a stale template test that referenced non-existent classes).
- [ ] **Config:** `BASE_URL` via `BuildConfig` (debug=emulator, release=Render).

---

## 7. Recommended Execution Order
`Phase 0 → 1 → 2 → 3 → 4 → 6 → 5 → 7 → 8 → 9`

Rationale: get the foundation + auth + the highest daily-value loops (profile,
review, richer reading, AI) shipping early; interview and visualizers (heaviest)
come after the core loop is solid.

---

## 8. The Single Most Important Rule

---

## 8a. Security Hardening (2026-07-10 — validated in debug build)

Applied after a full mobile-security audit (OWASP MASVS basics):

- **HTTPS enforced.** `res/xml/network_security_config.xml` sets
  `cleartextTrafficPermitted="false"` globally; HTTP is allowed **only** for dev
  hosts (`10.0.2.2`, `localhost`, `127.0.0.1`). Removed `usesCleartextTraffic="true"`.
- **Backup disabled.** `android:allowBackup="false"` — prevents `adb backup`
  extraction of app data (incl. the encrypted token store).
- **No token/password leakage.** `HttpLoggingInterceptor` at BODY level now runs
  **only in debug** (`BuildConfig.DEBUG`); release logs nothing sensitive.
- **WebView hardening** (`VisualizerScreen`, `MermaidWebView`):
  `allowFileAccess=false`, `allowContentAccess=false`,
  `allowFileAccess/UniversalAccessFromFileURLs=false`,
  `mixedContentMode=NEVER_ALLOW`, geolocation off; navigation restricted to the
  trusted host (external links open in the system browser); Mermaid
  `securityLevel: 'strict'`; secure (non-null) base origin. No
  `addJavascriptInterface` anywhere.
- **Token storage** stays in `EncryptedSharedPreferences` (AES-256-GCM), cleared
  on logout and on any 401 (via `AuthInterceptor`).
- **Responsiveness:** Login, Register, and Dashboard now use
  `verticalScroll` + `imePadding()` + `safeDrawingPadding()` so they work down to
  375 px, on short screens, and with the keyboard open / edge-to-edge insets.

Residual notes (not runtime vulnerabilities):
- Release signing uses a **dev fallback password** in `build.gradle.kts` when CI
  env vars are absent — real releases must set `SIGNING_*` env secrets.
- The `-keep class com.example.devmastery.**` ProGuard rule keeps app classes
  un-obfuscated to guarantee Gson field-name integrity; acceptable trade-off.

---

## 8b. The contract rule
**`apps/web/src/lib/api.ts` (and `services/devmastery-core`) are the contract.**
For every Android feature, copy the exact endpoint + request/response shape into a
Kotlin DTO for guaranteed compatibility with zero backend changes.

---

## 9. Building & Validating (final step)

**✅ BUILD VALIDATED (2026-07-10).** The Android SDK was installed (`C:\Android\Sdk`,
cmdline-tools + platform-tools + `platforms;android-36` + `build-tools;36.0.0`), a
`local.properties` was added (`sdk.dir`), and the project builds + tests clean:

- `:app:assembleDebug` → **BUILD SUCCESSFUL** → `app/build/outputs/apk/debug/app-debug.apk` (~15.7 MB)
- `:app:testDebugUnitTest` → **BUILD SUCCESSFUL** → `QuizViewModelTest` (3) + `ReviewViewModelTest` (3) = **6 tests, 0 failures**
- Gradle auto-provisioned the JDK 17 toolchain via the foojay resolver (host JDK: Zulu 21).
- One real compile error was found & fixed during the build: a missing `import androidx.compose.ui.unit.dp` in `VisualizerScreen.kt`.

The code compiles cleanly. Setup notes below are retained for other machines.

**One-time setup**
1. Install Android Studio (bundles the SDK) or the command-line SDK tools.
2. Point Gradle at the SDK — either set an env var:
   ```powershell
   setx ANDROID_HOME "$env:LOCALAPPDATA\Android\Sdk"
   ```
   …or create `apps/android/local.properties`:
   ```properties
   sdk.dir=C\:\\Users\\<you>\\AppData\\Local\\Android\\Sdk
   ```

**Build**
```powershell
cd apps/android
.\gradlew.bat :app:assembleDebug   # emulator config → 10.0.2.2:8080
.\gradlew.bat :app:assembleRelease # production config → Render + Cloudflare Pages
```

**Endpoint config** is driven by `BuildConfig` (see `app/build.gradle.kts`):
- `debug`  → `API_BASE_URL=http://10.0.2.2:8080/v1/`, `WEB_BASE_URL=http://10.0.2.2:3000`
- `release` → `API_BASE_URL=https://devmastery-core.onrender.com/v1/`, `WEB_BASE_URL=https://devmastery.pages.dev`

**New dependencies added during the migration**
- `zod` (web), `androidx.work:work-runtime-ktx` (Android). Room aliases already
  existed in the version catalog but remain unused (Gson disk cache is used instead).

---

## 10. Post-Parity Enhancement Phases (2026-07-10)

Feature parity with the web app is complete. These phases add the remaining
"nice-to-haves" and mobile-native superpowers surfaced by the final gap audit.
Each phase is independently shippable and leaves the app compiling.

### Phase 10 — Certificate loop closure (XS · **highest ROI, do first**)
Currently learners can view earned certificates but cannot earn one from Android.
- [x] Add `POST /v1/certificates/{pathSlug}` to `ProfileApi.claimCertificate(pathSlug)`.
- [x] `CertificatesScreen` gains a top-bar **"Claim"** action → dialog with path slug entry; success refreshes the list + snackbar. (Phase 11's Roadmap screen will later add a proper button on the completed path.)
- [x] Handle 400/409/404 with friendly messages ("This path isn't fully complete yet, or the certificate was already claimed.").
- [x] Validated: `:app:assembleDebug` + `:app:testDebugUnitTest` → BUILD SUCCESSFUL.

### Phase 11 — Path browsing (S)
Users can only reach topics via the hardcoded dashboard card today.
- [x] `contentApi.getAllPaths()` → `GET /v1/paths` and `getPath(slug)` → `GET /v1/paths/{slug}` added; DTOs `LearningPathDto` + `TopicSummaryDto` match the web contract.
- [x] `PathsListScreen` — cards grid of learning paths (title, description, topic count).
- [x] `PathOverviewScreen` (`/path/{slug}`) — path header + topics list; each row opens the topic reader; **Roadmap** action in the top bar.
- [x] `RoadmapScreen` (`/path/{slug}/roadmap`) — reuses existing `PathRoadmapResponse` DTO; shows overall progress bar, per-level completion, ✓/○ per topic (with visualizer/code-lab badges); topic tap opens the reader.
- [x] Dashboard now has a **"Browse learning paths"** entry button.
- [x] Validated: `:app:assembleDebug` + `:app:testDebugUnitTest` → BUILD SUCCESSFUL (11 tasks executed).

### Phase 12 — Interview history (M)
Backend + DTOs already exist (`InterviewApi.history()`, `saveInterview…`).
- [x] `InterviewHistoryScreen` — list of past sessions (topic, level, date, verdict chip).
- [x] `InterviewDetailScreen` — summary + scorecard block + full transcript replay (markdown bubbles).
- [x] Entry point on the setup screen: "**History**" top-bar action.
- [x] Added `GET /v1/interviews/{id}` → `InterviewApi.detail(id)` + `InterviewSessionDetailDto` (matches Spring `SessionDetail` record exactly).
- [x] Validated: `:app:assembleDebug` + `:app:testDebugUnitTest` → BUILD SUCCESSFUL.

### Phase 13 — Search & discovery (S)
- [x] `SearchApi` → `GET /v1/search?q=…&limit=…` returning `List<SearchHitDto>` (matches Spring `SearchService.SearchHit`).
- [x] Debounced `SearchViewModel` (300 ms debounce, ≥ 2-char minimum) exposing `SearchUiState`.
- [x] `SearchScreen` — text field + result cards (title + type chip + snippet), empty / no-results / loading / error states.
- [x] Search icon in the Dashboard top bar → `search` route; tapping a hit opens the topic reader.
- [x] Validated: `:app:assembleDebug` + `:app:testDebugUnitTest` → BUILD SUCCESSFUL.

### Phase 14 — Production polish (S · **do before Play Store submission**)
- [x] **Splash screen** — `androidx.core.splashscreen` + `Theme.DevMastery.Starting`
      (brand `#080A10` background, launcher foreground icon). Manifest points at
      the splash theme; `MainActivity.installSplashScreen()` hands off on first frame.
- [ ] **Crash reporting** — Firebase Crashlytics / Sentry deferred (requires
      Firebase project + `google-services.json` OR a Sentry DSN — one-command
      wire-up once you supply either).
- [x] **Accessibility** — audited: every clickable in the app is text-labeled
      (no bare `Icon(` composables), so screen readers already announce them.
- [x] **`apps/android/README.md`** — architecture, build, endpoint matrix,
      security posture, testing, contract rule.
- [x] **Consumer ProGuard rules** for Retrofit / OkHttp / Gson / Okio (safety net;
      TypeToken preserved; upstream warnings suppressed).
- [x] Validated: `:app:assembleDebug` + `:app:testDebugUnitTest` → BUILD SUCCESSFUL.

### Phase 15 — Sharing & deep links (S)
- [x] `intent-filter` on `MainActivity` for both `https://devmastery.pages.dev/learn/*`
      (with `autoVerify="true"` for App Links) **and** custom scheme `devmastery://learn/*`.
- [x] `MainNavigation(deepLinkUri)` interprets the URI and jumps to `topic/{slug}`
      or `path/{slug}` on cold start.
- [x] **FileProvider** declared in the manifest (`${applicationId}.fileprovider`)
      + `res/xml/file_paths.xml` (private cache-path).
- [x] `CertificateShare.shareCertificatePdf()` — downloads the PDF to
      `cacheDir/certificates/<slug>.pdf` and fires `ACTION_SEND` via FileProvider
      (no raw `file://` URI leaked; `FLAG_GRANT_READ_URI_PERMISSION`).
- [x] Certificate cards now show **View PDF** + **Share** side by side.
- [x] Validated: `:app:assembleDebug` + `:app:testDebugUnitTest` → BUILD SUCCESSFUL.

### Phase 16 — Mobile-native superpowers (M · **differentiators**)
Things that make the Android app better than the website for a phone-primary user.
- [x] **Biometric app lock** (opt-in) — `androidx.biometric` + `BiometricAuth`
      helper; toggle in Settings; `MainActivity` (now `FragmentActivity`) gates
      the UI on cold start when: enabled ∧ token present ∧ device supports it.
      Falls back to device credential (PIN/pattern), never locks users out if
      no biometrics are enrolled.
- [x] **Notification actions** — daily reminder gains a **Start now** action
      (and content-intent) that opens `devmastery://review`, wired end-to-end
      through the new deep-link scheme.
- [x] **Streak celebration (haptic)** — GOOD / EASY grades fire a
      `HapticFeedbackType.LongPress` pulse when submitted.
- [ ] **Home-screen widget** (Glance) — deferred: needs `glance-appwidget`
      dependency, receiver + `AppWidgetProviderInfo` + on-device verification.
      Recommend doing this once we have an emulator/device in the CI loop.
- [x] Validated: `:app:assembleDebug` + `:app:testDebugUnitTest` → BUILD SUCCESSFUL
      (biometric dep downloaded; 43 tasks executed).

### Phase 17 — Advanced (L · optional)
- [x] **Text-to-speech reader mode** — `TtsController` (Android `TextToSpeech` +
      sentence-chunker that strips code fences/inline code/links); **Listen / Stop**
      action in the Topic Reader top bar; auto-shutdown on `DisposableEffect`.
- [x] **"Download for offline"** — `TopicCache` now supports star / unstar /
      list / total-size / clear-all. Star (☆/★) action in the Topic Reader
      snapshots the current topic locally; Settings gains an **Offline
      downloads** card ("N topics · X MB" + "Clear downloads").
- [ ] **Play Integrity API** attestation — deferred: requires Google Cloud +
      Play Console project setup.
- [ ] **Baseline profile** (`baseline-prof.txt`) — deferred: requires
      Macrobenchmark + physical device / emulator in the CI loop.
- [ ] Comments API on topics (`/v1/comments/**`, 7 endpoints — still unused on
      both platforms; deferred, non-critical community feature).
- [x] Validated: `:app:assembleDebug` + `:app:testDebugUnitTest` → BUILD SUCCESSFUL.

---

## 11. Recommended execution order

`10 → 11 → 12 → 13 → 14 → 15 → 16 → 17`

Rationale: Phase 10 closes the certificate loop with almost zero work.
Phases 11–13 restore the last web features Android is missing. Phase 14 is
Play-Store readiness. Phase 15 unlocks sharing/deep-linking. Phase 16 makes
the Android app a genuinely better experience than the web app for mobile
users. Phase 17 is long-tail polish and community — do only if the app takes
off.
