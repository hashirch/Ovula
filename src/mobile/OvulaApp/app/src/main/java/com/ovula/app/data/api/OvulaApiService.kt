package com.ovula.app.data.api

import com.ovula.app.data.model.*
import okhttp3.ResponseBody
import retrofit2.Response
import retrofit2.http.*

interface OvulaApiService {

    // ── Auth ──────────────────────────────────────────────
    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<MessageResponse>

    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<TokenResponse>

    @POST("auth/verify-otp")
    suspend fun verifyOtp(@Body request: OtpRequest): Response<MessageResponse>

    @POST("auth/resend-otp")
    suspend fun resendOtp(@Body request: ResendOtpRequest): Response<MessageResponse>

    @GET("auth/me")
    suspend fun getMe(): Response<UserResponse>

    // ── Logs ──────────────────────────────────────────────
    @POST("logs/")
    suspend fun createLog(@Body request: LogRequest): Response<LogResponse>

    @GET("logs/")
    suspend fun getLogs(
        @Query("limit") limit: Int = 100,
        @Query("start_date") startDate: String? = null,
        @Query("end_date") endDate: String? = null
    ): Response<List<LogResponse>>

    @GET("logs/stats")
    suspend fun getStats(): Response<StatsResponse>

    @DELETE("logs/{id}")
    suspend fun deleteLog(@Path("id") id: Int): Response<Unit>

    // ── Insights ──────────────────────────────────────────
    @GET("insights/")
    suspend fun getInsights(): Response<InsightsResponse>

    // ── Chat ──────────────────────────────────────────────
    @POST("chat/")
    suspend fun sendMessage(@Body request: ChatRequest): Response<ChatMessage>

    @GET("chat/history")
    suspend fun getChatHistory(@Query("limit") limit: Int = 50): Response<ChatHistoryResponse>

    @DELETE("chat/history")
    suspend fun clearChatHistory(): Response<MessageResponse>

    @GET("chat/models")
    suspend fun getModels(): Response<ModelsResponse>

    // ── Speech ────────────────────────────────────────────
    @POST("speech/tts")
    suspend fun textToSpeech(@Body body: Map<String, String>): Response<ResponseBody>

    // ── Prediction ────────────────────────────────────────
    @POST("prediction/health-profile")
    suspend fun createHealthProfile(@Body request: HealthProfileRequest): Response<HealthProfileRequest>

    @GET("prediction/health-profile")
    suspend fun getHealthProfile(): Response<HealthProfileRequest>

    @POST("prediction/predict")
    suspend fun predict(): Response<PredictionResponse>
}
