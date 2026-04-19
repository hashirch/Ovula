package com.ovula.app.data.repository

import com.ovula.app.data.api.OvulaApiService
import com.ovula.app.data.model.HealthProfileRequest
import com.ovula.app.data.model.PredictionResponse
import retrofit2.Response

class PredictionRepository(private val apiService: OvulaApiService) {

    suspend fun createHealthProfile(profile: HealthProfileRequest): Response<HealthProfileRequest> {
        return apiService.createHealthProfile(profile)
    }

    suspend fun getHealthProfile(): Response<HealthProfileRequest> {
        return apiService.getHealthProfile()
    }

    suspend fun predict(): Response<PredictionResponse> {
        return apiService.predict()
    }
}
