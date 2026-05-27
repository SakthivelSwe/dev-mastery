import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface StackVisualizerProps {
  data: number[];
  speed: number;
  stepMode: boolean;
}

export default function StackVisualizer({ data, speed, stepMode }: StackVisualizerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // clear on update
    
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    
    const boxWidth = 100;
    const boxHeight = 40;
    const x = width / 2 - boxWidth / 2;
    const startY = height - 60; // Bottom of stack
    
    // Draw the stack container (U shape)
    svg.append("path")
      .attr("d", `M ${x - 10} 50 L ${x - 10} ${startY + 10} L ${x + boxWidth + 10} ${startY + 10} L ${x + boxWidth + 10} 50`)
      .attr("fill", "none")
      .attr("stroke", "#30363d")
      .attr("stroke-width", 4);
      
    // Draw elements
    const elements = svg.selectAll("g.element")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "element")
      .attr("transform", (d, i) => `translate(${x}, ${startY - (i + 1) * boxHeight})`);
      
    elements.append("rect")
      .attr("width", boxWidth)
      .attr("height", boxHeight - 4) // small gap
      .attr("fill", "#161b22")
      .attr("stroke", "#58a6ff")
      .attr("stroke-width", 2)
      .attr("rx", 4);
      
    elements.append("text")
      .attr("x", boxWidth / 2)
      .attr("y", boxHeight / 2)
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .attr("fill", "#c9d1d9")
      .text(d => d);

    // Pointer to top
    if (data.length > 0) {
      const topY = startY - data.length * boxHeight + boxHeight / 2;
      svg.append("text")
        .attr("x", x - 60)
        .attr("y", topY)
        .attr("dy", ".35em")
        .attr("fill", "#ff7b72")
        .attr("font-weight", "bold")
        .text("TOP →");
    }
      
  }, [data, speed, stepMode]);

  return <svg ref={svgRef} className="w-full h-full bg-[#0d1117]"></svg>;
}
