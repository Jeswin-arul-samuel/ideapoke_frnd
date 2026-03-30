import { useEffect, useRef, useState } from 'react';
import type { ApiKeys, StatusUpdate } from '../types';

interface UseWebSocketOptions {
  sessionId: string | null;
  apiKeys: ApiKeys;
  onStatusUpdate: (update: StatusUpdate) => void;
  onComplete: (sessionId: string) => void;
  onError: (message: string) => void;
}

export function useWebSocket({ sessionId, apiKeys, onStatusUpdate, onComplete, onError }: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const onStatusUpdateRef = useRef(onStatusUpdate);
  const onCompleteRef = useRef(onComplete);
  const onErrorRef = useRef(onError);
  const apiKeysRef = useRef(apiKeys);
  onStatusUpdateRef.current = onStatusUpdate;
  onCompleteRef.current = onComplete;
  onErrorRef.current = onError;
  apiKeysRef.current = apiKeys;

  useEffect(() => {
    if (!sessionId) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws/analysis/${sessionId}`);

    ws.onopen = () => {
      setIsConnected(true);
      // Send API keys as first message — backend expects this
      ws.send(JSON.stringify({
        openai_key: apiKeysRef.current.openaiKey || null,
        groq_key: apiKeysRef.current.groqKey || null,
      }));
    };

    ws.onmessage = (event) => {
      const data: StatusUpdate = JSON.parse(event.data);
      if (data.type === 'status') {
        onStatusUpdateRef.current(data);
      } else if (data.type === 'complete') {
        onCompleteRef.current(data.session_id!);
      } else if (data.type === 'error') {
        onErrorRef.current(data.message || 'Unknown error');
      }
    };

    ws.onclose = () => setIsConnected(false);
    ws.onerror = () => onErrorRef.current('WebSocket connection failed');
    wsRef.current = ws;

    return () => { ws.close(); };
  }, [sessionId]);

  return { isConnected };
}
