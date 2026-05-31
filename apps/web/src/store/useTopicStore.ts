import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TabState = 'why' | 'theory' | 'visualizer' | 'code' | 'real-world' | 'interview' | 'feynman' | 'build' | 'spaced-review';

interface TopicState {
  activeTab: TabState;
  completedTabsByTopic: Record<string, Partial<Record<TabState, boolean>>>;
  isAiDrawerOpen: boolean;
  setActiveTab: (tab: TabState) => void;
  markTabCompleted: (topicSlug: string, tab: TabState) => void;
  toggleAiDrawer: () => void;
}

export const useTopicStore = create<TopicState>()(
  persist(
    (set) => ({
      activeTab: 'why',
      completedTabsByTopic: {},
      isAiDrawerOpen: false,
      setActiveTab: (tab) => set({ activeTab: tab }),
      markTabCompleted: (topicSlug, tab) => set((state) => {
        const topicTabs = state.completedTabsByTopic[topicSlug] || {};
        return {
          completedTabsByTopic: {
            ...state.completedTabsByTopic,
            [topicSlug]: { ...topicTabs, [tab]: true }
          }
        };
      }),
      toggleAiDrawer: () => set((state) => ({ isAiDrawerOpen: !state.isAiDrawerOpen })),
    }),
    {
      name: 'devmastery-topic-progress',
      partialize: (state) => ({ completedTabsByTopic: state.completedTabsByTopic }),
    }
  )
);
