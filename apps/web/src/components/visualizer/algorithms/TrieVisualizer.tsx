import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface TrieVisualizerProps {
  data: string[];
  speed: number;
  stepMode: boolean;
}

export default function TrieVisualizer({ data, speed, stepMode }: TrieVisualizerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const transitionDuration = 700 / speed;

    // Build Trie
    // We need consistent IDs for nodes to animate properly.
    // ID will be the path from root. e.g., "root-a-p-p"
    const root: any = { id: 'root', name: 'root', children: [], isEndOfWord: false, path: 'root' };
    
    for (const word of data) {
      if (!word) continue;
      let current = root;
      let path = 'root';
      for (let i = 0; i < word.length; i++) {
        const char = word[i];
        path += `-${char}`;
        let child = current.children.find((c: any) => c.name === char);
        if (!child) {
          child = { id: path, name: char, children: [], isEndOfWord: false, path: path };
          current.children.push(child);
        }
        if (i === word.length - 1) {
          child.isEndOfWord = true;
        }
        current = child;
      }
    }

    let g = svg.select<SVGGElement>("g.trie-group");
    if (g.empty()) {
      g = svg.append("g").attr("class", "trie-group").attr("transform", "translate(50, 50)");
    }

    const treeLayout = d3.tree().size([width - 100, height - 100]);
    const rootNode = d3.hierarchy(root);
    treeLayout(rootNode);

    // ─── LINKS ────────────────────────────────────────────────────────────
    const linkData = rootNode.links();
    const links = g.selectAll<SVGPathElement, any>("path.link")
      .data(linkData, (d: any) => `${d.source.data.id}->${d.target.data.id}`);

    const enterLinks = links.enter()
      .append("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", "#30363d")
      .attr("stroke-width", 2)
      .style("opacity", 0)
      .attr("d", d3.linkVertical()
        .x((d: any) => d.source.x)
        .y((d: any) => d.source.y) as any);

    const mergedLinks = enterLinks.merge(links);
    mergedLinks.transition()
      .duration(transitionDuration)
      .style("opacity", 1)
      .attr("d", d3.linkVertical()
        .x((d: any) => d.x)
        .y((d: any) => d.y) as any);

    links.exit()
      .transition()
      .duration(transitionDuration)
      .style("opacity", 0)
      .remove();

    // ─── NODES ────────────────────────────────────────────────────────────
    const nodes = g.selectAll<SVGGElement, any>("g.node")
      .data(rootNode.descendants(), (d: any) => d.data.id);

    const enterNodes = nodes.enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d: any) => `translate(${d.parent ? d.parent.x : width/2},${d.parent ? d.parent.y : 0})`)
      .style("opacity", 0);

    enterNodes.append("circle")
      .attr("r", 20)
      .attr("fill", (d: any) => d.data.isEndOfWord ? "#6DB33F" : "#161b22")
      .attr("stroke", (d: any) => d.data.name === 'root' ? "#e3b341" : "#58a6ff")
      .attr("stroke-width", 2);

    enterNodes.append("text")
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .attr("fill", (d: any) => d.data.isEndOfWord ? "#000" : "#c9d1d9")
      .text((d: any) => d.data.name === 'root' ? '*' : d.data.name);

    const mergedNodes = enterNodes.merge(nodes);
    mergedNodes.transition()
      .duration(transitionDuration)
      .attr("transform", (d: any) => `translate(${d.x},${d.y})`)
      .style("opacity", 1);
      
    // Update node styling dynamically (in case a node becomes an end-of-word or stops being one)
    mergedNodes.select("circle")
      .transition()
      .duration(transitionDuration)
      .attr("fill", (d: any) => d.data.isEndOfWord ? "#6DB33F" : "#161b22");
      
    mergedNodes.select("text")
      .transition()
      .duration(transitionDuration)
      .attr("fill", (d: any) => d.data.isEndOfWord ? "#000" : "#c9d1d9");

    nodes.exit()
      .transition()
      .duration(transitionDuration)
      .style("opacity", 0)
      .attr("transform", (d: any) => `translate(${d.parent ? d.parent.x : width/2},${d.parent ? d.parent.y : 0})`)
      .remove();

  }, [data, speed]);

  return <svg ref={svgRef} className="w-full h-full bg-[#0d1117]"></svg>;
}
