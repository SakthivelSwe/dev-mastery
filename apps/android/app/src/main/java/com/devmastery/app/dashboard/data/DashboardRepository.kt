package com.devmastery.app.dashboard.data

import com.devmastery.app.dashboard.data.remote.DashboardApi
import com.devmastery.app.dashboard.data.remote.DashboardDto
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DashboardRepository @Inject constructor(private val api: DashboardApi) {
    suspend fun getDashboard(): Result<DashboardDto> =
        runCatching { api.getDashboard() }
}
