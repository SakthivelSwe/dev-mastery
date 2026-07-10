package com.example.devmastery.profile.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.CreationExtras
import com.example.devmastery.DevMasteryApp
import com.example.devmastery.profile.data.remote.CertificateDto
import com.example.devmastery.profile.data.remote.ProfileRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class CertificatesState {
    object Loading : CertificatesState()
    object Empty : CertificatesState()
    data class Success(val certificates: List<CertificateDto>) : CertificatesState()
    data class Error(val message: String) : CertificatesState()
}

sealed class ClaimStatus {
    object Idle : ClaimStatus()
    object Claiming : ClaimStatus()
    data class Success(val pathTitle: String) : ClaimStatus()
    data class Error(val message: String) : ClaimStatus()
}

class CertificatesViewModel(
    private val repository: ProfileRepository
) : ViewModel() {

    private val _state = MutableStateFlow<CertificatesState>(CertificatesState.Loading)
    val state: StateFlow<CertificatesState> = _state.asStateFlow()

    private val _claim = MutableStateFlow<ClaimStatus>(ClaimStatus.Idle)
    val claim: StateFlow<ClaimStatus> = _claim.asStateFlow()

    init { load() }

    fun load() {
        _state.value = CertificatesState.Loading
        viewModelScope.launch {
            repository.getCertificates()
                .onSuccess { list ->
                    _state.value = if (list.isEmpty()) CertificatesState.Empty
                    else CertificatesState.Success(list.filterNot { it.revoked })
                }
                .onFailure {
                    _state.value = CertificatesState.Error(it.message ?: "Failed to load certificates")
                }
        }
    }

    fun claimCertificate(pathSlug: String) {
        val slug = pathSlug.trim().lowercase()
        if (slug.isBlank()) {
            _claim.value = ClaimStatus.Error("Enter a path slug.")
            return
        }
        _claim.value = ClaimStatus.Claiming
        viewModelScope.launch {
            repository.claimCertificate(slug)
                .onSuccess { cert ->
                    _claim.value = ClaimStatus.Success(cert.pathTitle)
                    // Refresh the list so the new cert shows up.
                    load()
                }
                .onFailure { err ->
                    val msg = err.message.orEmpty()
                    val friendly = when {
                        msg.contains("409") || msg.contains("400") ->
                            "This path isn't fully complete yet, or the certificate was already claimed."
                        msg.contains("404") ->
                            "No path found with that slug."
                        else -> msg.ifBlank { "Couldn't claim certificate." }
                    }
                    _claim.value = ClaimStatus.Error(friendly)
                }
        }
    }

    fun resetClaimStatus() {
        _claim.value = ClaimStatus.Idle
    }

    companion object {
        val Factory: ViewModelProvider.Factory = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>, extras: CreationExtras): T {
                val app = checkNotNull(
                    extras[ViewModelProvider.AndroidViewModelFactory.APPLICATION_KEY]
                ) as DevMasteryApp
                return CertificatesViewModel(app.container.profileRepository) as T
            }
        }
    }
}

