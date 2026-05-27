'use client';

import React, { useState } from 'react';
import { PathRoadmapResponse } from './RoadmapCanvas';
import Link from 'next/link';

interface RoadmapListViewProps {
  data: PathRoadmapResponse;
}

export const RoadmapListView: React.FC<RoadmapListViewProps> = ({ data }) => {
  const [expandedLevels, setExpandedLevels] = useState<number[]>([1]); // Expand first level by default

  const toggleLevel = (level: number) => {
    setExpandedLevels(prev => 
      prev.includes(level) 
        ? prev.filter(l => l !== level)
        : [...prev, level]
    );
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {data.levels.map(lvl => {
        const isExpanded = expandedLevels.includes(lvl.level);
        return (
          <div key={lvl.level} className="bg-[#0d1117] border border-[#30363D] rounded-xl overflow-hidden">
            <button 
              onClick={() => toggleLevel(lvl.level)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#161b22] transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#21262D] text-[#8b949e] font-bold">
                  {lvl.level}
                </div>
                <h3 className="text-lg font-semibold text-white">
                  Level {lvl.level}: {lvl.label}
                </h3>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-end">
                  <span className="text-sm text-[#8b949e]">
                    {lvl.completedCount} / {lvl.topicCount} completed
                  </span>
                  <div className="w-24 h-1.5 bg-[#21262D] rounded-full mt-1 overflow-hidden">
                    <div 
                      className="h-full bg-[#6DB33F]" 
                      style={{ width: `${(lvl.completedCount / lvl.topicCount) * 100}%` }}
                    />
                  </div>
                </div>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="20" height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className={`text-[#8b949e] transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </button>

            {isExpanded && (
              <div className="px-6 py-4 border-t border-[#30363D] bg-[#090c10]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lvl.topics.map(topic => (
                    <Link 
                      href={`/learn/${data.path.slug}/${topic.slug}`} 
                      key={topic.slug}
                      className={`p-4 border rounded-lg hover:border-[#58a6ff] hover:bg-[#161b22] transition-colors block ${
                        topic.completed 
                          ? 'border-[#6DB33F] bg-[#0d1117]' 
                          : 'border-[#30363D] bg-[#0d1117]'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className={`font-semibold ${topic.completed ? 'text-[#6DB33F]' : 'text-white'}`}>
                          {topic.title}
                        </h4>
                        {topic.completed && (
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6DB33F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-4 text-xs">
                        <span className="px-2 py-1 bg-[#21262D] text-[#8b949e] rounded-md">
                          {topic.estimatedMins} mins
                        </span>
                        {topic.hasVisualizer && (
                          <span className="px-2 py-1 bg-[#1f2937] text-blue-400 rounded-md flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                            Visualizer
                          </span>
                        )}
                        {topic.hasCodeLab && (
                          <span className="px-2 py-1 bg-[#1f2937] text-yellow-400 rounded-md flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                            Code Lab
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
