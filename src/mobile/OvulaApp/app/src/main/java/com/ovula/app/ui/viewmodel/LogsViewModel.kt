package com.ovula.app.ui.viewmodel

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ovula.app.data.api.RetrofitClient
import com.ovula.app.data.model.LogRequest
import com.ovula.app.data.model.LogResponse
import com.ovula.app.data.repository.LogsRepository
import kotlinx.coroutines.launch

class LogsViewModel : ViewModel() {

    private val repository = LogsRepository(RetrofitClient.apiService)

    private val _logs = MutableLiveData<List<LogResponse>>()
    val logs: LiveData<List<LogResponse>> = _logs

    private val _logCreated = MutableLiveData<Boolean>()
    val logCreated: LiveData<Boolean> = _logCreated

    private val _loading = MutableLiveData<Boolean>()
    val loading: LiveData<Boolean> = _loading

    private val _error = MutableLiveData<String>()
    val error: LiveData<String> = _error

    fun fetchLogs(limit: Int = 100) {
        viewModelScope.launch {
            _loading.value = true
            try {
                val response = repository.getLogs(limit)
                if (response.isSuccessful && response.body() != null) {
                    _logs.value = response.body()
                } else {
                    _error.value = "Failed to fetch logs"
                }
            } catch (e: Exception) {
                _error.value = e.message ?: "Network error"
            } finally {
                _loading.value = false
            }
        }
    }

    fun createLog(logRequest: LogRequest) {
        viewModelScope.launch {
            _loading.value = true
            try {
                val response = repository.createLog(logRequest)
                if (response.isSuccessful) {
                    _logCreated.value = true
                } else {
                    _error.value = "Failed to create log"
                    _logCreated.value = false
                }
            } catch (e: Exception) {
                _error.value = e.message ?: "Network error"
                _logCreated.value = false
            } finally {
                _loading.value = false
            }
        }
    }

    fun deleteLog(id: Int) {
        viewModelScope.launch {
            try {
                val response = repository.deleteLog(id)
                if (response.isSuccessful) {
                    fetchLogs()
                } else {
                    _error.value = "Failed to delete log"
                }
            } catch (e: Exception) {
                _error.value = e.message ?: "Network error"
            }
        }
    }
}
