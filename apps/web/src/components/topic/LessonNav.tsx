'use client';

import React from 'react';
import { useTopicStore, TabState } from '@/store/useTopicStore';
import {
  CheckCircle2, Circle, Play, BookOpen, Code, Activity, Briefcase,
  MessageSquare, Lock, Mic, Hammer, Repeat,
} from 'lucide-react';

const tabs: { id: TabState; label: string; icon: any; est: string }[] = [
  { id: 'why',           label: 'Why it matters',   icon: Activity,       est: '2m'  },
  { id: 'theory',        label: 'Theory',           icon: BookOpen,       est: '10m' },
  { id: 'visualizer',    label: 'Visualizer',       icon: Play,           est: '15m' },
  { id: 'code',          label: 'Code lab',         icon: Code,           est: '20m' },
  { id: 'real-world',    label: 'Real world',       icon: Briefcase,      est: '5m'  },
  { id: 'interview',     label: 'Interview prep',   icon: MessageSquare,  est: '10m' },
  { id: 'feynman',       label: 'Feynman check',    icon: Mic,            est: '5m'  },
  { id: 'build',         label: 'Build challenge',  icon: Hammer,         est: '30m' },
  { id: 'spaced-review', label: 'Spaced review',    icon: Repeat,         est: '3m'  },
];

export default function LessonNav() {
  const { activeTab, setActiveTab, completedTabs } = useTopicStore();

  return (
    <div
      className="w-[260px] h-full p-4 flex flex-col gap-2 overflow-y-auto shrink-0 relative z-10"
      style={{
        background: 'rgba(8, 10, 16, 0.85)', // var(--bg-primary) with opacity
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(124, 143, 240, 0.15)',
        boxShadow: 'inset -10px 0 30px rgba(0,0,0,0.5)',
      }}
    >
      <div className="flex items-center gap-2 mb-4 px-1 shrink-0">
        <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-glow shadow-glow-sm" />
        <h3
          className="text-[10px] font-bold uppercase tracking-[0.2em] font-code"
          style={{ color: 'var(--accent)' }}
        >
          Mission Objectives
        </h3>
      </div>
      
      {/* Decorative vertical track line */}
      <div className="absolute left-[29px] top-[50px] bottom-10 w-[1px] bg-gradient-to-b from-accent/40 via-accent/10 to-transparent pointer-events-none" />

      {tabs.map((tab) => {
        const isActive   = activeTab === tab.id;
        const isComplete = !!completedTabs[tab.id];
        const isLocked   = tab.id === 'interview' && !completedTabs['code'];
        const Icon       = isLocked ? Lock : tab.icon;

        return (
          <button
            key={tab.id}
            onClick={() => !isLocked && setActiveTab(tab.id)}
            disabled={isLocked}
            className={`relative flex items-center gap-4 text-left w-full px-3 py-2.5 rounded-xl transition-all duration-300 group ${
              isActive ? 'scale-[1.02] bg-accent/10' : 'hover:bg-accent/5'
            }`}
            style={{
              cursor: isLocked ? 'not-allowed' : 'pointer',
              opacity: isLocked ? 0.4 : 1,
              border: '1px solid',
              borderColor: isActive ? 'rgba(124, 143, 240, 0.4)' : 'transparent',
              boxShadow: isActive ? '0 0 20px rgba(124, 143, 240, 0.15) inset, 0 4px 12px rgba(0,0,0,0.3)' : 'none',
            }}
          >
            {/* Glowing active indicator */}
            {isActive && (
              <div className="absolute -left-[2px] top-1/2 -translate-y-1/2 w-[3px] h-[60%] bg-accent rounded-r-md shadow-glow-sm" />
            )}
            
            <div className="relative shrink-0 flex items-center justify-center w-7 h-7 rounded-lg z-10"
                 style={{ 
                   background: isActive ? 'var(--bg-elevated)' : 'var(--bg-inset)',
                   border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border-strong)'}`,
                   boxShadow: isActive ? 'var(--shadow-glow)' : 'none',
                 }}>
              <Icon
                size={14}
                strokeWidth={isActive ? 2 : 1.5}
                style={{ color: isActive ? 'var(--accent)' : 'var(--text-muted)' }}
                className={isActive ? 'animate-pulse' : ''}
              />
            </div>
            
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div
                className={`text-[12px] uppercase tracking-wider font-code truncate transition-colors duration-300 ${
                  isActive ? 'text-white font-semibold' : 'text-zinc-400 font-medium'
                }`}
                style={{
                  textShadow: isActive ? '0 0 10px rgba(255,255,255,0.3)' : 'none',
                }}
              >
                {tab.label}
              </div>
              <div className="text-[10px] tabular-nums font-mono flex items-center gap-1.5" style={{ color: 'var(--accent)' }}>
                <span className="opacity-60">EST.</span>
                <span className="opacity-90">{tab.est}</span>
              </div>
            </div>
            
            <div className="shrink-0 relative flex items-center justify-center w-5 h-5 transition-transform duration-300"
                 style={{ transform: isActive ? 'scale(1.1)' : 'scale(1)' }}>
              {isComplete ? (
                <div className="absolute inset-0 bg-success/20 rounded-full animate-ping opacity-75" />
              ) : null}
              {isComplete ? (
                <CheckCircle2 size={16} className="relative z-10" style={{ color: 'var(--success)', filter: 'drop-shadow(0 0 4px rgba(98, 201, 122, 0.6))' }} />
              ) : (
                <Circle size={14} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
