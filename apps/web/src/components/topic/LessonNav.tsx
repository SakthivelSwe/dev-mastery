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
      className="w-60 h-full p-3 flex flex-col gap-0.5 overflow-y-auto border-r shrink-0"
      style={{
        background: 'var(--bg-surface)',
        borderColor: 'var(--border-default)',
      }}
    >
      <h3
        className="text-[11px] font-semibold uppercase tracking-widest mb-2 px-2 shrink-0"
        style={{ color: 'var(--text-muted)' }}
      >
        Learning layers
      </h3>

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
            className="flex items-center gap-3 text-left w-full px-2.5 py-2 rounded-md transition-all group"
            style={{
              background: isActive ? 'var(--bg-elevated)' : 'transparent',
              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              cursor: isLocked ? 'not-allowed' : 'pointer',
              opacity: isLocked ? 0.5 : 1,
              border: '1px solid transparent',
              borderColor: isActive ? 'var(--border-default)' : 'transparent',
            }}
            onMouseEnter={(e) => {
              if (!isActive && !isLocked) {
                e.currentTarget.style.background = 'var(--bg-elevated)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive && !isLocked) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }
            }}
          >
            <Icon
              size={15}
              strokeWidth={1.75}
              style={{ color: isActive ? 'var(--accent)' : 'var(--text-muted)' }}
              className="shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div
                className="text-[13px] font-medium truncate"
                style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}
              >
                {tab.label}
              </div>
              <div className="text-[10.5px] tabular-nums" style={{ color: 'var(--text-muted)' }}>
                Est. {tab.est}
              </div>
            </div>
            <div className="shrink-0">
              {isComplete ? (
                <CheckCircle2 size={14} style={{ color: 'var(--success)' }} />
              ) : (
                <Circle size={13} style={{ color: 'var(--text-muted)', opacity: 0.35 }} />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
