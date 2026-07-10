package com.example.devmastery.profile.data.remote

import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.toRequestBody

class ProfileRepository(
    private val profileApi: ProfileApi
) {
    suspend fun getProfile(): Result<ProfileDto> = try {
        Result.success(profileApi.getProfile())
    } catch (e: Exception) {
        Result.failure(e)
    }

    suspend fun updateProfile(request: UpdateProfileRequest): Result<ProfileDto> = try {
        Result.success(profileApi.updateProfile(request))
    } catch (e: Exception) {
        Result.failure(e)
    }

    /** Uploads raw image bytes as multipart form-data field "file". */
    suspend fun uploadAvatar(bytes: ByteArray, contentType: String?): Result<String> = try {
        val media = (contentType ?: "image/*").toMediaTypeOrNull()
        val body = bytes.toRequestBody(media)
        val part = MultipartBody.Part.createFormData("file", "avatar", body)
        Result.success(profileApi.uploadAvatar(part).url.orEmpty())
    } catch (e: Exception) {
        Result.failure(e)
    }

    suspend fun getCertificates(): Result<List<CertificateDto>> = try {
        Result.success(profileApi.getCertificates())
    } catch (e: Exception) {
        Result.failure(e)
    }

    suspend fun claimCertificate(pathSlug: String): Result<CertificateDto> = try {
        Result.success(profileApi.claimCertificate(pathSlug))
    } catch (e: Exception) {
        Result.failure(e)
    }
}

