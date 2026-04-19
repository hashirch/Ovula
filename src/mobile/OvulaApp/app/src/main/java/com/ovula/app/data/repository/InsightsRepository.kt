package com.ovula.app.data.repository

import com.ovula.app.data.api.OvulaApiService
import com.ovula.app.data.model.InsightsResponse
import retrofit2.Response

class InsightsRepository(private val apiService: OvulaApiService) {

    suspend fun getInsights(): Response<InsightsResponse> {
        return apiService.getInsights()
    }
}
