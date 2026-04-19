package com.ovula.app.ui.viewmodel

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ovula.app.data.api.RetrofitClient
import com.ovula.app.data.model.HealthProfileRequest
import com.ovula.app.data.model.PredictionResponse
import com.ovula.app.data.repository.PredictionRepository
import kotlinx.coroutines.launch

class PredictionViewModel : ViewModel() {

    private val repository = PredictionRepository(RetrofitClient.apiService)

    private val _healthProfile = MutableLiveData<HealthProfileRequest>()
    val healthProfile: LiveData<HealthProfileRequest> = _healthProfile

    private val _prediction = MutableLiveData<PredictionResponse>()
    val prediction: LiveData<PredictionResponse> = _prediction

    private val _loading = MutableLiveData<Boolean>()
    val loading: LiveData<Boolean> = _loading

    private val _error = MutableLiveData<String>()
    val error: LiveData<String> = _error

    fun fetchHealthProfile() {
        viewModelScope.launch {
            _loading.value = true
            try {
                val response = repository.getHealthProfile()
                if (response.isSuccessful && response.body() != null) {
                    _healthProfile.value = response.body()
                }
            } catch (e: Exception) {
                // Profile doesn't exist yet
            } finally {
                _loading.value = false
            }
        }
    }

    fun createHealthProfile(profile: HealthProfileRequest) {
        viewModelScope.launch {
            _loading.value = true
            try {
                val response = repository.createHealthProfile(profile)
                if (response.isSuccessful && response.body() != null) {
                    _healthProfile.value = response.body()
                } else {
                    _error.value = "Failed to create health profile"
                }
            } catch (e: Exception) {
                _error.value = e.message ?: "Network error"
            } finally {
                _loading.value = false
            }
        }
    }

    fun predict() {
        viewModelScope.launch {
            _loading.value = true
            try {
                val response = repository.predict()
                if (response.isSuccessful && response.body() != null) {
                    _prediction.value = response.body()
                } else {
                    _error.value = "Failed to generate prediction"
                }
            } catch (e: Exception) {
                _error.value = e.message ?: "Network error"
            } finally {
                _loading.value = false
            }
        }
    }
}
