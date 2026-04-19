package com.ovula.app.data.repository

import com.ovula.app.data.api.OvulaApiService
import com.ovula.app.data.model.LogRequest
import com.ovula.app.data.model.LogResponse
import com.ovula.app.data.model.StatsResponse
import retrofit2.Response

class LogsRepository(private val apiService: OvulaApiService) {

    suspend fun createLog(logRequest: LogRequest): Response<LogResponse> {
        return apiService.createLog(logRequest)
    }

    suspend fun getLogs(
        limit: Int = 100,
        startDate: String? = null,
        endDate: String? = null
    ): Response<List<LogResponse>> {
        return apiService.getLogs(limit, startDate, endDate)
    }

    suspend fun getStats(): Response<StatsResponse> {
        return apiService.getStats()
    }

    suspend fun deleteLog(id: Int): Response<Unit> {
        return apiService.deleteLog(id)
    }
}
