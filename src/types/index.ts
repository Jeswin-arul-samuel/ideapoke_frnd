export interface GeneratedIdea {
  title: string;
  explanation: string;
  patent_trail: string[];
}

export interface AnalysisResponse {
  id: string;
  search_query: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  synthesis: Record<string, string[]> | null;
  generated_ideas: GeneratedIdea[] | null;
  created_at: string;
}

export interface AnalysisSummary {
  id: string;
  search_query: string;
  status: string;
  created_at: string;
}

export interface StatusUpdate {
  type: 'status' | 'complete' | 'error';
  agent?: string;
  message?: string;
  step?: number;
  session_id?: string;
}

export interface ApiKeys {
  openaiKey?: string;
  groqKey?: string;
}

export type MessageRole = 'user' | 'assistant' | 'status';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  ideas?: GeneratedIdea[];
  statusUpdates?: StatusUpdate[];
  timestamp: Date;
}
