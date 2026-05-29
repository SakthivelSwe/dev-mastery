import { useState, useCallback, useRef, useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { v4 as uuidv4 } from 'uuid';

const EXECUTION_API = process.env.NEXT_PUBLIC_EXECUTION_API_URL || 'http://localhost:8085';

export interface CodeExecutionResult {
  stdout: string | null;
  stderr: string | null;
  compileOutput: string | null;
  message: string | null;
  statusId: number | null;
  statusDescription: string | null;
  time: number | null;
  memory: number | null;
}

export function useCodeExecution() {
  const [result, setResult] = useState<CodeExecutionResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const stompClient = useRef<Client | null>(null);

  useEffect(() => {
    // Generate a unique session ID on mount
    const id = uuidv4();
    setSessionId(id);

    // Initialize STOMP client over WebSocket (SockJS fallback not used directly by new stompjs for ws, but we use webstomp)
    // Actually, spring boot exposes /ws/execute as a STOMP endpoint. 
    // We can use standard WebSocket.
    const wsUrl = EXECUTION_API.replace(/^http/, 'ws') + '/ws/execute';
    
    const client = new Client({
      brokerURL: wsUrl,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('Connected to Execution Service STOMP');
        // Subscribe to results for this specific session
        client.subscribe(`/topic/execution/${id}`, (message) => {
          if (message.body) {
            const data: CodeExecutionResult = JSON.parse(message.body);
            setResult(data);
            setIsExecuting(false);
          }
        });
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
        setIsExecuting(false);
      },
    });

    // Handle sockjs if ws is not supported or behind proxy (Fallback)
    if (typeof WebSocket !== 'function') {
        client.webSocketFactory = () => new SockJS(`${EXECUTION_API}/ws/execute`);
    }

    client.activate();
    stompClient.current = client;

    return () => {
      client.deactivate();
    };
  }, []);

  const executeCode = useCallback((sourceCode: string, languageId: number, stdin?: string) => {
    if (!stompClient.current || !stompClient.current.connected) {
      console.error('STOMP client is not connected');
      // Set an error result locally if unconnected
      setResult({
        stdout: null, stderr: null, compileOutput: null,
        message: 'Disconnected from execution service',
        statusId: 500, statusDescription: 'Connection Error', time: null, memory: null
      });
      return;
    }

    setIsExecuting(true);
    setResult(null);

    // Send the execution request
    stompClient.current.publish({
      destination: `/app/execute/${sessionId}`,
      body: JSON.stringify({
        sourceCode,
        languageId,
        stdin: stdin || ''
      }),
    });
  }, [sessionId]);

  return { executeCode, result, isExecuting };
}
