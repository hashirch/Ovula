package com.ovula.app.data.repository

import com.ovula.app.data.api.OvulaApiService
import com.ovula.app.data.model.ChatHistoryResponse
import com.ovula.app.data.model.ChatMessage
import com.ovula.app.data.model.ChatRequest
import com.ovula.app.data.model.MessageResponse
import com.ovula.app.data.model.ModelsResponse
import retrofit2.Response

class ChatRepository(private val apiService: OvulaApiService) {

    suspend fun sendMessage(chatRequest: ChatRequest): Response<ChatMessage> {
        return apiService.sendMessage(chatRequest)
    }

    suspend fun getChatHistory(limit: Int = 50): Response<ChatHistoryResponse> {
        return apiService.getChatHistory(limit)
    }

    suspend fun clearChatHistory(): Response<MessageResponse> {
        return apiService.clearChatHistory()
    }

    suspend fun getModels(): Response<ModelsResponse> {
        return apiService.getModels()
    }
}
