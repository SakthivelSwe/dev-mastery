'use client';

import React from 'react';
import { useTopicStore, TabState } from '@/store/useTopicStore';
import { CheckCircle, Circle, Play, BookOpen, Code, Activity, Briefcase, MessageSquare, Lock, Mic, Hammer, Repeat } from 'lucide-react';

const tabs: { id: TabState; label: string; icon: any; est: string }[] = [
  { id: 'why', label: 'Why it matters', icon: Activity, est: '2m' },
  { id: 'theory', label: 'Theory & Concepts', icon: BookOpen, est: '10m' },
  { id: 'visualizer', label: 'Visualizer', icon: Play, est: '15m' },
  { id: 'code', label: 'Code Lab', icon: Code, est: '20m' },
  { id: 'real-world', label: 'Real World', icon: Briefcase, est: '5m' },
  { id: 'interview', label: 'Interview Prep', icon: MessageSquare, est: '10m' },
  { id: 'feynman', label: 'Feynman Check', icon: Mic, est: '5m' },
  { id: 'build', label: 'Build Challenge', icon: Hammer, est: '30m' },
  { id: 'spaced-review', label: 'Spaced Review', icon: Repeat, est: '3m' },
];

export default function LessonNav() {
  const { activeTab, setActiveTab, completedTabs } = useTopicStore();

  return (
    <div className="w-64 border-r border-border bg-card/50 h-full p-4 flex flex-col gap-2 overflow-y-auto">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2 shrink-0">Learning Layers</h3>
      
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const isComplete = completedTabs[tab.id];
        const isLocked = tab.id === 'interview' && !completedTabs['code'];
        const Icon = isLocked ? Lock : tab.icon;

        return (
          <button
            key={tab.id}
            onClick={() => !isLocked && setActiveTab(tab.id)}
            disabled={isLocked}
            className={`
              flex items-center text-left w-full p-3 rounded-lg border transition-all
              ${isActive ? 'bg-background border-accent-java shadow-sm' : 'border-transparent hover:bg-muted'}
              ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className={`mr-3 ${isActive ? 'text-accent-java' : 'text-muted-foreground'}`}>
              <Icon size={18} />
            </div>
            <div className="flex-1">
              <div className={`text-sm font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                {tab.label}
              </div>
              <div className="text-xs text-muted-foreground opacity-70">
                Est: {tab.est}
              </div>
            </div>
            <div className="ml-2">
              {isComplete ? (
                <CheckCircle size={16} className="text-emerald-500" />
              ) : (
                <Circle size={16} className="text-muted-foreground/30" />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
