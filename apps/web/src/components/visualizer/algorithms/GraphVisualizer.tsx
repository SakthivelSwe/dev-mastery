import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface GraphVisualizerProps {
  data: { nodes: { id: string }[], edges: { source: string, target: string, weight?: number }[] };
  speed: number;
  stepMode: boolean;
}

export default function GraphVisualizer({ data, speed, stepMode }: GraphVisualizerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!svgRef.current || data.nodes.length === 0) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    const simulation = d3.forceSimulation(data.nodes as any)
      .force("link", d3.forceLink(data.edges).id((d: any) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.append("g")
      .selectAll("line")
      .data(data.edges)
      .enter().append("line")
      .attr("stroke", "#30363d")
      .attr("stroke-width", 2);

    const node = svg.append("g")
      .selectAll("g")
      .data(data.nodes)
      .enter().append("g");

    node.append("circle")
      .attr("r", 20)
      .attr("fill", "#161b22")
      .attr("stroke", "#58a6ff")
      .attr("stroke-width", 2);

    node.append("text")
      .text(d => d.id)
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .attr("fill", "#c9d1d9");

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });
    
    return () => {
      simulation.stop();
    };

  }, [data, speed, stepMode]);

  return <svg ref={svgRef} className="w-full h-full bg-[#0d1117]"></svg>;
}
