import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TabState = 'why' | 'theory' | 'visualizer' | 'code' | 'real-world' | 'interview' | 'feynman' | 'build' | 'spaced-review';

const EMPTY_TABS: Record<TabState, boolean> = {
  'why':           false,
  'theory':        false,
  'visualizer':    false,
  'code':          false,
  'real-world':    false,
  'interview':     false,
  'feynman':       false,
  'build':         false,
  'spaced-review': false,
};

interface TopicState {
  activeTab: TabState;
  /**
   * Persisted map: topicSlug → TabState → boolean
   * Keyed per topic so completing HTML tabs doesn't affect CSS tabs.
   */
  completionsByTopic: Record<string, Record<TabState, boolean>>;
  isAiDrawerOpen: boolean;
  /** The topic currently open (set by TopicPage on mount). */
  currentTopic: string;
  setCurrentTopic: (slug: string) => void;
  setActiveTab: (tab: TabState) => void;
  markTabCompleted: (tab: TabState) => void;
  toggleAiDrawer: () => void;
}

export const useTopicStore = create<TopicState>()(
  persist(
    (set, get) => ({
      activeTab:          'why',
      completionsByTopic: {},
      isAiDrawerOpen:     false,
      currentTopic:       '',

      setCurrentTopic: (slug) => {
        // Initialise blank entry for a topic we haven't seen before.
        set((state) => ({
          currentTopic: slug,
          completionsByTopic: state.completionsByTopic[slug]
            ? state.completionsByTopic
            : { ...state.completionsByTopic, [slug]: { ...EMPTY_TABS } },
        }));
      },

      setActiveTab: (tab) => set({ activeTab: tab }),

      markTabCompleted: (tab) =>
        set((state) => {
          const slug = state.currentTopic;
          const current = state.completionsByTopic[slug] ?? { ...EMPTY_TABS };
          return {
            completionsByTopic: {
              ...state.completionsByTopic,
              [slug]: { ...current, [tab]: true },
            },
          };
        }),

      toggleAiDrawer: () =>
        set((state) => ({ isAiDrawerOpen: !state.isAiDrawerOpen })),
    }),
    {
      name:    'devmastery-topic-progress', // localStorage key
      version: 1,
      // Only persist the completion data and current topic — don't persist
      // transient UI state like activeTab or the AI drawer.
      partialize: (state) => ({
        completionsByTopic: state.completionsByTopic,
        currentTopic:       state.currentTopic,
      }),
    },
  ),
);
