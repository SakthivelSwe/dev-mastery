package com.example.devmastery.core.notifications

import android.Manifest
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.example.devmastery.DevMasteryApp
import com.example.devmastery.R

/**
 * Daily background check: if the learner has spaced-review topics due, post a
 * reminder notification. The Android equivalent of the web app's review nudges.
 */
class ReviewReminderWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        val app = applicationContext as? DevMasteryApp ?: return Result.success()

        // Only remind signed-in users.
        if (app.container.tokenManager.getToken().isNullOrBlank()) return Result.success()

        val due = app.container.progressRepository.getDueReviews().getOrNull().orEmpty()
        if (due.isNotEmpty()) {
            postReminder(due.size)
        }
        return Result.success()
    }

    private fun postReminder(count: Int) {
        // Respect the runtime notification permission on Android 13+.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            val granted = ContextCompat.checkSelfPermission(
                applicationContext, Manifest.permission.POST_NOTIFICATIONS
            ) == PackageManager.PERMISSION_GRANTED
            if (!granted) return
        }

        val text = if (count == 1) "1 topic is due for review." else "$count topics are due for review."

        // Tap → open the app on the Review screen (deep link).
        val openReview = Intent(Intent.ACTION_VIEW, Uri.parse("devmastery://review")).apply {
            setPackage(applicationContext.packageName)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
        }
        val pendingFlags =
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M)
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            else PendingIntent.FLAG_UPDATE_CURRENT
        val openPending = PendingIntent.getActivity(applicationContext, 0, openReview, pendingFlags)

        val notification = NotificationCompat.Builder(applicationContext, ReviewReminders.CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle("Time to review 🧠")
            .setContentText(text)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setContentIntent(openPending)
            .addAction(0, "Start now", openPending)
            .setAutoCancel(true)
            .build()

        try {
            NotificationManagerCompat.from(applicationContext).notify(REVIEW_NOTIFICATION_ID, notification)
        } catch (_: SecurityException) {
            // Permission revoked between check and notify — ignore.
        }
    }

    companion object {
        private const val REVIEW_NOTIFICATION_ID = 1001
    }
}


