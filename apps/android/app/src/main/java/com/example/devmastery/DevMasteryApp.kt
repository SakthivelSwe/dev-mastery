package com.example.devmastery

import android.app.Application
import android.util.Log
import com.example.devmastery.core.notifications.ReviewReminders
import com.example.devmastery.di.AppContainer

class DevMasteryApp : Application() {
    lateinit var container: AppContainer
    override fun onCreate() {
        super.onCreate()
        container = AppContainer(this)
        // Schedule the daily spaced-review reminder (no-op if already scheduled).
        // Guarded so a WorkManager/notification-channel failure on some OEM ROMs
        // can never crash the app during startup.
        try {
            ReviewReminders.schedule(this)
        } catch (e: Exception) {
            Log.w("DevMasteryApp", "Failed to schedule review reminders", e)
        }
    }
}
