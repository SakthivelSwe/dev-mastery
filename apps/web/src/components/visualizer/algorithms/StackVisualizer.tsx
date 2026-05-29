import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface StackVisualizerProps {
  data: number[];
  speed: number;
  stepMode: boolean;
}

export default function StackVisualizer({ data, speed, stepMode }: StackVisualizerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const prevDataRef = useRef<number[]>([]);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    
    const boxWidth = 100;
    const boxHeight = 40;
    const x = width / 2 - boxWidth / 2;
    const startY = height - 60; // Bottom of stack
    const transitionDuration = 700 / speed;
    
    // Draw the container only once
    if (svg.select("path.container").empty()) {
      svg.append("path")
        .attr("class", "container")
        .attr("d", `M ${x - 10} 50 L ${x - 10} ${startY + 10} L ${x + boxWidth + 10} ${startY + 10} L ${x + boxWidth + 10} 50`)
        .attr("fill", "none")
        .attr("stroke", "#30363d")
        .attr("stroke-width", 4);
    }
      
    // Create a group for elements to handle z-index easily
    let elementsGroup = svg.select<SVGGElement>("g.elements-group");
    if (elementsGroup.empty()) {
      elementsGroup = svg.append("g").attr("class", "elements-group");
    }

    // Map data to objects so D3 can track by ID (value)
    // To handle duplicate values, we append index
    const dataObjects = data.map((d, i) => ({ id: `${d}-${i}`, value: d, index: i }));

    // Data join
    const elements = elementsGroup.selectAll<SVGGElement, any>("g.element")
      .data(dataObjects, d => d.id);
      
    // ─── ENTER ────────────────────────────────────────────────────────────
    const enterElements = elements.enter()
      .append("g")
      .attr("class", "element")
      // Start high up above the container
      .attr("transform", (d, i) => `translate(${x}, -50)`)
      .style("opacity", 0);
      
    enterElements.append("rect")
      .attr("width", boxWidth)
      .attr("height", boxHeight - 4) // small gap
      .attr("fill", "#161b22")
      .attr("stroke", "#58a6ff")
      .attr("stroke-width", 2)
      .attr("rx", 4);
      
    enterElements.append("text")
      .attr("x", boxWidth / 2)
      .attr("y", boxHeight / 2)
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .attr("fill", "#c9d1d9")
      .text(d => d.value);

    // ─── UPDATE ───────────────────────────────────────────────────────────
    // Animate to their correct stack positions
    const mergeElements = enterElements.merge(elements);
    
    mergeElements.transition()
      .duration(transitionDuration)
      .ease(d3.easeBounceOut)
      .attr("transform", (d) => `translate(${x}, ${startY - (d.index + 1) * boxHeight})`)
      .style("opacity", 1);

    // ─── EXIT ─────────────────────────────────────────────────────────────
    // Animate popping out
    elements.exit()
      .transition()
      .duration(transitionDuration)
      .ease(d3.easeCubicIn)
      .attr("transform", `translate(${x}, -50)`)
      .style("opacity", 0)
      .remove();

    // ─── POINTER ──────────────────────────────────────────────────────────
    let pointerGroup = svg.select<SVGGElement>("g.pointer");
    if (pointerGroup.empty()) {
      pointerGroup = svg.append("g").attr("class", "pointer");
      pointerGroup.append("text")
        .attr("class", "pointer-text")
        .attr("dy", ".35em")
        .attr("fill", "#ff7b72")
        .attr("font-weight", "bold")
        .text("TOP →");
    }

    if (data.length > 0) {
      const topY = startY - data.length * boxHeight + boxHeight / 2;
      pointerGroup.transition()
        .duration(transitionDuration)
        .attr("transform", `translate(${x - 60}, ${topY})`)
        .style("opacity", 1);
    } else {
      pointerGroup.transition().duration(transitionDuration).style("opacity", 0);
    }

    prevDataRef.current = data;
  }, [data, speed]);

  return <svg ref={svgRef} className="w-full h-full bg-[#0d1117]"></svg>;
}
