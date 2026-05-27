import { useState } from 'react';

export function useAiChat() {
  const [messages, setMessages] = useState<{role: 'user' | 'ai', content: string}[]>([
    { role: 'ai', content: "Hello! I am DevMastery's AI assistant, powered by Gemini. Ask me anything about Binary Search Trees!" }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    setMessages(prev => [...prev, { role: 'user', content: message }]);
    setIsLoading(true);
    setMessages(prev => [...prev, { role: 'ai', content: '' }]); // Placeholder for streaming response

    try {
      const response = await fetch('http://localhost:8084/v1/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          topicId: '00000000-0000-0000-0000-000000000000' // mock topic ID
        }),
      });

      if (!response.ok) throw new Error('Network error');
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) throw new Error('No reader available');

      let currentReply = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        // Spring WebFlux SSE returns chunks starting with "data:"
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data:')) {
            const data = line.substring(5).trim();
            if (data) {
              currentReply += data + ' ';
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].content = currentReply;
                return newMessages;
              });
            }
          }
        }
      }
    } catch (error) {
      console.error("AI Chat Error:", error);
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].content = "Sorry, I'm having trouble connecting right now.";
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, sendMessage, isLoading };
}
