"use client";

import React, { useState } from 'react';
import CodeEditorShell from '@/components/code/CodeEditorShell';
import { Play, X } from 'lucide-react';

interface Problem {
  id: string;
  title: string;
  difficulty: string;
  leetcodeUrl: string;
  starterCode: string;
}

interface Pattern {
  id: string;
  name: string;
  slug: string;
  description: string;
  difficultyLevel: string;
  problems: Problem[];
}

export default function PatternVisualizer({ pattern }: { pattern: Pattern }) {
  const [activeProblem, setActiveProblem] = useState<Problem | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-[#161b22] border border-[#30363D] rounded-lg p-6">
        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-2xl font-bold text-white">{pattern.name}</h2>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            pattern.difficultyLevel === 'Easy' ? 'bg-green-500/20 text-green-400' :
            pattern.difficultyLevel === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {pattern.difficultyLevel}
          </span>
        </div>
        <p className="text-[#8b949e] text-lg mb-6">{pattern.description}</p>
        
        {/* Placeholder for the interactive visualizer */}
        <div className="w-full h-64 bg-[#0d1117] rounded-lg border border-[#30363D] flex items-center justify-center mb-6">
          <div className="text-center">
            <Play size={48} className="text-[#58a6ff] mx-auto mb-2 opacity-50" />
            <p className="text-[#8b949e]">Interactive {pattern.name} Animation coming soon</p>
          </div>
        </div>

        <h3 className="text-xl font-bold text-white mb-4">Practice Problems</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pattern.problems.map(prob => (
            <div key={prob.id} className="bg-[#0d1117] border border-[#30363D] rounded-lg p-4 flex flex-col justify-between hover:border-[#58a6ff] transition-colors cursor-pointer" onClick={() => setActiveProblem(prob)}>
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-white text-lg">{prob.title}</h4>
                  <span className={`text-xs font-bold ${
                    prob.difficulty === 'Easy' ? 'text-green-400' :
                    prob.difficulty === 'Medium' ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {prob.difficulty}
                  </span>
                </div>
              </div>
              <button className="mt-4 bg-[#238636] hover:bg-[#2ea043] text-white px-4 py-2 rounded font-medium text-sm w-full transition-colors">
                Solve in Modal
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Solve in Modal */}
      {activeProblem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#161b22] w-full max-w-6xl h-[90vh] rounded-xl border border-[#30363D] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="h-14 border-b border-[#30363D] flex items-center justify-between px-6 bg-[#0d1117]">
              <div className="flex items-center gap-4">
                <h2 className="font-bold text-white text-lg">{activeProblem.title}</h2>
                <a href={activeProblem.leetcodeUrl} target="_blank" rel="noreferrer" className="text-xs text-[#58a6ff] hover:underline">
                  View on LeetCode
                </a>
              </div>
              <button 
                onClick={() => setActiveProblem(null)}
                className="text-[#8b949e] hover:text-white p-2 rounded-md hover:bg-[#30363D] transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 p-0 flex">
              <div className="w-1/3 border-r border-[#30363D] p-6 overflow-y-auto bg-[#0d1117]">
                <h3 className="font-bold text-white mb-4">Problem Description</h3>
                <p className="text-[#8b949e]">Description for {activeProblem.title} goes here. Read the problem statement carefully and then use the editor on the right to implement your solution.</p>
              </div>
              <div className="w-2/3">
                <CodeEditorShell initialCode={activeProblem.starterCode || "// Write your solution here\n"} language="java" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
