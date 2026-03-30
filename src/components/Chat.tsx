import { useCallback, useEffect, useRef, useState } from 'react';
import type { ApiKeys, ChatMessage, StatusUpdate, GeneratedIdea } from '../types';
import { useAnalysis } from '../hooks/useAnalysis';
import { useWebSocket } from '../hooks/useWebSocket';
import { AgentStatus } from './AgentStatus';
import { InputBar } from './InputBar';
import { MessageBubble } from './MessageBubble';

interface ChatProps {
  apiKeys: ApiKeys;
  onChangeKeys: () => void;
}

export function Chat({ apiKeys, onChangeKeys }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [wsSessionId, setWsSessionId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusUpdates, setStatusUpdates] = useState<StatusUpdate[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { startAnalysis, getAnalysis, sendFollowup } = useAnalysis(apiKeys);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(scrollToBottom, [messages, statusUpdates]);

  const handleStatusUpdate = useCallback((update: StatusUpdate) => {
    setStatusUpdates((prev) => [...prev, update]);
  }, []);

  const handleComplete = useCallback(async (completedSessionId: string) => {
    const result = await getAnalysis(completedSessionId);
    const ideas: GeneratedIdea[] = result.generated_ideas || [];

    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Based on analysis of **${result.search_query}** patents, here are future innovation ideas:`,
        ideas,
        timestamp: new Date(),
      },
    ]);
    setStatusUpdates([]);
    setIsProcessing(false);
    setWsSessionId(null);
  }, [getAnalysis]);

  const handleError = useCallback((message: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Error: ${message}`,
        timestamp: new Date(),
      },
    ]);
    setStatusUpdates([]);
    setIsProcessing(false);
    setWsSessionId(null);
  }, []);

  useWebSocket({
    sessionId: wsSessionId,
    apiKeys,
    onStatusUpdate: handleStatusUpdate,
    onComplete: handleComplete,
    onError: handleError,
  });

  async function handleSubmit(input: string) {
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: 'user', content: input, timestamp: new Date() },
    ]);

    if (!sessionId) {
      setIsProcessing(true);
      setStatusUpdates([]);
      const newSessionId = await startAnalysis(input);
      setSessionId(newSessionId);
      setWsSessionId(newSessionId);
    } else {
      setIsProcessing(true);
      let responseText = '';
      for await (const token of sendFollowup(sessionId, input)) {
        responseText += token;
      }
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'assistant', content: responseText, timestamp: new Date() },
      ]);
      setIsProcessing(false);
    }
  }

  function handleNewAnalysis() {
    setSessionId(null);
    setMessages([]);
    setStatusUpdates([]);
    setIsProcessing(false);
    setWsSessionId(null);
  }

  const provider = apiKeys.groqKey ? 'Groq' : 'OpenAI';

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">IdeaPoke — Patent Intelligence</h1>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
            {provider}
          </span>
          <button
            onClick={onChangeKeys}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Change API Key
          </button>
          {(sessionId || messages.length > 0) && (
            <button
              onClick={handleNewAnalysis}
              className="px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              New Analysis
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && !isProcessing && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
            <span className="text-4xl">💡</span>
            <p className="text-lg">Enter a research area to discover future innovations</p>
            <p className="text-sm">e.g., "Lithium Battery", "Solar Cells", "CRISPR Gene Editing"</p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isProcessing && statusUpdates.length > 0 && (
          <AgentStatus updates={statusUpdates} />
        )}

        {isProcessing && statusUpdates.length === 0 && (
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span>Starting analysis...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <InputBar
        onSubmit={handleSubmit}
        disabled={isProcessing}
        placeholder={
          sessionId
            ? 'Ask a follow-up question...'
            : 'Enter a research area (e.g., Lithium Battery)...'
        }
      />
    </div>
  );
}
