package com.ovula.app.data.model

import com.google.gson.annotations.SerializedName

// Auth Models
data class LoginRequest(
    val email: String,
    val password: String
)

data class RegisterRequest(
    val name: String,
    val email: String,
    val password: String
)

data class TokenResponse(
    @SerializedName("access_token") val accessToken: String,
    @SerializedName("token_type") val tokenType: String
)

data class UserResponse(
    val id: Int,
    val name: String,
    val email: String,
    @SerializedName("is_verified") val isVerified: Boolean,
    @SerializedName("created_at") val createdAt: String
)

data class OtpRequest(
    val email: String,
    @SerializedName("otp_code") val otpCode: String
)

data class ResendOtpRequest(
    val email: String
)

data class MessageResponse(
    val message: String
)

// Log Models
data class LogRequest(
    val date: String,
    @SerializedName("period_status") val periodStatus: String = "none",
    val mood: Int = 3,
    val acne: Int = 0,
    val hairfall: Int = 0,
    val weight: Double? = null,
    @SerializedName("sleep_hours") val sleepHours: Double? = null,
    val cravings: Int = 0,
    @SerializedName("pain_level") val painLevel: Int = 0,
    val notes: String? = null
)

data class LogResponse(
    val id: Int,
    val date: String,
    @SerializedName("period_status") val periodStatus: String,
    val mood: Int,
    val acne: Int,
    val hairfall: Int,
    val weight: Double?,
    @SerializedName("sleep_hours") val sleepHours: Double?,
    val cravings: Int,
    @SerializedName("pain_level") val painLevel: Int,
    val notes: String?,
    @SerializedName("user_id") val userId: Int,
    @SerializedName("created_at") val createdAt: String
)

data class StatsResponse(
    @SerializedName("total_logs") val totalLogs: Int,
    @SerializedName("avg_mood") val avgMood: Double?,
    @SerializedName("avg_sleep") val avgSleep: Double?,
    @SerializedName("period_days") val periodDays: Int,
    @SerializedName("days_since_period") val daysSincePeriod: Int?,
    @SerializedName("latest_log") val latestLog: LogResponse?
)

// Insights Models
data class InsightsResponse(
    @SerializedName("total_logs") val totalLogs: Int,
    @SerializedName("avg_mood") val avgMood: Double,
    @SerializedName("avg_sleep") val avgSleep: Double,
    @SerializedName("avg_pain") val avgPain: Double,
    @SerializedName("avg_acne") val avgAcne: Double,
    @SerializedName("avg_hairfall") val avgHairfall: Double,
    @SerializedName("period_frequency") val periodFrequency: Int,
    val recommendations: List<String>
)

// Chat Models
data class ChatRequest(
    val message: String,
    @SerializedName("model_type") val modelType: String? = null,
    @SerializedName("translate_to_urdu") val translateToUrdu: Boolean = false
)

data class ChatMessage(
    val id: Int,
    val message: String,
    val response: String,
    @SerializedName("model_used") val modelUsed: String?,
    @SerializedName("response_time") val responseTime: Double?,
    @SerializedName("created_at") val createdAt: String
)

data class ChatHistoryResponse(
    val messages: List<ChatMessage>,
    val total: Int
)

data class ModelInfo(
    val type: String,
    val name: String,
    val available: Boolean,
    val description: String
)

data class ModelsResponse(
    @SerializedName("current_model") val currentModel: String,
    @SerializedName("available_models") val availableModels: List<ModelInfo>
)

// Prediction Models
data class HealthProfileRequest(
    @SerializedName("age_group") val ageGroup: Int = 2,
    @SerializedName("is_overweight") val isOverweight: Int = 0,
    @SerializedName("has_weight_fluctuation") val hasWeightFluctuation: Int = 0,
    @SerializedName("has_irregular_periods") val hasIrregularPeriods: Int = 0,
    @SerializedName("typical_period_length") val typicalPeriodLength: Int = 5,
    @SerializedName("typical_cycle_length") val typicalCycleLength: Int = 28,
    @SerializedName("difficulty_conceiving") val difficultyConceiving: Int = 0,
    @SerializedName("hair_chin") val hairChin: Int = 0,
    @SerializedName("hair_cheeks") val hairCheeks: Int = 0,
    @SerializedName("hair_breasts") val hairBreasts: Int = 0,
    @SerializedName("hair_upper_lips") val hairUpperLips: Int = 0,
    @SerializedName("hair_arms") val hairArms: Int = 0,
    @SerializedName("hair_thighs") val hairThighs: Int = 0,
    @SerializedName("has_acne") val hasAcne: Int = 0,
    @SerializedName("has_hair_loss") val hasHairLoss: Int = 0,
    @SerializedName("has_dark_patches") val hasDarkPatches: Int = 0,
    @SerializedName("always_tired") val alwaysTired: Int = 0,
    @SerializedName("frequent_mood_swings") val frequentMoodSwings: Int = 0,
    @SerializedName("exercise_per_week") val exercisePerWeek: Int = 0,
    @SerializedName("eat_outside_per_week") val eatOutsidePerWeek: Int = 0,
    @SerializedName("consumes_canned_food") val consumesCannedFood: Int = 0
)

data class PredictionResponse(
    val id: Int,
    val prediction: String,
    @SerializedName("risk_score") val riskScore: Double,
    val confidence: Double,
    val recommendations: List<String>?,
    @SerializedName("created_at") val createdAt: String
)
