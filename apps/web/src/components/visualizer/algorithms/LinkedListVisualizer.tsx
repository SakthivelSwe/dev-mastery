import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface LinkedListVisualizerProps {
  data: number[];
  speed: number;
  stepMode: boolean;
}

export default function LinkedListVisualizer({ data, speed, stepMode }: LinkedListVisualizerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    
    const nodeWidth = 60;
    const nodeHeight = 40;
    const nodeGap = 40;
    const startX = 50;
    const y = height / 2 - nodeHeight / 2;
    const transitionDuration = 700 / speed;
    
    // Create defs if they don't exist
    if (svg.select("defs").empty()) {
      const defs = svg.append("defs");
      defs.append("marker")
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
    }

    // Map data
    const dataObjects = data.map((d, i) => ({ id: `${d}-${i}`, value: d, index: i }));

    // ─── NODES ────────────────────────────────────────────────────────────
    let nodesGroup = svg.select<SVGGElement>("g.nodes-group");
    if (nodesGroup.empty()) {
      nodesGroup = svg.append("g").attr("class", "nodes-group");
    }

    const nodes = nodesGroup.selectAll<SVGGElement, any>("g.node")
      .data(dataObjects, d => d.id);

    const enterNodes = nodes.enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${startX + d.index * (nodeWidth + nodeGap)}, ${y - 50})`)
      .style("opacity", 0);

    enterNodes.append("rect")
      .attr("width", nodeWidth)
      .attr("height", nodeHeight)
      .attr("rx", 5)
      .attr("fill", "#161b22")
      .attr("stroke", "#30363d")
      .attr("stroke-width", 2);

    // split line for pointer
    enterNodes.append("line")
      .attr("x1", nodeWidth - 20)
      .attr("y1", 0)
      .attr("x2", nodeWidth - 20)
      .attr("y2", nodeHeight)
      .attr("stroke", "#30363d")
      .attr("stroke-width", 1);

    enterNodes.append("text")
      .attr("x", (nodeWidth - 20) / 2)
      .attr("y", nodeHeight / 2)
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .attr("fill", "#c9d1d9")
      .text(d => d.value);

    const mergedNodes = enterNodes.merge(nodes);
    mergedNodes.transition()
      .duration(transitionDuration)
      .attr("transform", (d) => `translate(${startX + d.index * (nodeWidth + nodeGap)}, ${y})`)
      .style("opacity", 1);

    nodes.exit()
      .transition()
      .duration(transitionDuration)
      .attr("transform", (d: any) => `translate(${startX + d.index * (nodeWidth + nodeGap)}, ${y + 50})`)
      .style("opacity", 0)
      .remove();

    // ─── LINKS (ARROWS) ───────────────────────────────────────────────────
    let linksGroup = svg.select<SVGGElement>("g.links-group");
    if (linksGroup.empty()) {
      // make sure links are behind nodes
      linksGroup = svg.insert("g", "g.nodes-group").attr("class", "links-group");
    }

    const linkData = dataObjects.slice(0, -1);
    const links = linksGroup.selectAll<SVGLineElement, any>("line.link")
      .data(linkData, d => d.id);

    const enterLinks = links.enter()
      .append("line")
      .attr("class", "link")
      .attr("stroke", "#58a6ff")
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#arrow)")
      .style("opacity", 0)
      .attr("x1", (d) => startX + d.index * (nodeWidth + nodeGap) + nodeWidth - 10)
      .attr("y1", y + nodeHeight / 2)
      .attr("x2", (d) => startX + d.index * (nodeWidth + nodeGap) + nodeWidth - 10) // Start collapsed
      .attr("y2", y + nodeHeight / 2);

    const mergedLinks = enterLinks.merge(links);
    mergedLinks.transition()
      .duration(transitionDuration)
      .style("opacity", 1)
      .attr("x1", (d) => startX + d.index * (nodeWidth + nodeGap) + nodeWidth - 10)
      .attr("y1", y + nodeHeight / 2)
      .attr("x2", (d) => startX + (d.index + 1) * (nodeWidth + nodeGap))
      .attr("y2", y + nodeHeight / 2);

    links.exit()
      .transition()
      .duration(transitionDuration)
      .style("opacity", 0)
      .remove();

    // ─── NULL POINTER ─────────────────────────────────────────────────────
    let nullText = svg.select<SVGTextElement>("text.null-pointer");
    if (nullText.empty()) {
      nullText = svg.append("text")
        .attr("class", "null-pointer")
        .attr("dy", ".35em")
        .attr("fill", "#8b949e")
        .text("null");
    }

    if (data.length > 0) {
      nullText.transition()
        .duration(transitionDuration)
        .style("opacity", 1)
        .attr("x", startX + data.length * (nodeWidth + nodeGap) - 20)
        .attr("y", y + nodeHeight / 2);
    } else {
      nullText.transition().duration(transitionDuration).style("opacity", 0);
    }

  }, [data, speed]);

  return <svg ref={svgRef} className="w-full h-full bg-[#0d1117]"></svg>;
}
