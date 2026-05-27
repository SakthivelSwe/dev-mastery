import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface LinkedListVisualizerProps {
  data: number[];
  speed: number;
  stepMode: boolean;
}

export default function LinkedListVisualizer({ data, speed, stepMode }: LinkedListVisualizerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // clear on update
    
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    
    const nodeWidth = 60;
    const nodeHeight = 40;
    const nodeGap = 40;
    const startX = 50;
    const y = height / 2 - nodeHeight / 2;
    
    // Create nodes
    const nodes = svg.selectAll("g.node")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d, i) => `translate(${startX + i * (nodeWidth + nodeGap)}, ${y})`);
      
    // Node background
    nodes.append("rect")
      .attr("width", nodeWidth)
      .attr("height", nodeHeight)
      .attr("rx", 5)
      .attr("fill", "#161b22")
      .attr("stroke", "#30363d")
      .attr("stroke-width", 2);
      
    // Split line for next pointer
    nodes.append("line")
      .attr("x1", nodeWidth - 20)
      .attr("y1", 0)
      .attr("x2", nodeWidth - 20)
      .attr("y2", nodeHeight)
      .attr("stroke", "#30363d")
      .attr("stroke-width", 1);
      
    // Text value
    nodes.append("text")
      .attr("x", (nodeWidth - 20) / 2)
      .attr("y", nodeHeight / 2)
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .attr("fill", "#c9d1d9")
      .text(d => d);
      
    // Arrows
    // Define marker
    svg.append("defs").append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 8)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#58a6ff");

    const links = data.slice(0, -1);
    svg.selectAll("path.link")
      .data(links)
      .enter()
      .append("line")
      .attr("class", "link")
      .attr("x1", (d, i) => startX + i * (nodeWidth + nodeGap) + nodeWidth - 10)
      .attr("y1", y + nodeHeight / 2)
      .attr("x2", (d, i) => startX + (i + 1) * (nodeWidth + nodeGap))
      .attr("y2", y + nodeHeight / 2)
      .attr("stroke", "#58a6ff")
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#arrow)");

    // Add Null pointer for last node
    svg.append("text")
      .attr("x", startX + data.length * (nodeWidth + nodeGap) - 20)
      .attr("y", y + nodeHeight / 2)
      .attr("dy", ".35em")
      .attr("fill", "#8b949e")
      .text("null");
      
  }, [data, speed, stepMode]);

  return <svg ref={svgRef} className="w-full h-full bg-[#0d1117]"></svg>;
}
