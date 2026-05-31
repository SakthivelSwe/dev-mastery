'use client';

import React from 'react';
import { useTopicStore, TabState } from '@/store/useTopicStore';
import { CheckCircle, Circle, Play, BookOpen, Code, Activity, Briefcase, MessageSquare, Lock, Mic, Hammer, Repeat } from 'lucide-react';

const tabs: { id: TabState; label: string; icon: any; est: string }[] = [
  { id: 'why',          label: 'Why it matters',    icon: Activity,       est: '2m' },
  { id: 'theory',       label: 'Theory & Concepts', icon: BookOpen,       est: '10m' },
  { id: 'visualizer',   label: 'Visualizer',         icon: Play,           est: '15m' },
  { id: 'code',         label: 'Code Lab',           icon: Code,           est: '20m' },
  { id: 'real-world',   label: 'Real World',         icon: Briefcase,      est: '5m' },
  { id: 'interview',    label: 'Interview Prep',     icon: MessageSquare,  est: '10m' },
  { id: 'feynman',      label: 'Feynman Check',      icon: Mic,            est: '5m' },
  { id: 'build',        label: 'Build Challenge',    icon: Hammer,         est: '30m' },
  { id: 'spaced-review',label: 'Spaced Review',      icon: Repeat,         est: '3m' },
];

export default function LessonNav({ topicSlug }: { topicSlug: string }) {
  const { activeTab, setActiveTab, completedTabsByTopic } = useTopicStore();
  const completedTabs = completedTabsByTopic[topicSlug] || {};

  return (
    <div className="w-64 border-r border-[--border-default] bg-[--bg-surface] h-full p-3 flex flex-col gap-1 overflow-y-auto shrink-0">
      <h3 className="text-[10px] font-semibold text-[--text-muted] uppercase tracking-widest mb-2 px-2 shrink-0">
        Learning Layers
      </h3>

      {tabs.map((tab) => {
        const isActive   = activeTab === tab.id;
        const isComplete = completedTabs[tab.id];
        const isLocked   = tab.id === 'interview' && !completedTabs['code'];
        const Icon       = isLocked ? Lock : tab.icon;

        return (
          <button
            key={tab.id}
            onClick={() => !isLocked && setActiveTab(tab.id)}
            disabled={isLocked}
            className={`
              flex items-center text-left w-full px-3 py-2.5 rounded-lg transition-all duration-150
              ${isActive
                ? 'bg-[--bg-elevated] text-[--text-primary]'
                : 'text-[--text-secondary] hover:bg-[--bg-elevated]/60 hover:text-[--text-primary]'
              }
              ${isLocked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
            `}
            style={isActive ? { borderLeft: '3px solid var(--accent-java)', paddingLeft: '9px' } : {}}
          >
            <div className={`mr-3 shrink-0 ${isActive ? 'text-[--accent-java]' : 'text-[--text-muted]'}`}>
              <Icon size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className={`text-[13px] font-medium truncate ${isActive ? 'text-[--text-primary]' : 'text-[--text-secondary]'}`}>
                {tab.label}
              </div>
              <div className="text-[11px] text-[--text-muted]">Est: {tab.est}</div>
            </div>
            <div className="ml-2 shrink-0">
              {isComplete
                ? <CheckCircle size={15} className="text-emerald-500" />
                : <Circle size={15} className="text-[--text-muted] opacity-30" />
              }
            </div>
          </button>
        );
      })}
    </div>
  );
}
