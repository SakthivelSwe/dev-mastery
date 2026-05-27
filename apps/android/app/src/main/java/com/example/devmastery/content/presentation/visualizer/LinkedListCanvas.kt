package com.example.devmastery.content.presentation.visualizer

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.TextMeasurer
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.drawText
import androidx.compose.ui.text.rememberTextMeasurer
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun LinkedListCanvas(data: List<Int>) {
    val textMeasurer = rememberTextMeasurer()

    Canvas(modifier = Modifier
        .fillMaxWidth()
        .height(150.dp)
        .background(Color(0xFF0D1117))
    ) {
        if (data.isEmpty()) return@Canvas

        val nodeWidth = 120f
        val nodeHeight = 80f
        val gap = 60f
        var startX = 50f
        val y = size.height / 2 - nodeHeight / 2

        for (i in data.indices) {
            val d = data[i]

            // Node body
            drawRoundRect(
                color = Color(0xFF161B22),
                topLeft = Offset(startX, y),
                size = Size(nodeWidth, nodeHeight),
                cornerRadius = CornerRadius(10f, 10f)
            )
            drawRoundRect(
                color = Color(0xFF30363D),
                topLeft = Offset(startX, y),
                size = Size(nodeWidth, nodeHeight),
                cornerRadius = CornerRadius(10f, 10f),
                style = Stroke(width = 4f)
            )

            // Split line
            drawLine(
                color = Color(0xFF30363D),
                start = Offset(startX + nodeWidth - 30f, y),
                end = Offset(startX + nodeWidth - 30f, y + nodeHeight),
                strokeWidth = 2f
            )

            // Text
            val textLayoutResult = textMeasurer.measure(
                text = d.toString(),
                style = TextStyle(color = Color(0xFFC9D1D9), fontSize = 16.sp)
            )
            drawText(
                textLayoutResult = textLayoutResult,
                topLeft = Offset(
                    startX + (nodeWidth - 30f) / 2 - textLayoutResult.size.width / 2,
                    y + nodeHeight / 2 - textLayoutResult.size.height / 2
                )
            )

            // Arrow to next node
            if (i < data.size - 1) {
                drawArrow(
                    start = Offset(startX + nodeWidth - 15f, y + nodeHeight / 2),
                    end = Offset(startX + nodeWidth + gap, y + nodeHeight / 2)
                )
            } else {
                val nullText = textMeasurer.measure(
                    text = "null",
                    style = TextStyle(color = Color(0xFF8B949E), fontSize = 16.sp)
                )
                drawText(
                    textLayoutResult = nullText,
                    topLeft = Offset(
                        startX + nodeWidth + 10f,
                        y + nodeHeight / 2 - nullText.size.height / 2
                    )
                )
            }

            startX += nodeWidth + gap
        }
    }
}

private fun DrawScope.drawArrow(start: Offset, end: Offset) {
    drawLine(
        color = Color(0xFF58A6FF),
        start = start,
        end = end,
        strokeWidth = 4f
    )
    val path = Path().apply {
        moveTo(end.x, end.y)
        lineTo(end.x - 15f, end.y - 10f)
        lineTo(end.x - 15f, end.y + 10f)
        close()
    }
    drawPath(path, color = Color(0xFF58A6FF))
}
