'use client';

import React, { useState } from 'react';
import { useTopicStore } from '@/store/useTopicStore';
import { useAuthStore } from '@/store/useAuthStore';
import LessonNav from './LessonNav';
import { Bot, ChevronRight, Check } from 'lucide-react';
import VisualizerShell from '../visualizer/VisualizerShell';
import CodeEditorShell from '@/components/code/CodeEditorShell';
import QuizView from '@/components/quiz/QuizView';
import FeynmanCheckPanel from './FeynmanCheckPanel';
import BuildChallengePanel from './BuildChallengePanel';
import SpacedReviewWidget from './SpacedReviewWidget';
import { useAiChat } from '@/hooks/useAiChat';

export default function TopicPage({ topicSlug }: { topicSlug: string }) {
  const { activeTab, isAiDrawerOpen, toggleAiDrawer, markTabCompleted } = useTopicStore();
  const { user } = useAuthStore();
  const { messages, sendMessage, isLoading } = useAiChat();
  const [chatInput, setChatInput] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);

  const handleMarkComplete = async () => {
    setIsCompleting(true);
    try {
      if (user) {
        await fetch('http://localhost:8083/v1/progress/complete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': user.id
          },
          body: JSON.stringify({
            lessonId: '00000000-0000-0000-0000-000000000001', // Mock lesson ID
            topicId: '00000000-0000-0000-0000-000000000000', // Mock topic ID
            timeSpentSecs: 120
          })
        });
      }
      markTabCompleted(activeTab);
    } catch (e) {
      console.error(e);
    } finally {
      setIsCompleting(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'why':
        return (
          <div className="prose prose-invert max-w-3xl">
            <h1 className="font-syne text-4xl mb-6">Why learn Binary Search Trees?</h1>
            <p className="text-lg text-muted-foreground">
              Arrays are slow for insertion (O(n)). Hash maps are unordered. Binary Search Trees (BST) 
              bridge this gap by providing O(log n) time for both search and insertion while maintaining sorted order.
            </p>
          </div>
        );
      case 'visualizer':
        return <VisualizerShell topicSlug={topicSlug} />;
      case 'theory':
        return (
          <div className="h-full overflow-y-auto pb-20">
            <div className="prose prose-invert max-w-3xl mb-12">
              <h2 className="font-syne text-3xl mb-6">Theory & Concepts</h2>
              <p className="text-lg text-muted-foreground">
                A Binary Search Tree (BST) is a node-based binary tree data structure which has the following properties:
              </p>
              <ul>
                <li>The left subtree of a node contains only nodes with keys lesser than the node's key.</li>
                <li>The right subtree of a node contains only nodes with keys greater than the node's key.</li>
                <li>The left and right subtree each must also be a binary search tree.</li>
              </ul>
            </div>
            <QuizView />
          </div>
        );
      case 'code':
      case 'real-world':
      case 'interview':
        return (
          <>
            {activeTab === 'code' && (
              <div className="h-full">
                <CodeEditorShell />
              </div>
            )}
            {activeTab !== 'code' && (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                {activeTab} content goes here
              </div>
            )}
          </>
        );
      case 'feynman':
        return <FeynmanCheckPanel />;
      case 'build':
        return <BuildChallengePanel />;
      case 'spaced-review':
        return <SpacedReviewWidget />;
      default:
        return (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            {activeTab} content goes here
          </div>
        );
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden">
      {/* Sidebar Navigation */}
      <LessonNav />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative bg-background">
        
        {/* Topic Header */}
        <div className="h-14 border-b border-border flex items-center px-6 justify-between bg-card/30">
          <div className="flex items-center text-sm text-muted-foreground">
            <span>DSA Mastery</span>
            <ChevronRight size={14} className="mx-2" />
            <span className="text-foreground font-medium capitalize">{topicSlug.replace('-', ' ')}</span>
          </div>
          <button 
            onClick={toggleAiDrawer}
            className="flex items-center gap-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border border-indigo-500/20"
          >
            <Bot size={16} />
            Ask Gemini AI
          </button>
        </div>

        {/* Dynamic Content Pane */}
        <div className="flex-1 overflow-auto p-6">
          {renderContent()}
        </div>

        {/* Footer Action */}
        <div className="h-16 border-t border-border flex items-center justify-between px-6 bg-card/50">
          <button className="text-sm text-muted-foreground hover:text-foreground px-4 py-2">
            Previous Lesson
          </button>
          <button 
            onClick={handleMarkComplete}
            disabled={isCompleting}
            className="bg-accent-java text-white px-6 py-2 rounded-md text-sm font-bold flex items-center gap-2 hover:bg-[#d8841a] transition-colors disabled:opacity-50"
          >
            {isCompleting ? 'Saving...' : 'Mark as Complete'} <Check size={16} />
          </button>
        </div>
      </div>

      {/* AI Bot Drawer */}
      {isAiDrawerOpen && (
        <div className="w-80 border-l border-border bg-card flex flex-col shadow-xl">
          <div className="h-14 border-b border-border flex items-center px-4 justify-between bg-indigo-500/5">
            <div className="flex items-center gap-2 text-indigo-400 font-medium">
              <Bot size={18} /> AI Assistant
            </div>
            <button onClick={toggleAiDrawer} className="text-muted-foreground hover:text-foreground">×</button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 text-sm">
            {messages.map((msg, i) => (
              <div key={i} className={`p-3 rounded-lg border ${msg.role === 'ai' ? 'bg-muted text-muted-foreground' : 'bg-indigo-500/10 text-indigo-100 border-indigo-500/20 self-end'}`}>
                {msg.content}
              </div>
            ))}
            {isLoading && <div className="text-muted-foreground italic">Thinking...</div>}
          </div>
          <div className="p-4 border-t border-border">
            <input 
              type="text" 
              placeholder="Ask a question..." 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  sendMessage(chatInput);
                  setChatInput('');
                }
              }}
              className="w-full bg-background border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}
