package com.example.devmastery.search.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.CreationExtras
import com.example.devmastery.DevMasteryApp
import com.example.devmastery.search.data.remote.SearchHitDto
import com.example.devmastery.search.data.remote.SearchRepository
import kotlinx.coroutines.FlowPreview
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.debounce
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.filter
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach

data class SearchUiState(
    val query: String = "",
    val loading: Boolean = false,
    val hits: List<SearchHitDto> = emptyList(),
    val error: String? = null,
    val searched: Boolean = false
)

@OptIn(FlowPreview::class)
class SearchViewModel(
    private val repository: SearchRepository
) : ViewModel() {

    private val _query = MutableStateFlow("")
    private val _state = MutableStateFlow(SearchUiState())
    val state: StateFlow<SearchUiState> = _state.asStateFlow()

    init {
        _query
            .debounce(300)                          // wait for typing to settle
            .distinctUntilChanged()
            .filter { it.trim().length >= 2 }       // require ≥ 2 chars to hit the API
            .onEach { runSearch(it.trim()) }
            .launchIn(viewModelScope)
    }

    fun onQueryChange(text: String) {
        _query.value = text
        _state.value = _state.value.copy(
            query = text,
            // Clear results immediately if the box is emptied.
            hits = if (text.isBlank()) emptyList() else _state.value.hits,
            searched = if (text.isBlank()) false else _state.value.searched,
            error = null
        )
    }

    private suspend fun runSearch(q: String) {
        _state.value = _state.value.copy(loading = true, error = null, searched = true)
        repository.search(q, limit = 25)
            .onSuccess { _state.value = _state.value.copy(loading = false, hits = it) }
            .onFailure {
                _state.value = _state.value.copy(
                    loading = false, hits = emptyList(),
                    error = it.message ?: "Search failed"
                )
            }
    }

    companion object {
        val Factory: ViewModelProvider.Factory = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>, extras: CreationExtras): T {
                val app = checkNotNull(
                    extras[ViewModelProvider.AndroidViewModelFactory.APPLICATION_KEY]
                ) as DevMasteryApp
                return SearchViewModel(app.container.searchRepository) as T
            }
        }
    }
}

