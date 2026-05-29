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
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const transitionDuration = 700 / speed;
    
    // Create hierarchy structure from array mapping values and original indices
    const buildHierarchy = (arr: number[], index: number = 0): any => {
      if (index >= arr.length) return null;
      return {
        id: `${arr[index]}-${index}`, // Unique ID based on value and index
        value: arr[index],
        arrayIndex: index,
        children: [
          buildHierarchy(arr, 2 * index + 1),
          buildHierarchy(arr, 2 * index + 2)
        ].filter(Boolean)
      };
    };

    const root = buildHierarchy(data);
    
    // Setup groups
    let treeGroup = svg.select<SVGGElement>("g.tree-group");
    if (treeGroup.empty()) {
      treeGroup = svg.append("g").attr("class", "tree-group").attr("transform", "translate(50, 50)");
    }
    
    let arrayGroup = svg.select<SVGGElement>("g.array-group");
    const arrayY = height - 60;
    if (arrayGroup.empty()) {
      arrayGroup = svg.append("g").attr("class", "array-group");
    }

    if (!root) {
      treeGroup.selectAll("*").remove();
      arrayGroup.selectAll("*").remove();
      return;
    }

    // ─── TREE VISUALIZATION ────────────────────────────────────────────────
    const treeLayout = d3.tree().size([width - 100, height - 150]);
    const rootNode = d3.hierarchy(root);
    treeLayout(rootNode);

    // Links
    const linkData = rootNode.links();
    const links = treeGroup.selectAll<SVGPathElement, any>("path.link")
      .data(linkData, (d: any) => `${d.source.data.id}-${d.target.data.id}`);

    const enterLinks = links.enter()
      .append("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", "#30363d")
      .attr("stroke-width", 2)
      .style("opacity", 0)
      .attr("d", d3.linkVertical()
        .x((d: any) => d.source.x) // Start at parent
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

    // Nodes
    const nodes = treeGroup.selectAll<SVGGElement, any>("g.node")
      .data(rootNode.descendants(), (d: any) => d.data.id);

    const enterNodes = nodes.enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d: any) => `translate(${d.parent ? d.parent.x : width / 2}, ${d.parent ? d.parent.y : 0})`)
      .style("opacity", 0);

    enterNodes.append("circle")
      .attr("r", 20)
      .attr("fill", "#161b22")
      .attr("stroke", "#58a6ff")
      .attr("stroke-width", 2);

    enterNodes.append("text")
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .attr("fill", "#c9d1d9")
      .text((d: any) => d.data.value);

    // Update positions
    const mergedNodes = enterNodes.merge(nodes);
    mergedNodes.transition()
      .duration(transitionDuration)
      .attr("transform", (d: any) => `translate(${d.x},${d.y})`)
      .style("opacity", 1);

    nodes.exit()
      .transition()
      .duration(transitionDuration)
      .style("opacity", 0)
      .attr("transform", (d: any) => `translate(${d.parent ? d.parent.x : width / 2}, ${d.parent ? d.parent.y : 0})`)
      .remove();

    // ─── ARRAY VISUALIZATION ──────────────────────────────────────────────
    const dataObjects = data.map((d, i) => ({ id: `${d}-${i}`, value: d, index: i }));
    const arrayStartX = (width - (data.length * 40)) / 2;
    
    arrayGroup.transition().duration(transitionDuration)
      .attr("transform", `translate(${arrayStartX}, ${arrayY})`);

    const cells = arrayGroup.selectAll<SVGGElement, any>("g.cell")
      .data(dataObjects, d => d.id);

    const enterCells = cells.enter()
      .append("g")
      .attr("class", "cell")
      .attr("transform", (d) => `translate(${d.index * 40}, 50)`)
      .style("opacity", 0);

    enterCells.append("rect")
      .attr("width", 40)
      .attr("height", 40)
      .attr("fill", "#161b22")
      .attr("stroke", "#30363d")
      .attr("stroke-width", 2);

    enterCells.append("text")
      .attr("class", "val-text")
      .attr("x", 20)
      .attr("y", 20)
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .attr("fill", "#c9d1d9")
      .text(d => d.value);

    enterCells.append("text")
      .attr("class", "idx-text")
      .attr("x", 20)
      .attr("y", 55)
      .attr("text-anchor", "middle")
      .attr("fill", "#8b949e")
      .attr("font-size", "10px")
      .text(d => d.index);

    const mergedCells = enterCells.merge(cells);
    mergedCells.transition()
      .duration(transitionDuration)
      .attr("transform", (d) => `translate(${d.index * 40}, 0)`)
      .style("opacity", 1);

    mergedCells.select("text.idx-text").text((d: any) => d.index);

    cells.exit()
      .transition()
      .duration(transitionDuration)
      .attr("transform", (d: any) => `translate(${d.index * 40}, 50)`)
      .style("opacity", 0)
      .remove();
      
  }, [data, speed]);

  return <svg ref={svgRef} className="w-full h-full bg-[#0d1117]"></svg>;
}
