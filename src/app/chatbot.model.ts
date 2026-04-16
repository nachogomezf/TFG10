export interface ChatDocument {
  page_content?: string;
  content?: string;
  metadata?: Record<string, unknown>;
  source?: string;
  title?: string;
  [key: string]: unknown;
}

export interface ChatApiResponse {
  question: string;
  generation: string;
  context: string;
  documents: ChatDocument[] | string[];
}

export interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
  documents?: ChatDocument[] | string[];
  context?: string;
  loading?: boolean;
  error?: boolean;
}
