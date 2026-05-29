import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface DPVisualizerProps {
  data: number[][]; // DP table grid
  speed: number;
  stepMode: boolean;
}

export default function DPVisualizer({ data, speed, stepMode }: DPVisualizerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;
    
    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const transitionDuration = 700 / speed;

    const rows = data.length;
    const cols = data[0].length;
    
    const cellWidth = 50;
    const cellHeight = 50;
    
    const startX = width / 2 - (cols * cellWidth) / 2;
    const startY = height / 2 - (rows * cellHeight) / 2;

    let gridG = svg.select<SVGGElement>("g.grid-group");
    if (gridG.empty()) {
      gridG = svg.append("g").attr("class", "grid-group");
    }

    gridG.transition()
      .duration(transitionDuration)
      .attr("transform", `translate(${startX}, ${startY})`);

    // Flatten 2D data for D3 join
    const flatData = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        flatData.push({
          id: `r${r}-c${c}`,
          r: r,
          c: c,
          value: data[r][c]
        });
      }
    }

    const cells = gridG.selectAll<SVGGElement, any>("g.cell")
      .data(flatData, d => d.id);

    // ─── ENTER ────────────────────────────────────────────────────────────
    const enterCells = cells.enter()
      .append("g")
      .attr("class", "cell")
      .attr("transform", (d) => `translate(${d.c * cellWidth}, ${d.r * cellHeight})`)
      .style("opacity", 0);

    enterCells.append("rect")
      .attr("width", cellWidth)
      .attr("height", cellHeight)
      .attr("fill", "#161b22")
      .attr("stroke", "#30363d")
      .attr("stroke-width", 1)
      .attr("rx", 2);

    enterCells.append("text")
      .attr("x", cellWidth / 2)
      .attr("y", cellHeight / 2)
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .attr("fill", "#c9d1d9")
      .text(d => d.value);

    // ─── UPDATE ───────────────────────────────────────────────────────────
    const mergedCells = enterCells.merge(cells);
    mergedCells.transition()
      .duration(transitionDuration)
      .attr("transform", (d) => `translate(${d.c * cellWidth}, ${d.r * cellHeight})`)
      .style("opacity", 1);

    mergedCells.select("rect")
      .transition()
      .duration(transitionDuration)
      // Flash recently updated cells by checking if they just entered or if their value changed
      // We will just leave it simple for now, can add fill transitions if value diff is available
      .attr("fill", "#161b22");

    mergedCells.select("text")
      .transition()
      .duration(transitionDuration)
      .text((d: any) => d.value);

    // ─── EXIT ─────────────────────────────────────────────────────────────
    cells.exit()
      .transition()
      .duration(transitionDuration)
      .style("opacity", 0)
      .remove();

  }, [data, speed]);

  return <svg ref={svgRef} className="w-full h-full bg-[#0d1117]"></svg>;
}
