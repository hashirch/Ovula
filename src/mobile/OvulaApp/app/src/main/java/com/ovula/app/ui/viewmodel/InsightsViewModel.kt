package com.ovula.app.ui.viewmodel

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ovula.app.data.api.RetrofitClient
import com.ovula.app.data.model.InsightsResponse
import com.ovula.app.data.repository.InsightsRepository
import kotlinx.coroutines.launch

class InsightsViewModel : ViewModel() {

    private val repository = InsightsRepository(RetrofitClient.apiService)

    private val _insights = MutableLiveData<InsightsResponse>()
    val insights: LiveData<InsightsResponse> = _insights

    private val _loading = MutableLiveData<Boolean>()
    val loading: LiveData<Boolean> = _loading

    private val _error = MutableLiveData<String>()
    val error: LiveData<String> = _error

    fun fetchInsights() {
        viewModelScope.launch {
            _loading.value = true
            try {
                val response = repository.getInsights()
                if (response.isSuccessful && response.body() != null) {
                    _insights.value = response.body()
                } else {
                    _error.value = "Failed to fetch insights"
                }
            } catch (e: Exception) {
                _error.value = e.message ?: "Network error"
            } finally {
                _loading.value = false
            }
        }
    }
}
