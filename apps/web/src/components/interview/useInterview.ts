import { useState, useEffect, useRef, useCallback } from 'react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function useInterview(topicSlug: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  const recognitionRef = useRef<any>(null);

  // Initialize Interview Session
  useEffect(() => {
    const initSession = async () => {
      try {
        const response = await fetch(`http://localhost:8084/v1/ai/interview/start?topicSlug=${topicSlug}`, {
          method: 'POST',
        });
        if (response.ok) {
          const data = await response.json();
          setSessionId(data.id);
        }
      } catch (error) {
        console.error("Failed to start interview session:", error);
      } finally {
        setIsInitializing(false);
      }
    };
    initSession();
  }, [topicSlug]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
           submitMessage(finalTranscript);
           stopRecording();
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        stopRecording();
      };
    }
  }, [sessionId]);

  const startRecording = () => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.start();
      setIsRecording(true);
      // Cancel any ongoing AI speech so they don't overlap
      window.speechSynthesis.cancel();
    } catch (e) {
      console.error(e);
    }
  };

  const stopRecording = () => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
      setIsRecording(false);
    } catch (e) {
      console.error(e);
    }
  };

  const submitMessage = async (text: string) => {
    if (!text.trim() || !sessionId) return;
    
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);

    const assistantMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: assistantMsgId, role: 'assistant', content: '' }]);

    try {
      const response = await fetch('http://localhost:8084/v1/ai/interview/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: text })
      });

      if (!response.body) throw new Error('No response body');
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullAssistantMessage = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            const decodedData = data.replace(/\\n/g, '\n');
            fullAssistantMessage += decodedData;
            
            setMessages(prev => 
              prev.map(m => 
                m.id === assistantMsgId ? { ...m, content: fullAssistantMessage } : m
              )
            );
          }
        }
      }

      speak(fullAssistantMessage);
    } catch (error) {
      console.error("Error streaming response", error);
    }
  };

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    
    // Simple preprocessing to remove markdown that sounds weird
    const cleanText = text.replace(/[*_#`]/g, '');
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Attempt to find a natural sounding English voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.includes('en') && (v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Natural')));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const endInterview = async () => {
    if (!sessionId) return;
    try {
      await fetch(`http://localhost:8084/v1/ai/interview/${sessionId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messages)
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Pre-load voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  return {
    messages,
    isRecording,
    isSpeaking,
    isInitializing,
    startRecording,
    stopRecording,
    endInterview
  };
}
