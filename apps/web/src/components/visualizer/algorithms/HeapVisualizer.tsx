import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface HeapVisualizerProps {
  data: number[];
  speed: number;
  stepMode: boolean;
}

export default function HeapVisualizer({ data, speed, stepMode }: HeapVisualizerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    
    // Create hierarchy structure from array
    // A node at index i has children at 2i+1 and 2i+2
    const buildHierarchy = (arr: number[], index: number = 0): any => {
      if (index >= arr.length) return null;
      return {
        name: arr[index].toString(),
        children: [
          buildHierarchy(arr, 2 * index + 1),
          buildHierarchy(arr, 2 * index + 2)
        ].filter(Boolean)
      };
    };

    const root = buildHierarchy(data);
    if (!root) return;

    // Tree Layout
    const treeLayout = d3.tree().size([width - 100, height - 150]);
    const rootNode = d3.hierarchy(root);
    treeLayout(rootNode);

    const g = svg.append("g").attr("transform", "translate(50, 50)");

    // Links
    g.selectAll(".link")
      .data(rootNode.links())
      .enter().append("path")
      .attr("class", "link")
      .attr("d", d3.linkVertical()
        .x((d: any) => d.x)
        .y((d: any) => d.y) as any)
      .attr("fill", "none")
      .attr("stroke", "#30363d")
      .attr("stroke-width", 2);

    // Nodes
    const node = g.selectAll(".node")
      .data(rootNode.descendants())
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", (d: any) => `translate(${d.x},${d.y})`);

    node.append("circle")
      .attr("r", 20)
      .attr("fill", "#161b22")
      .attr("stroke", "#58a6ff")
      .attr("stroke-width", 2);

    node.append("text")
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .attr("fill", "#c9d1d9")
      .text((d: any) => d.data.name);

    // Array Representation at the bottom
    const arrayY = height - 50;
    const arrayStartX = (width - (data.length * 40)) / 2;
    
    const arrayG = svg.append("g").attr("transform", `translate(${arrayStartX}, ${arrayY})`);
    
    const cells = arrayG.selectAll("g.cell")
      .data(data)
      .enter()
      .append("g")
      .attr("transform", (d, i) => `translate(${i * 40}, 0)`);
      
    cells.append("rect")
      .attr("width", 40)
      .attr("height", 40)
      .attr("fill", "#161b22")
      .attr("stroke", "#30363d");
      
    cells.append("text")
      .attr("x", 20)
      .attr("y", 20)
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .attr("fill", "#c9d1d9")
      .text(d => d);
      
  }, [data, speed, stepMode]);

  return <svg ref={svgRef} className="w-full h-full bg-[#0d1117]"></svg>;
}
