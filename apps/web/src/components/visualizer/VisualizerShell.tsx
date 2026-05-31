'use client';

import React, { useState } from 'react';
import { Play, Pause, RotateCcw, StepForward } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { visualizerRegistry } from './VisualizerRegistry';
import CustomInputPanel from './CustomInputPanel';
import VisualizerRouter from '@/components/visualizers/VisualizerRouter';

const API_BASE = process.env.NEXT_PUBLIC_CONTENT_API_URL ?? 'http://localhost:8082';

export default function VisualizerShell({ topicSlug = 'array-basics' }: { topicSlug?: string }) {
  // Use the registry for known complex visualizers; VisualizerRouter handles the
  // slug → component mapping with ArrayVisualizer as the default fallback (NEVER BST).
  const visualizerConfig = visualizerRegistry[topicSlug] ?? null;

  const [data, setData]       = useState<any>(visualizerConfig?.defaultData ?? [12, 45, 7, 23, 67, 34, 89]);
  const [speed, setSpeed]     = useState(1);
  const [stepMode, setStepMode] = useState(false);

  const defaultInputStr = !visualizerConfig ? '12,45,7,23,67,34,89'
    : typeof visualizerConfig.defaultData === 'string'
      ? visualizerConfig.defaultData
      : Array.isArray(visualizerConfig.defaultData)
        ? visualizerConfig.defaultData.join(',')
        : JSON.stringify(visualizerConfig.defaultData);
  const [inputVal, setInputVal] = useState(defaultInputStr);

  const handleUpdate = () => {
    try {
      const inputType = visualizerConfig?.inputType ?? 'array';
      if (inputType === 'array') {
        const parsed = inputVal.split(',').map(s => {
          const num = parseInt(s.trim());
          return isNaN(num) ? s.trim() : num;
        });
        setData(parsed);
      } else if (inputType === 'graph') {
        setData(JSON.parse(inputVal));
      } else {
        setData(inputVal);
      }
    } catch (e) {
      console.error('Invalid input format', e);
    }
  };

  const [sampleCode, setSampleCode] = useState(`// Loading visualizer data...`);

  React.useEffect(() => {
    async function fetchCode() {
      try {
        const res = await fetch(`${API_BASE}/v1/topics/${topicSlug}/code?tier=easy&lang=java`);
        if (res.ok) {
          const data = await res.json();
          if (data.code) {
            setSampleCode(data.code);
          } else {
            setSampleCode(`// No visualization code available for ${topicSlug}.`);
          }
        } else {
          setSampleCode(`// No visualization code available for ${topicSlug}.`);
        }
      } catch (err) {
        console.error('Failed to fetch code for visualizer', err);
        setSampleCode(`// Failed to load visualization code.`);
      }
    }
    fetchCode();
  }, [topicSlug]);

  return (
    <div className="flex h-[calc(100vh-8rem)] w-full">
      {/* Left Panel - Visualizer (60%) */}
      <div className="w-[60%] flex flex-col border-r border-[--border-default] p-4 gap-4">
        <div className="flex flex-wrap justify-between items-center bg-[--bg-elevated] p-3 rounded-lg border border-[--border-default] gap-3">
          <CustomInputPanel
            inputType={visualizerConfig?.inputType ?? 'array'}
            value={inputVal}
            onChange={setInputVal}
            onApply={handleUpdate}
          />

          <div className="flex gap-2 items-center">
            <button className="p-2 hover:bg-[--bg-surface] text-[--text-secondary] hover:text-[--text-primary] rounded-md transition-colors">
              <Play size={18} />
            </button>
            <button className="p-2 hover:bg-[--bg-surface] text-[--text-secondary] hover:text-[--text-primary] rounded-md transition-colors">
              <Pause size={18} />
            </button>
            <button className="p-2 hover:bg-[--bg-surface] text-[--text-secondary] hover:text-[--text-primary] rounded-md transition-colors">
              <StepForward size={18} />
            </button>
            <button className="p-2 hover:bg-[--bg-surface] text-[--text-secondary] hover:text-[--text-primary] rounded-md transition-colors">
              <RotateCcw size={18} />
            </button>

            <div className="flex items-center gap-2 ml-4">
              <span className="text-xs text-[--text-muted]">Speed:</span>
              <input
                type="range"
                min="0.25" max="4" step="0.25"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-24"
              />
              <span className="text-xs text-[--text-secondary]">{speed}x</span>
            </div>
          </div>
        </div>

        <div className="flex-1 rounded-lg overflow-hidden relative bg-[--bg-elevated] border border-[--border-default]">
          {/* Render via VisualizerRouter — correctly routes ALL slugs.
              Default fallback = ArrayVisualizer. NEVER falls back to BSTVisualizer. */}
          <VisualizerRouter
            topicSlug={topicSlug}
            data={Array.isArray(data) ? (data as number[]) : [12, 45, 7, 23]}
            speed={Math.round(speed)}
            isPlaying={stepMode}
          />
        </div>

        <div className="bg-[--bg-elevated] border border-[--border-default] p-4 rounded-lg text-sm text-[--text-secondary] min-h-[80px]">
          <strong className="text-[--text-primary]">Step Explanation:</strong>{' '}
          Interact with the visualizer to see step-by-step explanations here.
        </div>
      </div>

      {/* Right Panel - Code (40%) */}
      <div className="w-[40%] flex flex-col bg-[#1e1e1e]">
        <div className="border-b border-[#333] p-2 flex text-xs text-gray-400 gap-4 bg-[#252526]">
          <span className="px-2 py-1 border-b-2 border-[--accent-java] text-white font-medium">Solution.java</span>
        </div>
        <div className="flex-1">
          <Editor
            height="100%"
            defaultLanguage="java"
            theme="vs-dark"
            value={sampleCode}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: 'JetBrains Mono, monospace',
              lineHeight: 22,
              padding: { top: 16 },
              readOnly: false,
            }}
          />
        </div>
      </div>
    </div>
  );
}
