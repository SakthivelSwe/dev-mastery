import { useState, useCallback, useRef } from 'react';

const AI_API = process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:8084';

export interface ChatMessage {
  role:    'user' | 'ai';
  content: string;
}

interface UseAiChatOptions {
  topicSlug?:   string;
  sectionType?: string;
  initialMessage?: string;
}

/**
 * useAiChat — Real SSE streaming hook for the AI assistant.
 *
 * Connects to ai-bot-service via ReadableStream (fetch SSE),
 * streams tokens in real-time, and reconstructs escaped newlines
 * from the server's "\\n" encoding back to actual newlines.
 */
export function useAiChat(options: UseAiChatOptions = {}) {
  const { topicSlug = 'general', sectionType, initialMessage } = options;

  const [messages, setMessages] = useState<ChatMessage[]>(
    initialMessage
      ? [{ role: 'ai', content: initialMessage }]
      : []
  );
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (userText: string) => {
    if (!userText.trim() || isLoading) return;

    // Cancel any in-flight request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    // Add user message + empty AI placeholder
    setMessages(prev => [
      ...prev,
      { role: 'user', content: userText },
      { role: 'ai',   content: '' },
    ]);
    setIsLoading(true);

    try {
      const response = await fetch(`${AI_API}/v1/ai/chat`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          message:     userText,
          topicSlug,
          sectionType: sectionType ?? null,
        }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (!response.body) throw new Error('No response body');

      const reader  = response.body.getReader();
      const decoder = new TextDecoder();
      let   buffer  = '';

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE lines
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? ''; // Keep incomplete last line in buffer

        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          const token = line.slice(5); // Remove "data: " prefix
          if (!token || token === '[DONE]') continue;

          // Server escapes newlines as \\n — restore them
          const text = token.replace(/\\n/g, '\n');

          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              content: updated[updated.length - 1].content + text,
            };
            return updated;
          });
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return; // User cancelled — silent

      console.error('[useAiChat] Error:', err);
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          content: "I'm having trouble connecting right now. Please check that the AI service is running and try again.",
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  }, [topicSlug, sectionType, isLoading]);

  const clearMessages = useCallback(() => {
    abortRef.current?.abort();
    setMessages(initialMessage ? [{ role: 'ai', content: initialMessage }] : []);
  }, [initialMessage]);

  return { messages, sendMessage, clearMessages, isLoading };
}

// ─── Feynman Scoring Hook ─────────────────────────────────────

export interface FeynmanScore {
  score:    number;
  feedback: string;
  gaps:     string[];
  passed:   boolean;
}

export function useFeynmanScore() {
  const [result, setResult]   = useState<FeynmanScore | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const score = useCallback(async (topicSlug: string, topicTitle: string, explanation: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${AI_API}/v1/ai/feynman/score`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ topicSlug, topicTitle, explanation }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: FeynmanScore = await res.json();
      setResult(data);
      return data;
    } catch (err: any) {
      const msg = 'Could not reach the AI scoring service. Please try again.';
      setError(msg);

      // Return a graceful mock score so UI doesn't break
      const fallback: FeynmanScore = {
        score: 5, passed: false,
        feedback: msg,
        gaps: ['AI service unavailable'],
      };
      setResult(fallback);
      return fallback;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { score, result, isLoading, error };
}
