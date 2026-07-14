package com.devmastery.app.interview.data

import com.devmastery.app.interview.data.remote.GradeRequest
import com.devmastery.app.interview.data.remote.InterviewApi
import com.devmastery.app.interview.data.remote.InterviewScoreCard
import com.devmastery.app.interview.data.remote.InterviewSessionDetail
import com.devmastery.app.interview.data.remote.InterviewSessionSummary
import com.devmastery.app.interview.data.remote.InterviewTranscriptTurn
import com.devmastery.app.interview.data.remote.SaveSessionRequest
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class InterviewRepository @Inject constructor(private val api: InterviewApi) {

    suspend fun saveSession(
        topicSlug: String,
        targetLevel: String,
        startedAt: String,
        endedAt: String,
        transcript: List<InterviewTranscriptTurn>,
        scoreCard: InterviewScoreCard?,
    ): Result<String> = runCatching {
        api.saveSession(
            SaveSessionRequest(topicSlug, targetLevel, startedAt, endedAt, transcript, scoreCard)
        ).id
    }

    suspend fun listSessions(): Result<List<InterviewSessionSummary>> =
        runCatching { api.listSessions() }

    suspend fun getSession(id: String): Result<InterviewSessionDetail> =
        runCatching { api.getSession(id) }

    suspend fun gradeSession(id: String, scorecardText: String): Result<InterviewScoreCard> =
        runCatching { api.gradeSession(id, GradeRequest(scorecardText)) }
}
