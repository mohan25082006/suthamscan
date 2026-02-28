package com.suthamscan.worker.data

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.Header
import retrofit2.http.POST

data class LoginRequest(val device_id: String)
data class LoginResponse(val success: Boolean, val token: String?, val message: String?)

data class ScanRequest(val qrToken: String, val lat: Double, val long: Double, val timestamp: String)
data class ScanResponse(val success: Boolean, val validation_status: String?, val rejection_reason: String?, val fraud_score: Int?)

interface ApiService {
    @POST("api/login")
    suspend fun login(@Body request: LoginRequest): LoginResponse

    @POST("api/validate-scan")
    suspend fun validateScan(
        @Header("Authorization") token: String,
        @Body request: ScanRequest
    ): ScanResponse
}

object ApiClient {
    // For local emulator testing -> 10.0.2.2 points to host localhost
    private const val BASE_URL = "http://10.0.2.2:5000/"

    val instance: ApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ApiService::class.java)
    }
}
