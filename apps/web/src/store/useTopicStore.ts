import { create } from 'zustand';

export type TabState = 'why' | 'theory' | 'visualizer' | 'code' | 'system-design' | 'real-world' | 'interview' | 'feynman' | 'build' | 'spaced-review';

interface TopicState {
  activeTab: TabState;
  completedTabs: Record<TabState, boolean>;
  isAiDrawerOpen: boolean;
  setActiveTab: (tab: TabState) => void;
  markTabCompleted: (tab: TabState) => void;
  toggleAiDrawer: () => void;
}

export const useTopicStore = create<TopicState>((set) => ({
  activeTab: 'why',
  completedTabs: {
    'why': false,
    'theory': false,
    'visualizer': false,
    'code': false,
    'system-design': false,
    'real-world': false,
    'interview': false,
    'feynman': false,
    'build': false,
    'spaced-review': false,
  },
  isAiDrawerOpen: false,
  setActiveTab: (tab) => set({ activeTab: tab }),
  markTabCompleted: (tab) => set((state) => ({
    completedTabs: {
      ...state.completedTabs,
      [tab]: true
    }
  })),
  toggleAiDrawer: () => set((state) => ({ isAiDrawerOpen: !state.isAiDrawerOpen })),
}));
