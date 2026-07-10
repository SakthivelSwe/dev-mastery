package com.example.devmastery.review.presentation

import com.example.devmastery.MainDispatcherRule
import com.example.devmastery.progress.data.remote.LayerCompletionRequest
import com.example.devmastery.progress.data.remote.ProgressApi
import com.example.devmastery.progress.data.remote.ProgressRepository
import com.example.devmastery.progress.data.remote.ProgressSummaryDto
import com.example.devmastery.progress.data.remote.ReviewRatingRequest
import com.example.devmastery.progress.data.remote.SpacedReviewDto
import junit.framework.TestCase.assertEquals
import junit.framework.TestCase.assertTrue
import kotlinx.coroutines.test.runTest
import org.junit.Rule
import org.junit.Test

class ReviewViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private fun review(topicId: String) = SpacedReviewDto(
        id = "id-$topicId",
        topicId = topicId,
        topicSlug = "topic-$topicId",
        easinessFactor = 2.5f,
        intervalDays = 1,
        repetitions = 0,
        nextReviewDate = "2026-07-10"
    )

    private class FakeProgressApi(
        private val due: List<SpacedReviewDto>
    ) : ProgressApi {
        override suspend fun completeLayer(request: LayerCompletionRequest) {}
        override suspend fun getDueReviews(): List<SpacedReviewDto> = due
        override suspend fun submitReview(topicId: String, request: ReviewRatingRequest) {}
        override suspend fun getSummary(userId: String): ProgressSummaryDto =
            ProgressSummaryDto(totalXp = 0, streak = 0, rank = "Novice")
    }

    @Test
    fun loadsDueReviews_intoSuccessState() = runTest {
        val vm = ReviewViewModel(ProgressRepository(FakeProgressApi(listOf(review("t1"), review("t2")))))
        val state = vm.state.value
        assertTrue(state is ReviewState.Success)
        assertEquals(2, (state as ReviewState.Success).reviews.size)
    }

    @Test
    fun emptyQueue_producesEmptyState() = runTest {
        val vm = ReviewViewModel(ProgressRepository(FakeProgressApi(emptyList())))
        assertTrue(vm.state.value is ReviewState.Empty)
    }

    @Test
    fun submitRating_optimisticallyRemovesReviewedTopic() = runTest {
        val vm = ReviewViewModel(ProgressRepository(FakeProgressApi(listOf(review("t1"), review("t2")))))
        vm.submitRating("t1", ReviewRating.GOOD)
        val state = vm.state.value
        assertTrue(state is ReviewState.Success)
        state as ReviewState.Success
        assertEquals(1, state.reviews.size)
        assertEquals("t2", state.reviews.first().topicId)
    }
}

