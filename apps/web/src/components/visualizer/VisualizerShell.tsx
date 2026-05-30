'use client';

import React, { useState } from 'react';
import { Play, Pause, RotateCcw, StepForward } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { visualizerRegistry } from './VisualizerRegistry';
import CustomInputPanel from './CustomInputPanel';

export default function VisualizerShell({ topicSlug = 'binary-search-tree' }: { topicSlug?: string }) {
  const visualizerConfig = visualizerRegistry[topicSlug] || visualizerRegistry['binary-search-tree'];
  const VisualizerComponent = visualizerConfig.component;

  const [data, setData]       = useState<any>(visualizerConfig.defaultData);
  const [speed, setSpeed]     = useState(1);
  const [stepMode, setStepMode] = useState(false);

  const defaultInputStr = typeof visualizerConfig.defaultData === 'string'
    ? visualizerConfig.defaultData
    : Array.isArray(visualizerConfig.defaultData)
      ? visualizerConfig.defaultData.join(',')
      : JSON.stringify(visualizerConfig.defaultData);
  const [inputVal, setInputVal] = useState(defaultInputStr);

  const handleUpdate = () => {
    try {
      if (visualizerConfig.inputType === 'array') {
        const parsed = inputVal.split(',').map(s => {
          const num = parseInt(s.trim());
          return isNaN(num) ? s.trim() : num;
        });
        setData(parsed);
      } else if (visualizerConfig.inputType === 'graph') {
        setData(JSON.parse(inputVal));
      } else {
        setData(inputVal);
      }
    } catch (e) {
      console.error('Invalid input format', e);
    }
  };

  const sampleCode = `// Visualizer: ${topicSlug}`;

  return (
    <div className="flex h-[calc(100vh-8rem)] w-full">
      {/* Left Panel - Visualizer (60%) */}
      <div className="w-[60%] flex flex-col border-r border-[--border-default] p-4 gap-4">
        <div className="flex flex-wrap justify-between items-center bg-[--bg-elevated] p-3 rounded-lg border border-[--border-default] gap-3">
          <CustomInputPanel
            inputType={visualizerConfig.inputType}
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
          {/* Complexity Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
            <span className="bg-[--bg-surface]/80 backdrop-blur text-xs px-2 py-1 border border-[--border-default] rounded text-emerald-400">
              Time: O(log n)
            </span>
            <span className="bg-[--bg-surface]/80 backdrop-blur text-xs px-2 py-1 border border-[--border-default] rounded text-blue-400">
              Space: O(n)
            </span>
          </div>
          <VisualizerComponent data={data} speed={speed} stepMode={stepMode} />
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
