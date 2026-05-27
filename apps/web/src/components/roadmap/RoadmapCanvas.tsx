'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useRouter } from 'next/navigation';

export interface TopicRoadmapDto {
  slug: string;
  title: string;
  estimatedMins: number;
  completed: boolean;
  hasVisualizer: boolean;
  hasCodeLab: boolean;
}

export interface LevelRoadmapDto {
  level: number;
  label: string;
  topicCount: number;
  completedCount: number;
  topics: TopicRoadmapDto[];
}

export interface PathRoadmapResponse {
  path: {
    slug: string;
    title: string;
    totalTopics: number;
  };
  levels: LevelRoadmapDto[];
}

interface RoadmapCanvasProps {
  data: PathRoadmapResponse;
}

interface NodeData {
  id: string;
  title: string;
  level: number;
  completed: boolean;
  x: number;
  y: number;
}

interface LinkData {
  source: string;
  target: string;
}

export const RoadmapCanvas: React.FC<RoadmapCanvasProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [links, setLinks] = useState<LinkData[]>([]);

  useEffect(() => {
    // Generate nodes based on levels (swimlanes)
    const newNodes: NodeData[] = [];
    const newLinks: LinkData[] = [];
    const levelSpacing = 180;
    const nodeSpacing = 220;

    let previousLevelNodes: NodeData[] = [];

    data.levels.forEach((lvl, i) => {
      const startX = 100;
      const y = (i + 1) * levelSpacing;
      
      const currentLevelNodes: NodeData[] = [];

      lvl.topics.forEach((topic, j) => {
        const x = startX + j * nodeSpacing;
        const node = {
          id: topic.slug,
          title: topic.title,
          level: lvl.level,
          completed: topic.completed,
          x,
          y
        };
        newNodes.push(node);
        currentLevelNodes.push(node);
      });

      // Simple heuristic: connect first node of this level to last node of previous level
      if (previousLevelNodes.length > 0 && currentLevelNodes.length > 0) {
        newLinks.push({
          source: previousLevelNodes[previousLevelNodes.length - 1].id,
          target: currentLevelNodes[0].id
        });
      }

      // Connect nodes sequentially within the same level
      for (let k = 0; k < currentLevelNodes.length - 1; k++) {
        newLinks.push({
          source: currentLevelNodes[k].id,
          target: currentLevelNodes[k+1].id
        });
      }

      previousLevelNodes = currentLevelNodes;
    });

    setNodes(newNodes);
    setLinks(newLinks);
  }, [data]);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = containerRef.current?.clientWidth || 800;
    const height = (data.levels.length + 1) * 180;

    svg
      .attr('width', width)
      .attr('height', height)
      .style('background', 'transparent');

    const g = svg.append('g');

    // Zoom and pan
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 2])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });
    svg.call(zoom);

    // Define arrow marker
    svg.append("defs").append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 10)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("fill", "#6B7280")
      .attr("d", "M0,-5L10,0L0,5");

    // Draw links (paths)
    g.selectAll(".link")
      .data(links)
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", (d) => {
        const sourceNode = nodes.find(n => n.id === d.source);
        const targetNode = nodes.find(n => n.id === d.target);
        if (!sourceNode || !targetNode) return "";
        
        // Custom path logic for better aesthetics (curves)
        const dx = targetNode.x - sourceNode.x;
        const dy = targetNode.y - sourceNode.y;
        const dr = Math.sqrt(dx * dx + dy * dy) * 1.5; 
        
        if (sourceNode.y === targetNode.y) {
           return `M${sourceNode.x},${sourceNode.y} L${targetNode.x},${targetNode.y}`;
        } else {
           return `M${sourceNode.x},${sourceNode.y} C${sourceNode.x + dx/2},${sourceNode.y} ${targetNode.x - dx/2},${targetNode.y} ${targetNode.x},${targetNode.y}`;
        }
      })
      .attr("fill", "none")
      .attr("stroke", "#6B7280")
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#arrow)");

    // Draw nodes
    const nodeGroup = g.selectAll(".node")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.x},${d.y})`)
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        router.push(`/learn/${data.path.slug}/${d.id}`);
      });

    // Node rects
    const rectWidth = 160;
    const rectHeight = 60;
    
    nodeGroup.append("rect")
      .attr("width", rectWidth)
      .attr("height", rectHeight)
      .attr("x", -rectWidth/2)
      .attr("y", -rectHeight/2)
      .attr("rx", 8)
      .attr("fill", d => d.completed ? "#6DB33F" : "#21262D")
      .attr("stroke", d => d.completed ? "#6DB33F" : "#30363D")
      .attr("stroke-width", 2)
      .on("mouseover", function() {
        d3.select(this).attr("stroke", "#58a6ff").attr("stroke-width", 3);
      })
      .on("mouseout", function(event, d) {
        d3.select(this).attr("stroke", d.completed ? "#6DB33F" : "#30363D").attr("stroke-width", 2);
      });

    // Node text
    nodeGroup.append("text")
      .text(d => d.title.length > 20 ? d.title.substring(0, 17) + "..." : d.title)
      .attr("text-anchor", "middle")
      .attr("y", 5)
      .attr("fill", d => d.completed ? "#000000" : "#ffffff")
      .style("font-size", "14px")
      .style("font-family", "Inter, sans-serif")
      .style("font-weight", d => d.completed ? "600" : "500");

    // Level swimlane labels
    data.levels.forEach((lvl, i) => {
        const y = (i + 1) * 180;
        svg.append("text")
          .attr("x", 20)
          .attr("y", y)
          .text(`Level ${lvl.level}: ${lvl.label}`)
          .attr("fill", "#8b949e")
          .style("font-size", "12px")
          .style("font-weight", "bold")
          .style("text-transform", "uppercase")
          .style("writing-mode", "vertical-rl")
          .style("transform", "rotate(180deg)");
          
        svg.append("line")
          .attr("x1", 50)
          .attr("y1", y)
          .attr("x2", width)
          .attr("y2", y)
          .attr("stroke", "#30363D")
          .attr("stroke-width", 1)
          .attr("stroke-dasharray", "4,4")
          .style("opacity", 0.5);
    });

  }, [nodes, links, data, router]);

  const exportSvg = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${data.path.slug}-roadmap.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full h-full relative" ref={containerRef}>
      <button 
        onClick={exportSvg}
        className="absolute top-4 right-4 px-4 py-2 bg-[#21262D] border border-[#30363D] text-white rounded hover:bg-[#30363D] transition-colors z-10 text-sm flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
        Export SVG
      </button>
      <div className="w-full h-[600px] overflow-hidden border border-[#30363D] rounded-xl bg-[#0d1117]">
        <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      </div>
    </div>
  );
};
