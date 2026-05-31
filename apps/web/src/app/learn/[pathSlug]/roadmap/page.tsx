'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { RoadmapCanvas } from '@/components/roadmap/RoadmapCanvas';
import { RoadmapListView } from '@/components/roadmap/RoadmapListView';
import { fetchPathRoadmap, normalizeSlug } from '@/lib/api';
import type { PathRoadmapData } from '@/lib/api';
import { Loader2, Map, List, ArrowLeft, RefreshCw, WifiOff } from 'lucide-react';
import Link from 'next/link';

const MAX_RETRIES   = 4;
const RETRY_DELAY   = 2500; // ms between retries

export default function PathRoadmapPage() {
  const params   = useParams();
  const router   = useRouter();

  // Normalize slug immediately: converts "spring_boot" → "spring-boot"
  // If the URL has underscores, redirect to the canonical hyphen URL
  const rawSlug  = params.pathSlug as string;
  const pathSlug = normalizeSlug(rawSlug);

  useEffect(() => {
    if (rawSlug !== pathSlug) {
      router.replace(`/learn/${pathSlug}/roadmap`);
    }
  }, [rawSlug, pathSlug, router]);

  const [roadmapData, setRoadmapData] = useState<PathRoadmapData | null>(null);
  const [loading, setLoading]         = useState(true);
  const [retryCount, setRetryCount]   = useState(0);
  const [retrying, setRetrying]       = useState(false);
  const [viewMode, setViewMode]       = useState<'map' | 'list'>('list');

  const loadRoadmap = useCallback(async (attempt = 0) => {
    setLoading(true);
    setRetrying(attempt > 0);
    try {
      const data = await fetchPathRoadmap(pathSlug);
      if (data) {
        setRoadmapData(data);
        setRetrying(false);
      } else if (attempt < MAX_RETRIES) {
        // Backend may still be starting up — retry after delay
        setTimeout(() => {
          setRetryCount(attempt + 1);
          loadRoadmap(attempt + 1);
        }, RETRY_DELAY);
        return; // don't clear loading yet
      }
    } catch (error) {
      console.error('Failed to load roadmap:', error);
      if (attempt < MAX_RETRIES) {
        setTimeout(() => {
          setRetryCount(attempt + 1);
          loadRoadmap(attempt + 1);
        }, RETRY_DELAY);
        return;
      }
    }
    setLoading(false);
    setRetrying(false);
  }, [pathSlug]);

  useEffect(() => {
    loadRoadmap(0);
  }, [loadRoadmap]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-[--bg-primary]">
        <div className="flex flex-col items-center gap-3 text-[--text-muted]">
          <Loader2 className="animate-spin" size={28} />
          {retrying ? (
            <>
              <span className="text-sm text-[--text-secondary]">Backend is starting up...</span>
              <span className="text-xs text-[--text-muted]">Attempt {retryCount + 1} of {MAX_RETRIES + 1} — retrying in a moment</span>
            </>
          ) : (
            <span className="text-sm">Loading roadmap...</span>
          )}
        </div>
      </div>
    );
  }

  if (!roadmapData) {
    return (
      <div className="flex h-full items-center justify-center bg-[--bg-primary]">
        <div className="text-center max-w-sm">
          <WifiOff size={36} className="mx-auto mb-4 text-[--text-muted]" />
          <p className="text-[--text-primary] font-semibold mb-2">Could not load roadmap</p>
          <p className="text-[--text-muted] text-sm mb-1">
            The content service may still be starting up.
          </p>
          <p className="text-[--text-muted] text-xs mb-6">
            Path: <code className="bg-[--bg-elevated] px-1 py-0.5 rounded text-[--text-secondary]">{pathSlug}</code>
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => { setRetryCount(0); loadRoadmap(0); }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[--accent-ai] text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <RefreshCw size={14} />
              Retry
            </button>
            <Link href="/dashboard" className="text-[--accent-ai] hover:underline text-sm">
              ← Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate overall stats
  const totalTopics     = roadmapData.levels.reduce((sum, l) => sum + l.topicCount, 0);
  const completedTopics = roadmapData.levels.reduce((sum, l) => sum + l.completedCount, 0);
  const completionPct   = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  return (
    <div className="h-full overflow-y-auto bg-[--bg-primary]">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Back nav */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-[--text-muted] hover:text-[--text-primary] text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={14} />
          Dashboard
        </Link>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[--text-primary] mb-1 font-display">
              {roadmapData.path.title}
            </h1>
            <p className="text-[--text-secondary] text-sm">
              Master all {roadmapData.path.totalTopics} topics — from Foundation to Expert.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-[--bg-surface] border border-[--border-default] rounded-xl p-4">
            <div className="flex flex-col items-center border-r border-[--border-default] pr-4">
              <span className="text-[11px] text-[--text-muted] uppercase tracking-wider">Progress</span>
              <span className="text-2xl font-bold text-[--accent-spring]">{completionPct}%</span>
            </div>
            <div className="flex flex-col items-center pl-4">
              <span className="text-[11px] text-[--text-muted] uppercase tracking-wider">Topics Done</span>
              <span className="text-2xl font-bold text-[--text-primary]">{completedTopics} / {totalTopics}</span>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex bg-[--bg-elevated] rounded-lg p-1 border border-[--border-default]">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-[--bg-surface] text-[--text-primary] shadow-sm'
                  : 'text-[--text-muted] hover:text-[--text-primary]'
              }`}
            >
              <List size={15} />
              List View
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'map'
                  ? 'bg-[--bg-surface] text-[--text-primary] shadow-sm'
                  : 'text-[--text-muted] hover:text-[--text-primary]'
              }`}
            >
              <Map size={15} />
              Map View
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="w-full">
          {viewMode === 'map' ? (
            <RoadmapCanvas data={roadmapData as any} />
          ) : (
            <RoadmapListView data={roadmapData as any} />
          )}
        </div>
      </div>
    </div>
  );
}
