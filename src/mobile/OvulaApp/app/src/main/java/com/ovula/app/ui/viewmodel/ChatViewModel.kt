package com.ovula.app.ui.viewmodel

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ovula.app.data.api.RetrofitClient
import com.ovula.app.data.model.ChatMessage
import com.ovula.app.data.model.ChatRequest
import com.ovula.app.data.repository.ChatRepository
import kotlinx.coroutines.launch

class ChatViewModel : ViewModel() {

    private val repository = ChatRepository(RetrofitClient.apiService)

    private val _messages = MutableLiveData<List<ChatMessage>>()
    val messages: LiveData<List<ChatMessage>> = _messages

    private val _loading = MutableLiveData<Boolean>()
    val loading: LiveData<Boolean> = _loading

    private val _error = MutableLiveData<String>()
    val error: LiveData<String> = _error

    fun fetchChatHistory() {
        viewModelScope.launch {
            _loading.value = true
            try {
                val response = repository.getChatHistory(50)
                if (response.isSuccessful && response.body() != null) {
                    _messages.value = response.body()!!.messages.reversed()
                }
            } catch (e: Exception) {
                _error.value = e.message ?: "Failed to fetch chat history"
            } finally {
                _loading.value = false
            }
        }
    }

    fun sendMessage(message: String, translateToUrdu: Boolean = false) {
        viewModelScope.launch {
            _loading.value = true
            try {
                val request = ChatRequest(message, translateToUrdu = translateToUrdu)
                val response = repository.sendMessage(request)
                if (response.isSuccessful && response.body() != null) {
                    val currentMessages = _messages.value?.toMutableList() ?: mutableListOf()
                    currentMessages.add(response.body()!!)
                    _messages.value = currentMessages
                } else {
                    _error.value = "Failed to send message"
                }
            } catch (e: Exception) {
                _error.value = e.message ?: "Network error"
            } finally {
                _loading.value = false
            }
        }
    }

    fun clearHistory() {
        viewModelScope.launch {
            try {
                val response = repository.clearChatHistory()
                if (response.isSuccessful) {
                    _messages.value = emptyList()
                }
            } catch (e: Exception) {
                _error.value = e.message ?: "Failed to clear history"
            }
        }
    }
}
