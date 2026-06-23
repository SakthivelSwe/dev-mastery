'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, User, Sparkles, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AiChatDrawerProps {
  topicSlug: string;
  topicTitle: string;
  sectionType?: string;
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'ai';
  content: string;
  isStreaming?: boolean;
}

export function AiChatDrawer({ topicSlug, topicTitle, sectionType, isOpen, onClose }: AiChatDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: `Hello! I'm your DevMastery AI assistant. Ask me anything about **${topicTitle}**!` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsTyping(true);

    try {
      // Add empty AI message that will be streamed into
      setMessages(prev => [...prev, { role: 'ai', content: '', isStreaming: true }]);

      // NOTE: We connect to the backend ai-bot-service directly (port 8084)
      const API_BASE = process.env.NEXT_PUBLIC_AI_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const response = await fetch(`${API_BASE}/v1/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Assuming the user has a JWT, it should be passed here in a real scenario
        },
        body: JSON.stringify({
          message: userMessage,
          topicSlug,
          sectionType
        })
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to connect to AI service');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.substring(6).replace(/\\n/g, '\n');
            if (data.trim() === '[DONE]') continue;
            aiContent += data;
            
            // Update the last message
            setMessages(prev => {
              const newMessages = [...prev];
              newMessages[newMessages.length - 1] = {
                role: 'ai',
                content: aiContent,
                isStreaming: true
              };
              return newMessages;
            });
          }
        }
      }
      
      // Mark as finished streaming
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          role: 'ai',
          content: aiContent,
          isStreaming: false
        };
        return newMessages;
      });
      
    } catch (error: any) {
      console.error('Chat error:', error);
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          role: 'ai',
          content: 'Sorry, I encountered an error connecting to my brain. Please try again later.',
          isStreaming: false
        };
        return newMessages;
      });
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[400px] bg-background border-l border-border shadow-2xl flex flex-col z-50 transform transition-transform duration-300">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-card">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">DevMastery AI</h3>
            <p className="text-xs text-text-secondary">{topicTitle}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-text-secondary hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary' : 'bg-card border border-border'}`}>
              {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-blue-400" />}
            </div>
            <div className={`max-w-[80%] rounded-2xl p-3 ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-card border border-border text-text-primary rounded-tl-none prose prose-invert prose-sm'}`}>
              {msg.role === 'user' ? (
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              ) : (
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              )}
              {msg.isStreaming && <span className="inline-block w-2 h-4 ml-1 bg-blue-400 animate-pulse" />}
            </div>
          </div>
        ))}
        {isTyping && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 text-blue-400" />
            </div>
            <div className="bg-card border border-border rounded-2xl rounded-tl-none p-4 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
              <span className="text-sm text-text-secondary">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 bg-background border border-border rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
