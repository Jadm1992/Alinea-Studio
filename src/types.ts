export interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  images?: string[];
  modelUsed?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  model: string;
  systemInstruction?: string;
  temperature?: number;
  createdAt: string;
}

export interface CodeSnippet {
  id: string;
  code: string;
  language: string;
  title: string;
  messageId: string;
}

export interface ModelOption {
  id: string;
  name: string;
  description: string;
  isPaid: boolean;
  badge: string;
}
