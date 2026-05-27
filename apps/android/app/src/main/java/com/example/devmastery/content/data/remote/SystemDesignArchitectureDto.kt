package com.example.devmastery.content.data.remote

import kotlinx.serialization.Serializable

@Serializable
data class SystemDesignArchitectureDto(
    val id: String,
    val title: String,
    val slug: String,
    val description: String,
    val difficulty: String,
    val mermaidDiagram: String
)
