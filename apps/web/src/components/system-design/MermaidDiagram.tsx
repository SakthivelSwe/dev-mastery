"use client";

import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { v4 as uuidv4 } from 'uuid';

interface MermaidDiagramProps {
  chart: string;
}

export default function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      securityLevel: 'loose',
      fontFamily: 'Inter, sans-serif'
    });

    const renderDiagram = async () => {
      if (chart) {
        try {
          const id = `mermaid-${uuidv4().replace(/-/g, '')}`;
          const { svg } = await mermaid.render(id, chart);
          setSvgContent(svg);
        } catch (error) {
          console.error('Failed to render mermaid diagram', error);
        }
      }
    };

    renderDiagram();
  }, [chart]);

  return (
    <div 
      ref={containerRef}
      className="mermaid-container flex justify-center items-center w-full h-full p-4 overflow-auto"
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
}
