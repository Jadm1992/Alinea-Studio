// ============================================================
// API Keys & Configuration
// ============================================================

export interface ApiKeys {
  gemini?: string;
  openrouter?: string;
  openai?: string;
  deepseek?: string;
  anthropic?: string;
}

export interface ProviderConfig {
  prefix?: string;
  modelPrefix?: string;
  defaultEndpoint: string;
  apiKeyEnvVar?: string;
  extractModel: (model: string) => string;
}

export interface ProviderDetails {
  provider: string;
  cleanModel: string;
  apiKey: string;
  endpoint: string;
}

// ============================================================
// Message Types
// ============================================================

export interface HistoryMessage {
  role: 'user' | 'assistant';
  text?: string;
  images?: string[];
}

export interface OpenAIContentBlock {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: { url: string };
}

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | OpenAIContentBlock[];
}

export interface AnthropicContentBlock {
  type: 'text' | 'image';
  text?: string;
  source?: {
    type: 'base64';
    media_type: string;
    data: string;
  };
}

export interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string | AnthropicContentBlock[];
}

// ============================================================
// Gemini Types
// ============================================================

export interface GeminiInlineData {
  mimeType: string;
  data: string;
}

export interface GeminiPart {
  text?: string;
  inlineData?: GeminiInlineData;
}

export interface GeminiContent {
  role: 'user' | 'model';
  parts: GeminiPart[];
}

// ============================================================
// Image Parsing
// ============================================================

export interface ParsedBase64Image {
  mediaType: string;
  data: string;
}
