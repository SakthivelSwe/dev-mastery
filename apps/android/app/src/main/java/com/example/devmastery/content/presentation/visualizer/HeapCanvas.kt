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
import kotlin.math.pow

@Composable
fun HeapCanvas(data: List<Int>) {
    val textMeasurer = rememberTextMeasurer()

    Canvas(modifier = Modifier
        .fillMaxWidth()
        .height(300.dp)
        .background(Color(0xFF0D1117))
    ) {
        if (data.isEmpty()) return@Canvas

        val levels = (Math.log((data.size).toDouble()) / Math.log(2.0)).toInt() + 1
        val radius = 30f
        val levelHeight = 80f

        val positions = mutableMapOf<Int, Offset>()

        // 1. Draw Links (need positions first)
        for (i in data.indices) {
            val level = (Math.log((i + 1).toDouble()) / Math.log(2.0)).toInt()
            val nodesInLevel = 2.0.pow(level).toInt()
            val indexInLevel = i - (nodesInLevel - 1)
            val segmentWidth = size.width / nodesInLevel

            val x = segmentWidth * indexInLevel + segmentWidth / 2f
            val y = 50f + level * levelHeight
            positions[i] = Offset(x, y)

            // Draw line to parent
            if (i > 0) {
                val parentIndex = (i - 1) / 2
                val parentPos = positions[parentIndex]
                if (parentPos != null) {
                    drawLine(
                        color = Color(0xFF30363D),
                        start = parentPos,
                        end = Offset(x, y),
                        strokeWidth = 4f
                    )
                }
            }
        }

        // 2. Draw Nodes
        for (i in data.indices) {
            val pos = positions[i] ?: continue

            drawCircle(
                color = Color(0xFF161B22),
                radius = radius,
                center = pos
            )
            drawCircle(
                color = Color(0xFF58A6FF),
                radius = radius,
                center = pos,
                style = Stroke(width = 4f)
            )

            val textResult = textMeasurer.measure(
                text = data[i].toString(),
                style = TextStyle(color = Color(0xFFC9D1D9), fontSize = 14.sp)
            )
            drawText(
                textLayoutResult = textResult,
                topLeft = Offset(
                    pos.x - textResult.size.width / 2,
                    pos.y - textResult.size.height / 2
                )
            )
        }

        // 3. Draw Array Representation Below
        val arrayY = size.height - 50f
        val cellWidth = 60f
        val startX = size.width / 2 - (data.size * cellWidth) / 2f

        for (i in data.indices) {
            val x = startX + i * cellWidth
            
            drawRect(
                color = Color(0xFF161B22),
                topLeft = Offset(x, arrayY),
                size = Size(cellWidth, 40f)
            )
            drawRect(
                color = Color(0xFF30363D),
                topLeft = Offset(x, arrayY),
                size = Size(cellWidth, 40f),
                style = Stroke(width = 2f)
            )

            val textResult = textMeasurer.measure(
                text = data[i].toString(),
                style = TextStyle(color = Color(0xFFC9D1D9), fontSize = 14.sp)
            )
            drawText(
                textLayoutResult = textResult,
                topLeft = Offset(
                    x + cellWidth / 2 - textResult.size.width / 2,
                    arrayY + 20f - textResult.size.height / 2
                )
            )
        }
    }
}
