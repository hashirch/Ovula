package com.ovula.app.data.api

import android.content.Context
import com.ovula.app.BuildConfig
import com.ovula.app.utils.TokenManager
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object RetrofitClient {

    private var retrofit: Retrofit? = null
    private var apiServiceInstance: OvulaApiService? = null
    private lateinit var appContext: Context

    fun initialize(context: Context) {
        appContext = context.applicationContext
    }

    val apiService: OvulaApiService
        get() {
            if (apiServiceInstance == null) {
                apiServiceInstance = getApiService(appContext)
            }
            return apiServiceInstance!!
        }

    fun getInstance(context: Context): Retrofit {
        if (retrofit == null) {
            val tokenManager = TokenManager(context)

            val authInterceptor = Interceptor { chain ->
                val original = chain.request()
                val token = tokenManager.getToken()
                val request = if (token != null) {
                    original.newBuilder()
                        .header("Authorization", "Bearer $token")
                        .build()
                } else {
                    original
                }
                chain.proceed(request)
            }

            val loggingInterceptor = HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BODY
            }

            val client = OkHttpClient.Builder()
                .addInterceptor(authInterceptor)
                .addInterceptor(loggingInterceptor)
                .connectTimeout(30, TimeUnit.SECONDS)
                .readTimeout(60, TimeUnit.SECONDS)
                .writeTimeout(30, TimeUnit.SECONDS)
                .build()

            retrofit = Retrofit.Builder()
                .baseUrl(BuildConfig.BASE_URL)
                .client(client)
                .addConverterFactory(GsonConverterFactory.create())
                .build()
        }
        return retrofit!!
    }

    fun getApiService(context: Context): OvulaApiService {
        return getInstance(context).create(OvulaApiService::class.java)
    }

    fun reset() {
        retrofit = null
        apiServiceInstance = null
    }
}
