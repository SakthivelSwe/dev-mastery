'use client';

import React, { useState } from 'react';
import { Play, Pause, RotateCcw, StepForward } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { visualizerRegistry } from './VisualizerRegistry';
import CustomInputPanel from './CustomInputPanel';

export default function VisualizerShell({ topicSlug = 'binary-search-tree' }: { topicSlug?: string }) {
  // Only render a visualizer if this topic actually has one registered.
  // Otherwise show a friendly placeholder instead of crashing inside a default viz.
  const visualizerConfig = visualizerRegistry[topicSlug];
  if (!visualizerConfig) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <div className="w-14 h-14 rounded-2xl bg-[--bg-elevated] border border-[--border-default] flex items-center justify-center mb-4">
          <Play size={22} className="text-[--text-muted]" />
        </div>
        <h3 className="text-lg font-semibold text-[--text-primary] mb-1">No visualizer for this topic</h3>
        <p className="text-sm text-[--text-secondary] max-w-md">
          Interactive visualisers are available on selected algorithm and data-structure topics
          (Binary Search Tree, Linked List, Heap, Trie, Graph, DP…). Continue with the other layers
          to learn this topic.
        </p>
      </div>
    );
  }
  const VisualizerComponent = visualizerConfig.component;
  
  const [data, setData] = useState<any>(visualizerConfig.defaultData);
  const [speed, setSpeed] = useState(1);
  const [stepMode, setStepMode] = useState(false);
  
  const defaultInputStr = typeof visualizerConfig.defaultData === 'string' ? visualizerConfig.defaultData : 
      Array.isArray(visualizerConfig.defaultData) ? visualizerConfig.defaultData.join(',') : JSON.stringify(visualizerConfig.defaultData);
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
      console.error("Invalid input format", e);
    }
  };

  const sampleCode = `// Code for ${topicSlug}`;

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full">
      {/* Left Panel - Visualizer (60%) */}
      <div className="w-[60%] flex flex-col border-r border-border p-4 gap-4">
        <div className="flex justify-between items-center bg-card p-3 rounded-lg border">
          <CustomInputPanel 
            inputType={visualizerConfig.inputType} 
            value={inputVal} 
            onChange={setInputVal} 
            onApply={handleUpdate} 
          />
          
          <div className="flex gap-2 items-center">
            <button className="p-2 hover:bg-muted rounded-md"><Play size={18} /></button>
            <button className="p-2 hover:bg-muted rounded-md"><Pause size={18} /></button>
            <button className="p-2 hover:bg-muted rounded-md"><StepForward size={18} /></button>
            <button className="p-2 hover:bg-muted rounded-md"><RotateCcw size={18} /></button>
            
            <div className="flex items-center gap-2 ml-4">
              <span className="text-xs text-muted-foreground">Speed:</span>
              <input 
                type="range" 
                min="0.25" max="4" step="0.25" 
                value={speed} 
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-24"
              />
              <span className="text-xs">{speed}x</span>
            </div>
          </div>
        </div>

        <div className="flex-1 rounded-lg overflow-hidden relative">
          {/* Complexity Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
            <span className="bg-background/80 backdrop-blur text-xs px-2 py-1 border rounded text-emerald-400">
              Time: O(log n)
            </span>
            <span className="bg-background/80 backdrop-blur text-xs px-2 py-1 border rounded text-blue-400">
              Space: O(n)
            </span>
          </div>
          <VisualizerComponent data={data} speed={speed} stepMode={stepMode} />
        </div>

        <div className="bg-muted/50 p-4 rounded-lg border text-sm text-muted-foreground min-h-[100px]">
          <strong>Step Explanation:</strong> Building the tree node by node. Node 50 is the root.
        </div>
      </div>

      {/* Right Panel - Code (40%) */}
      <div className="w-[40%] flex flex-col bg-[#1e1e1e]">
        <div className="border-b border-[#333] p-2 flex text-xs text-gray-400 gap-4">
          <span className="px-2 py-1 border-b-2 border-accent-java text-white">BST.java</span>
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
              fontFamily: 'var(--font-mono)',
              lineHeight: 24,
              padding: { top: 16 }
            }}
          />
        </div>
      </div>
    </div>
  );
}
