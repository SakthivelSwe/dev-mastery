package com.example.devmastery.profile.data.remote

import okhttp3.MultipartBody
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Multipart
import retrofit2.http.PUT
import retrofit2.http.POST
import retrofit2.http.Part
import retrofit2.http.Path

// Mirrors com.devmastery.profile.api.ProfileService.ProfileView / UpdateProfileRequest
data class ProfileDto(
    val userId: String,
    val fullName: String? = null,
    val email: String? = null,
    val bio: String? = null,
    val avatarUrl: String? = null,
    val githubUrl: String? = null,
    val linkedinUrl: String? = null,
    val timezone: String? = null
)

data class UpdateProfileRequest(
    val bio: String? = null,
    val githubUrl: String? = null,
    val linkedinUrl: String? = null,
    val timezone: String? = null
)

// POST /v1/profile/avatar returns { "url": "..." }
data class AvatarResponse(val url: String? = null)

// Mirrors com.devmastery.profile.api.CertificateService.CertificateView
data class CertificateDto(
    val id: String,
    val credentialId: String,
    val userId: String,
    val pathSlug: String,
    val pathTitle: String,
    val issuedAt: String? = null,
    val totalTopics: Int = 0,
    val avgQuizScore: Double? = null,
    val pdfUrl: String? = null,
    val revoked: Boolean = false
)

interface ProfileApi {
    @GET("profile")
    suspend fun getProfile(): ProfileDto

    @PUT("profile")
    suspend fun updateProfile(@Body request: UpdateProfileRequest): ProfileDto

    @Multipart
    @POST("profile/avatar")
    suspend fun uploadAvatar(@Part file: MultipartBody.Part): AvatarResponse

    @GET("certificates")
    suspend fun getCertificates(): List<CertificateDto>

    /** Claim a certificate for a fully-completed learning path. */
    @POST("certificates/{pathSlug}")
    suspend fun claimCertificate(@Path("pathSlug") pathSlug: String): CertificateDto
}

