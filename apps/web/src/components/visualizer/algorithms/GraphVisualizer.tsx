import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface GraphVisualizerProps {
  data: { nodes: { id: string }[], edges: { source: string, target: string, weight?: number }[] };
  speed: number;
  stepMode: boolean;
}

export default function GraphVisualizer({ data, speed, stepMode }: GraphVisualizerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<any, any> | null>(null);
  
  useEffect(() => {
    if (!svgRef.current || data.nodes.length === 0) return;
    
    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Groups for z-indexing
    let linkGroup = svg.select<SVGGElement>("g.links");
    if (linkGroup.empty()) {
      linkGroup = svg.append("g").attr("class", "links");
    }
    let nodeGroup = svg.select<SVGGElement>("g.nodes");
    if (nodeGroup.empty()) {
      nodeGroup = svg.append("g").attr("class", "nodes");
    }

    // Process nodes to retain positions if they already exist
    const oldNodes = new Map(svg.selectAll<SVGGElement, any>(".node").data().map(d => [d.id, d]));
    const nodes = data.nodes.map(d => {
      const oldNode = oldNodes.get(d.id);
      return oldNode ? { ...oldNode, ...d } : { ...d, x: width/2, y: height/2 };
    });

    const edges = data.edges.map(d => ({ ...d }));

    // ─── LINKS ────────────────────────────────────────────────────────────
    const link = linkGroup.selectAll<SVGLineElement, any>("line")
      .data(edges, d => `${d.source.id || d.source}-${d.target.id || d.target}`);

    const enterLinks = link.enter()
      .append("line")
      .attr("stroke", "#30363d")
      .attr("stroke-width", 2);

    link.exit().remove();
    const mergedLinks = enterLinks.merge(link);

    // ─── NODES ────────────────────────────────────────────────────────────
    const node = nodeGroup.selectAll<SVGGElement, any>("g.node")
      .data(nodes, d => d.id);

    const enterNodes = node.enter()
      .append("g")
      .attr("class", "node")
      .call(d3.drag<SVGGElement, any>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    enterNodes.append("circle")
      .attr("r", 20)
      .attr("fill", "#161b22")
      .attr("stroke", "#58a6ff")
      .attr("stroke-width", 2);

    enterNodes.append("text")
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .attr("fill", "#c9d1d9")
      .text(d => d.id);

    node.exit().remove();
    const mergedNodes = enterNodes.merge(node);

    // ─── SIMULATION ───────────────────────────────────────────────────────
    if (!simulationRef.current) {
      simulationRef.current = d3.forceSimulation()
        .force("charge", d3.forceManyBody().strength(-300))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .on("tick", ticked);
    }
    
    const simulation = simulationRef.current;
    simulation.nodes(nodes);
    simulation.force("link", d3.forceLink(edges).id((d: any) => d.id).distance(100));
    simulation.alpha(0.3).restart(); // Restart simulation on update

    function ticked() {
      mergedLinks
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      mergedNodes
        .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    }

    // ─── DRAG HANDLERS ────────────────────────────────────────────────────
    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

  }, [data, speed]);

  return <svg ref={svgRef} className="w-full h-full bg-[#0d1117]"></svg>;
}
