export const PROVIDER_CONFIG = [
  { id: 'gemini', label: 'Gemini (Google Key)', placeholder: 'AbCdEf... (Overrides default built-in key)', shortName: 'Gemini (Google)' },
  { id: 'openrouter', label: 'OpenRouter API Key', placeholder: 'sk-or-v1-...', shortName: 'OpenRouter API' },
  { id: 'openai', label: 'OpenAI (GPT API Key)', placeholder: 'sk-proj-...', shortName: 'OpenAI (Direct)' },
  { id: 'deepseek', label: 'DeepSeek API Key', placeholder: 'sk-...', shortName: 'DeepSeek (Direct)' },
  { id: 'anthropic', label: 'Anthropic Key (Claude)', placeholder: 'sk-ant-...', shortName: 'Anthropic (Direct)' },
  { id: 'azure', label: 'Azure OpenAI Key', placeholder: 'abc123def456...', shortName: 'Azure AI (Unified)' }
] as const;

export type Provider = typeof PROVIDER_CONFIG[number]['id'];

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
