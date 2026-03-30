import { useState } from 'react';
import type { AnalysisResponse, AnalysisSummary, ApiKeys } from '../types';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';
const API_BASE = `${BACKEND_URL}/api`;

function getApiHeaders(apiKeys: ApiKeys): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (apiKeys.openaiKey) headers['X-OpenAI-Key'] = apiKeys.openaiKey;
  if (apiKeys.groqKey) headers['X-Groq-Key'] = apiKeys.groqKey;
  return headers;
}

export function useAnalysis(apiKeys: ApiKeys) {
  const [isLoading, setIsLoading] = useState(false);

  async function startAnalysis(query: string, previousSessionId?: string): Promise<string> {
    setIsLoading(true);
    const response = await fetch(`${API_BASE}/analysis`, {
      method: 'POST',
      headers: getApiHeaders(apiKeys),
      body: JSON.stringify({ query, previous_session_id: previousSessionId }),
    });
    const data = await response.json();
    setIsLoading(false);
    return data.session_id;
  }

  async function getAnalysis(sessionId: string): Promise<AnalysisResponse> {
    const response = await fetch(`${API_BASE}/analysis/${sessionId}`);
    return response.json();
  }

  async function listAnalyses(): Promise<AnalysisSummary[]> {
    const response = await fetch(`${API_BASE}/analyses`);
    return response.json();
  }

  async function* sendFollowup(sessionId: string, question: string): AsyncGenerator<string> {
    const response = await fetch(`${API_BASE}/followup`, {
      method: 'POST',
      headers: getApiHeaders(apiKeys),
      body: JSON.stringify({ session_id: sessionId, question }),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    if (!reader) return;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const text = decoder.decode(value);
      const lines = text.split('\n').filter(line => line.startsWith('data: '));
      for (const line of lines) {
        const data = line.slice(6);
        if (data === '[DONE]') return;
        try {
          const parsed = JSON.parse(data);
          yield parsed.token;
        } catch { /* skip malformed */ }
      }
    }
  }

  return { startAnalysis, getAnalysis, listAnalyses, sendFollowup, isLoading };
}
