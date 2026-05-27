import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface DPVisualizerProps {
  data: number[][]; // DP table grid
  speed: number;
  stepMode: boolean;
}

export default function DPVisualizer({ data, speed, stepMode }: DPVisualizerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    const rows = data.length;
    const cols = data[0].length;
    
    const cellWidth = 50;
    const cellHeight = 50;
    
    const startX = width / 2 - (cols * cellWidth) / 2;
    const startY = height / 2 - (rows * cellHeight) / 2;
    
    const gridG = svg.append("g").attr("transform", `translate(${startX}, ${startY})`);
    
    // Draw cells
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cellG = gridG.append("g")
          .attr("transform", `translate(${c * cellWidth}, ${r * cellHeight})`);
          
        cellG.append("rect")
          .attr("width", cellWidth)
          .attr("height", cellHeight)
          .attr("fill", "#161b22")
          .attr("stroke", "#30363d")
          .attr("stroke-width", 1);
          
        cellG.append("text")
          .attr("x", cellWidth / 2)
          .attr("y", cellHeight / 2)
          .attr("dy", ".35em")
          .attr("text-anchor", "middle")
          .attr("fill", "#c9d1d9")
          .text(data[r][c]);
      }
    }

    // Example arrow from previous state
    if (rows > 1 && cols > 1) {
       gridG.append("path")
         .attr("d", `M ${cellWidth / 2} ${cellHeight / 2} Q ${cellWidth} ${cellHeight * 1.5} ${cellWidth * 1.5} ${cellHeight * 1.5}`)
         .attr("fill", "none")
         .attr("stroke", "#58a6ff")
         .attr("stroke-width", 2)
         .attr("stroke-dasharray", "4")
         .attr("marker-end", "url(#arrow)");
    }
  }, [data, speed, stepMode]);

  return <svg ref={svgRef} className="w-full h-full bg-[#0d1117]"></svg>;
}
