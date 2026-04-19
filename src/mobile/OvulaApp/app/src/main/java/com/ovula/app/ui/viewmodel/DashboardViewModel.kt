package com.ovula.app.ui.viewmodel

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ovula.app.data.api.RetrofitClient
import com.ovula.app.data.model.LogResponse
import com.ovula.app.data.model.StatsResponse
import com.ovula.app.data.repository.LogsRepository
import kotlinx.coroutines.launch

class DashboardViewModel : ViewModel() {

    private val repository = LogsRepository(RetrofitClient.apiService)

    private val _stats = MutableLiveData<StatsResponse>()
    val stats: LiveData<StatsResponse> = _stats

    private val _logs = MutableLiveData<List<LogResponse>>()
    val logs: LiveData<List<LogResponse>> = _logs

    private val _loading = MutableLiveData<Boolean>()
    val loading: LiveData<Boolean> = _loading

    private val _error = MutableLiveData<String>()
    val error: LiveData<String> = _error

    fun fetchDashboardData() {
        viewModelScope.launch {
            _loading.value = true
            try {
                val statsResponse = repository.getStats()
                val logsResponse = repository.getLogs(limit = 90)

                if (statsResponse.isSuccessful && statsResponse.body() != null) {
                    _stats.value = statsResponse.body()
                }

                if (logsResponse.isSuccessful && logsResponse.body() != null) {
                    _logs.value = logsResponse.body()
                }
            } catch (e: Exception) {
                _error.value = e.message ?: "Failed to fetch dashboard data"
            } finally {
                _loading.value = false
            }
        }
    }
}
