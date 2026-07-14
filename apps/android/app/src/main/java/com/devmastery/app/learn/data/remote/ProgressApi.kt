package com.devmastery.app.learn.data.remote

import retrofit2.http.Body
import retrofit2.http.POST

data class LayerCompleteRequest(
    val topicSlug: String,
    val layer: String,
    val timeSpentSecs: Int,
)

interface ProgressApi {
    @POST("v1/progress/layer-complete")
    suspend fun markLayerComplete(@Body req: LayerCompleteRequest)
}
