package com.example.devmastery.profile.presentation

import android.content.Context
import android.content.Intent
import androidx.core.content.FileProvider
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.File

/**
 * Downloads a certificate PDF and hands it to the system share sheet via
 * [FileProvider] — never exposes a raw `file://` URI to other apps.
 */
object CertificateShare {

    private val http by lazy { OkHttpClient() }

    suspend fun shareCertificatePdf(
        context: Context,
        pdfUrl: String,
        pathTitle: String
    ): Result<Unit> = withContext(Dispatchers.IO) {
        runCatching {
            val bytes = http.newCall(Request.Builder().url(pdfUrl).build()).execute().use { resp ->
                if (!resp.isSuccessful) error("HTTP ${resp.code}")
                resp.body?.bytes() ?: error("Empty response")
            }

            val dir = File(context.cacheDir, "certificates").apply { mkdirs() }
            val safeName = pathTitle
                .lowercase()
                .replace(Regex("[^a-z0-9]+"), "-")
                .trim('-')
                .ifBlank { "certificate" }
            val outFile = File(dir, "$safeName.pdf")
            outFile.writeBytes(bytes)

            val uri = FileProvider.getUriForFile(
                context,
                "${context.packageName}.fileprovider",
                outFile
            )

            val send = Intent(Intent.ACTION_SEND).apply {
                type = "application/pdf"
                putExtra(Intent.EXTRA_STREAM, uri)
                putExtra(Intent.EXTRA_SUBJECT, "$pathTitle — DevMastery Certificate")
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }
            val chooser = Intent.createChooser(send, "Share certificate").apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(chooser)
        }
    }
}

