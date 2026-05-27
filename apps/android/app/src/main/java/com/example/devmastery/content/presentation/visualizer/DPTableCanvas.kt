package com.example.devmastery.content.presentation.visualizer

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.drawText
import androidx.compose.ui.text.rememberTextMeasurer
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun DPTableCanvas(data: List<List<Int>>) {
    val textMeasurer = rememberTextMeasurer()

    Canvas(modifier = Modifier
        .fillMaxWidth()
        .height(300.dp)
        .background(Color(0xFF0D1117))
    ) {
        if (data.isEmpty() || data[0].isEmpty()) return@Canvas

        val rows = data.size
        val cols = data[0].size
        val cellWidth = 60f
        val cellHeight = 60f

        val startX = size.width / 2 - (cols * cellWidth) / 2f
        val startY = size.height / 2 - (rows * cellHeight) / 2f

        for (r in 0 until rows) {
            for (c in 0 until cols) {
                val x = startX + c * cellWidth
                val y = startY + r * cellHeight

                drawRect(
                    color = Color(0xFF161B22),
                    topLeft = Offset(x, y),
                    size = Size(cellWidth, cellHeight)
                )
                drawRect(
                    color = Color(0xFF30363D),
                    topLeft = Offset(x, y),
                    size = Size(cellWidth, cellHeight),
                    style = Stroke(width = 2f)
                )

                val textResult = textMeasurer.measure(
                    text = data[r][c].toString(),
                    style = TextStyle(color = Color(0xFFC9D1D9), fontSize = 16.sp)
                )
                drawText(
                    textLayoutResult = textResult,
                    topLeft = Offset(
                        x + cellWidth / 2 - textResult.size.width / 2,
                        y + cellHeight / 2 - textResult.size.height / 2
                    )
                )
            }
        }
    }
}
