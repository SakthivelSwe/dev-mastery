package com.example.devmastery.content.presentation

import android.content.Context
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.flow.distinctUntilChanged
import java.util.Locale

/**
 * Thin wrapper around Android's [TextToSpeech]. Splits the passed text into
 * sentence-sized chunks so we can:
 *  1) Emit progress ("chunk N of M") to drive a scrubber if we want one later.
 *  2) Yield to `stop()` promptly without waiting for a long paragraph to finish.
 *
 * Commute-friendly: `speak(...)` uses [TextToSpeech.QUEUE_FLUSH] on the first
 * chunk and [TextToSpeech.QUEUE_ADD] for the rest so users can retap
 * "Listen" mid-topic to restart cleanly.
 */
class TtsController(context: Context) {

    enum class Status { Idle, Loading, Speaking, Error }

    private val _status = MutableStateFlow(Status.Idle)
    val status: StateFlow<Status> = _status.asStateFlow()

    private var tts: TextToSpeech? = null
    private var ready = false

    init {
        tts = TextToSpeech(context.applicationContext) { code ->
            ready = code == TextToSpeech.SUCCESS
            if (ready) {
                tts?.language = Locale.getDefault()
                _status.value = Status.Idle
            } else {
                _status.value = Status.Error
            }
        }
        tts?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
            override fun onStart(utteranceId: String?) { _status.value = Status.Speaking }
            override fun onDone(utteranceId: String?) {
                // Only flip back to Idle when the LAST queued chunk finishes.
                if (utteranceId?.endsWith(":last") == true) _status.value = Status.Idle
            }
            @Deprecated("Kept for compatibility with older TTS engines.")
            override fun onError(utteranceId: String?) { _status.value = Status.Error }
        })
    }

    fun speak(text: String) {
        val engine = tts ?: return
        if (!ready) { _status.value = Status.Loading; return }
        stop()
        val chunks = splitSentences(text).take(500) // safety bound
        if (chunks.isEmpty()) return
        chunks.forEachIndexed { i, chunk ->
            val id = if (i == chunks.lastIndex) "utt-$i:last" else "utt-$i"
            val mode = if (i == 0) TextToSpeech.QUEUE_FLUSH else TextToSpeech.QUEUE_ADD
            engine.speak(chunk, mode, null, id)
        }
        _status.value = Status.Speaking
    }

    fun stop() {
        tts?.stop()
        _status.value = Status.Idle
    }

    fun shutdown() {
        tts?.stop()
        tts?.shutdown()
        tts = null
    }

    private fun splitSentences(text: String): List<String> {
        // Strip common markdown that isn't worth speaking aloud, then split by
        // sentence-ish punctuation.
        val cleaned = text
            .replace(Regex("```[\\s\\S]*?```"), " ")         // fenced code
            .replace(Regex("`[^`]*`"), " ")                    // inline code
            .replace(Regex("!\\[[^]]*]\\([^)]*\\)"), " ")     // images
            .replace(Regex("\\[([^]]+)]\\([^)]*\\)"), "$1")   // links → label
            .replace(Regex("[#*_>~-]{2,}"), " ")               // md markers
            .replace(Regex("\\s+"), " ")
            .trim()
        if (cleaned.isBlank()) return emptyList()
        return cleaned.split(Regex("(?<=[.!?])\\s+"))
            .map { it.trim() }
            .filter { it.isNotBlank() }
    }
}

