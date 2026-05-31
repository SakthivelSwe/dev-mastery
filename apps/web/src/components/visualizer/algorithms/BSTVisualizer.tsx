'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface TreeNode {
  id: string; // Unique ID so D3 can track nodes during transitions
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

interface BSTVisualizerProps {
  data: number[];
  speed: number;
  stepMode: boolean;
}

export default function BSTVisualizer({ data, speed, stepMode }: BSTVisualizerProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  // Build BST logic
  const insertNode = (root: TreeNode | null, value: number, path: string = 'root'): TreeNode => {
    if (!root) return { id: `${value}-${path}`, value, left: null, right: null };
    if (value < root.value) root.left = insertNode(root.left, value, path + 'L');
    else if (value > root.value) root.right = insertNode(root.right, value, path + 'R');
    return root;
  };

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const transitionDuration = 700 / speed;

    let root: TreeNode | null = null;
    data.forEach((val) => {
      root = insertNode(root, val);
    });

    let g = svg.select<SVGGElement>('g.tree-group');
    if (g.empty()) {
      g = svg.append('g')
        .attr('class', 'tree-group')
        .attr('transform', `translate(0, 40)`);
    }

    if (!root) {
      g.selectAll("*").remove();
      return;
    }

    // Convert BST to D3 hierarchy
    const rootHierarchy = d3.hierarchy<TreeNode>(root, (d) => {
      const children: TreeNode[] = [];
      if (d.left) children.push(d.left);
      if (d.right) children.push(d.right);
      return children.length > 0 ? children : null;
    });

    const treeLayout = d3.tree<TreeNode>().size([width - 80, height - 100]);
    treeLayout(rootHierarchy);

    // ─── LINKS ────────────────────────────────────────────────────────────
    // linkGen: .x/.y accessors receive the point (hierarchy node), not the link datum.
    // So we use d.x / d.y directly, then call linkGen({ source, target }) per link.
    const linkGen = d3.linkVertical<any, any>()
      .x((d: any) => d.x + 40)
      .y((d: any) => d.y);

    const linkData = rootHierarchy.links();
    const links = g.selectAll<SVGPathElement, any>('path.link')
      .data(linkData, (d: any) => `${d.source.data.id}->${d.target.data.id}`);

    const enterLinks = links.enter()
      .append('path')
      .attr('class', 'link')
      .attr('fill', 'none')
      .attr('stroke', '#30363d')
      .attr('stroke-width', 2)
      .style("opacity", 0)
      // Collapsed at source position (enter animation start)
      .attr('d', (d: any) => linkGen({ source: d.source, target: d.source }));

    const mergedLinks = enterLinks.merge(links);
    mergedLinks.transition()
      .duration(transitionDuration)
      .style("opacity", 1)
      .attr('d', (d: any) => linkGen(d));

    links.exit()
      .transition()
      .duration(transitionDuration)
      .style("opacity", 0)
      .remove();

    // ─── NODES ────────────────────────────────────────────────────────────
    const nodes = g.selectAll<SVGGElement, any>('.node')
      .data(rootHierarchy.descendants(), (d: any) => d.data.id);

    const enterNodes = nodes.enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d: any) => `translate(${d.parent ? d.parent.x + 40 : width/2},${d.parent ? d.parent.y : 0})`)
      .style("opacity", 0);

    enterNodes.append('circle')
      .attr('r', 20)
      .attr('fill', '#161b22')
      .attr('stroke', '#58a6ff')
      .attr('stroke-width', 2);

    enterNodes.append('text')
      .attr('dy', '.35em')
      .attr('text-anchor', 'middle')
      .attr('fill', '#c9d1d9')
      .style('font-family', 'var(--font-mono)')
      .style('font-size', '14px')
      .text(d => d.data.value);

    const mergedNodes = enterNodes.merge(nodes);
    mergedNodes.transition()
      .duration(transitionDuration)
      .attr('transform', (d: any) => `translate(${d.x + 40},${d.y})`)
      .style("opacity", 1);

    nodes.exit()
      .transition()
      .duration(transitionDuration)
      .style("opacity", 0)
      .attr('transform', (d: any) => `translate(${d.parent ? d.parent.x + 40 : width/2},${d.parent ? d.parent.y : 0})`)
      .remove();

  }, [data, speed]);

  return (
    <div className="w-full h-full bg-[#0d1117] rounded-lg border border-[--border-default] overflow-hidden">
      <svg ref={svgRef} className="w-full h-full"></svg>
    </div>
  );
}
