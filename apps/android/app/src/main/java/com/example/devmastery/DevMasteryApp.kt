package com.example.devmastery

import android.app.Application
import android.util.Log
import androidx.work.Configuration
import com.example.devmastery.core.notifications.ReviewReminders
import com.example.devmastery.di.AppContainer

class DevMasteryApp : Application(), Configuration.Provider {
    lateinit var container: AppContainer

    // On-demand WorkManager initialisation. Because the automatic
    // androidx.startup initializer is disabled in the manifest, WorkManager is
    // built lazily the first time WorkManager.getInstance() is called — which
    // happens inside the guarded ReviewReminders.schedule() below, never during
    // the crash-prone ContentProvider startup phase.
    override val workManagerConfiguration: Configuration
        get() = Configuration.Builder()
            .setMinimumLoggingLevel(Log.INFO)
            .build()

    override fun onCreate() {
        super.onCreate()
        container = AppContainer(this)
        // Schedule the daily spaced-review reminder (no-op if already scheduled).
        // Guarded so a WorkManager/Room/notification-channel failure can never
        // crash the app during startup.
        try {
            ReviewReminders.schedule(this)
        } catch (e: Exception) {
            Log.w("DevMasteryApp", "Failed to schedule review reminders", e)
        }
    }
}
