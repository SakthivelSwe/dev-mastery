package com.example.devmastery.profile.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.CreationExtras
import com.example.devmastery.DevMasteryApp
import com.example.devmastery.profile.data.remote.ProfileDto
import com.example.devmastery.profile.data.remote.ProfileRepository
import com.example.devmastery.profile.data.remote.UpdateProfileRequest
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class ProfileEditUiState(
    val loading: Boolean = true,
    val saving: Boolean = false,
    val uploadingAvatar: Boolean = false,
    val profile: ProfileDto? = null,
    val bio: String = "",
    val githubUrl: String = "",
    val linkedinUrl: String = "",
    val timezone: String = "",
    val message: String? = null,
    val saved: Boolean = false
)

class ProfileEditViewModel(
    private val repository: ProfileRepository
) : ViewModel() {

    private val _state = MutableStateFlow(ProfileEditUiState())
    val state: StateFlow<ProfileEditUiState> = _state.asStateFlow()

    init { load() }

    fun load() {
        _state.value = _state.value.copy(loading = true, message = null)
        viewModelScope.launch {
            repository.getProfile()
                .onSuccess { p ->
                    _state.value = _state.value.copy(
                        loading = false,
                        profile = p,
                        bio = p.bio.orEmpty(),
                        githubUrl = p.githubUrl.orEmpty(),
                        linkedinUrl = p.linkedinUrl.orEmpty(),
                        timezone = p.timezone.orEmpty()
                    )
                }
                .onFailure {
                    _state.value = _state.value.copy(loading = false, message = it.message ?: "Failed to load profile")
                }
        }
    }

    fun onBio(v: String) { _state.value = _state.value.copy(bio = v, saved = false) }
    fun onGithub(v: String) { _state.value = _state.value.copy(githubUrl = v, saved = false) }
    fun onLinkedin(v: String) { _state.value = _state.value.copy(linkedinUrl = v, saved = false) }
    fun onTimezone(v: String) { _state.value = _state.value.copy(timezone = v, saved = false) }

    fun save() {
        val s = _state.value
        if (s.saving) return
        _state.value = s.copy(saving = true, message = null, saved = false)
        viewModelScope.launch {
            repository.updateProfile(
                UpdateProfileRequest(
                    bio = s.bio.ifBlank { null },
                    githubUrl = s.githubUrl.ifBlank { null },
                    linkedinUrl = s.linkedinUrl.ifBlank { null },
                    timezone = s.timezone.ifBlank { null }
                )
            ).onSuccess { updated ->
                _state.value = _state.value.copy(saving = false, profile = updated, saved = true, message = "Profile saved")
            }.onFailure {
                _state.value = _state.value.copy(saving = false, message = it.message ?: "Failed to save profile")
            }
        }
    }

    fun uploadAvatar(bytes: ByteArray, contentType: String?) {
        _state.value = _state.value.copy(uploadingAvatar = true, message = null)
        viewModelScope.launch {
            repository.uploadAvatar(bytes, contentType)
                .onSuccess { url ->
                    val updated = _state.value.profile?.copy(avatarUrl = url)
                    _state.value = _state.value.copy(uploadingAvatar = false, profile = updated, message = "Avatar updated")
                }
                .onFailure {
                    _state.value = _state.value.copy(uploadingAvatar = false, message = it.message ?: "Avatar upload failed")
                }
        }
    }

    companion object {
        val Factory: ViewModelProvider.Factory = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>, extras: CreationExtras): T {
                val app = checkNotNull(
                    extras[ViewModelProvider.AndroidViewModelFactory.APPLICATION_KEY]
                ) as DevMasteryApp
                return ProfileEditViewModel(app.container.profileRepository) as T
            }
        }
    }
}

