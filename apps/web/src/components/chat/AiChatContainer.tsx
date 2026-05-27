'use client';

import React, { useState } from 'react';
import { Bot, Sparkles } from 'lucide-react';
import { AiChatDrawer } from './AiChatDrawer';

interface AiChatContainerProps {
  topicSlug: string;
  topicTitle: string;
}

export function AiChatContainer({ topicSlug, topicTitle }: AiChatContainerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 p-4 bg-primary hover:bg-primary-hover text-white rounded-full shadow-lg shadow-blue-500/20 hover:scale-105 transition-all duration-300 z-40 flex items-center justify-center group"
          title="Ask AI Assistant"
        >
          <Sparkles className="w-6 h-6 absolute opacity-0 group-hover:opacity-100 group-hover:animate-ping" />
          <Bot className="w-6 h-6 group-hover:scale-90 transition-transform" />
        </button>
      )}

      {/* The Chat Drawer */}
      <AiChatDrawer
        topicSlug={topicSlug}
        topicTitle={topicTitle}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
