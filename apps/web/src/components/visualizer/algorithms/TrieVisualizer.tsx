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
    if (!svgRef.current || data.length === 0) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Build Trie
    const root: any = { name: 'root', children: [], isEndOfWord: false };
    
    for (const word of data) {
      let current = root;
      for (let i = 0; i < word.length; i++) {
        const char = word[i];
        let child = current.children.find((c: any) => c.name === char);
        if (!child) {
          child = { name: char, children: [], isEndOfWord: false };
          current.children.push(child);
        }
        if (i === word.length - 1) {
          child.isEndOfWord = true;
        }
        current = child;
      }
    }

    const treeLayout = d3.tree().size([width - 100, height - 100]);
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
      .attr("fill", (d: any) => d.data.isEndOfWord ? "#6DB33F" : "#161b22")
      .attr("stroke", (d: any) => d.data.name === 'root' ? "#e3b341" : "#58a6ff")
      .attr("stroke-width", 2);

    node.append("text")
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .attr("fill", (d: any) => d.data.isEndOfWord ? "#000" : "#c9d1d9")
      .text((d: any) => d.data.name === 'root' ? '*' : d.data.name);

  }, [data, speed, stepMode]);

  return <svg ref={svgRef} className="w-full h-full bg-[#0d1117]"></svg>;
}
