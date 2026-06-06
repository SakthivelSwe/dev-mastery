'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PathRoadmapResponse } from '@/components/roadmap/RoadmapCanvas';
import { RoadmapCanvas } from '@/components/roadmap/RoadmapCanvas';
import { RoadmapListView } from '@/components/roadmap/RoadmapListView';
import { fetchPath } from '@/lib/api';
import type { LearningPath } from '@/lib/api';


export default function PathRoadmapPage() {
  const params = useParams();
  const pathSlug = params.pathSlug as string;

  const [roadmapData, setRoadmapData] = useState<PathRoadmapResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  useEffect(() => {
    async function loadRoadmap() {
      try {
        const data = await fetchPath(pathSlug);
        if (data) setRoadmapData(data as any);
      } catch (error) {
        console.error('Failed to load roadmap:', error);
      } finally {
        setLoading(false);
      }
    }
    loadRoadmap();
  }, [pathSlug]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-[#0d1117]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#58a6ff]"></div>
      </div>
    );
  }

  if (!roadmapData) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-[#0d1117] text-white">
        <h2>Failed to load roadmap data.</h2>
      </div>
    );
  }

  // Calculate overall stats
  let totalTopics = 0;
  let completedTopics = 0;
  roadmapData.levels.forEach(l => {
    totalTopics += l.topicCount;
    completedTopics += l.completedCount;
  });
  const completionPercentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#0d1117] text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{roadmapData.path.title} Roadmap</h1>
            <p className="text-[#8b949e]">
              Master all {roadmapData.path.totalTopics} topics from Foundation to Expert.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-[#161b22] border border-[#30363D] rounded-lg p-4">
            <div className="flex flex-col items-center border-r border-[#30363D] pr-4">
              <span className="text-sm text-[#8b949e]">Progress</span>
              <span className="text-xl font-bold text-[#6DB33F]">{completionPercentage}%</span>
            </div>
            <div className="flex flex-col items-center pl-4">
              <span className="text-sm text-[#8b949e]">Topics Done</span>
              <span className="text-xl font-bold text-white">{completedTopics} / {totalTopics}</span>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex bg-[#21262D] rounded-lg p-1 border border-[#30363D]">
            <button 
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'map' ? 'bg-[#30363D] text-white shadow-sm' : 'text-[#8b949e] hover:text-white'
              }`}
            >
              Map View
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list' ? 'bg-[#30363D] text-white shadow-sm' : 'text-[#8b949e] hover:text-white'
              }`}
            >
              List View
            </button>
          </div>
        </div>

        {/* Visualization Content */}
        <div className="w-full">
          {viewMode === 'map' ? (
            <RoadmapCanvas data={roadmapData} />
          ) : (
            <RoadmapListView data={roadmapData} />
          )}
        </div>
      </div>
    </div>
  );
}
