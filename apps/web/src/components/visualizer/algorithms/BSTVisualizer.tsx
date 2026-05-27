'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface TreeNode {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
  x?: number;
  y?: number;
}

interface BSTVisualizerProps {
  data: number[];
  speed: number;
  stepMode: boolean;
}

export default function BSTVisualizer({ data, speed, stepMode }: BSTVisualizerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [treeRoot, setTreeRoot] = useState<TreeNode | null>(null);

  // Build BST logic
  const insertNode = (root: TreeNode | null, value: number): TreeNode => {
    if (!root) return { value, left: null, right: null };
    if (value < root.value) root.left = insertNode(root.left, value);
    else if (value > root.value) root.right = insertNode(root.right, value);
    return root;
  };

  useEffect(() => {
    let root: TreeNode | null = null;
    data.forEach((val) => {
      root = insertNode(root, val);
    });
    setTreeRoot(root);
  }, [data]);

  // Render with D3
  useEffect(() => {
    if (!treeRoot || !svgRef.current) return;

    const width = 800;
    const height = 500;
    const margin = { top: 40, right: 20, bottom: 20, left: 20 };

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous

    const g = svg
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Convert BST to D3 hierarchy
    const rootHierarchy = d3.hierarchy<TreeNode>(treeRoot, (d) => {
      const children: TreeNode[] = [];
      if (d.left) children.push(d.left);
      if (d.right) children.push(d.right);
      return children.length > 0 ? children : null;
    });

    const treeLayout = d3.tree<TreeNode>().size([width - margin.left - margin.right, height - margin.top - margin.bottom]);
    treeLayout(rootHierarchy);

    // Links
    g.selectAll('.link')
      .data(rootHierarchy.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('fill', 'none')
      .attr('stroke', 'hsl(var(--muted-foreground))')
      .attr('stroke-width', 2)
      .attr('d', d3.linkVertical<any, any>()
        .x(d => d.x)
        .y(d => d.y)
      );

    // Nodes
    const node = g.selectAll('.node')
      .data(rootHierarchy.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x},${d.y})`);

    node.append('circle')
      .attr('r', 20)
      .attr('fill', 'hsl(var(--background))')
      .attr('stroke', 'var(--accent-java)')
      .attr('stroke-width', 2)
      .transition()
      .duration(500 / speed)
      .attr('r', 25);

    node.append('text')
      .attr('dy', 5)
      .attr('text-anchor', 'middle')
      .attr('fill', 'hsl(var(--foreground))')
      .style('font-family', 'var(--font-mono)')
      .style('font-size', '14px')
      .text(d => d.data.value);

  }, [treeRoot, speed]);

  return (
    <div className="w-full h-full flex items-center justify-center bg-card rounded-lg border">
      <svg ref={svgRef}></svg>
    </div>
  );
}
