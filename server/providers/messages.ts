import type {
  HistoryMessage,
  OpenAIMessage,
  OpenAIContentBlock,
  AnthropicMessage,
  AnthropicContentBlock,
  GeminiContent,
  GeminiPart,
} from './types';
import { imagesToOpenAIContent, imagesToAnthropicContent } from './images';
import { parseBase64Image } from './images';

// ============================================================
// Gemini Message Formatting
// ============================================================

/**
 * Formats messages for the Gemini generative AI SDK.
 * Converts history + current message into the Gemini contents array format.
 * Ensures the first content entry has role 'user' (Gemini requirement).
 */
export function formatGeminiContents(
  message: string,
  images: string[],
  history: HistoryMessage[]
): GeminiContent[] {
  const contents: GeminiContent[] = [];

  if (history && Array.isArray(history)) {
    for (const msg of history) {
      const parts: GeminiPart[] = [];
      if (msg.images && Array.isArray(msg.images)) {
        for (const img of msg.images) {
          const parsed = parseBase64Image(img);
          if (parsed) {
            parts.push({ inlineData: { mimeType: parsed.mediaType, data: parsed.data } });
          }
        }
      }
      parts.push({ text: msg.text || '' });
      contents.push({ role: msg.role === 'user' ? 'user' : 'model', parts });
    }
  }

  // Gemini requires the first content to be from 'user'
  while (contents.length > 0 && contents[0].role !== 'user') {
    contents.shift();
  }

  const currentParts: GeminiPart[] = [];
  if (images && Array.isArray(images)) {
    for (const img of images) {
      const parsed = parseBase64Image(img);
      if (parsed) {
        currentParts.push({ inlineData: { mimeType: parsed.mediaType, data: parsed.data } });
      }
    }
  }
  currentParts.push({ text: message || '' });
  contents.push({ role: 'user', parts: currentParts });

  return contents;
}
// ============================================================
// OpenAI Message Formatting
// ============================================================

export function formatOpenAIMessages(
  message: string,
  images: string[],
  history: HistoryMessage[],
  systemInstruction?: string
): OpenAIMessage[] {
  const messages: OpenAIMessage[] = [];

  if (systemInstruction) {
    messages.push({ role: 'system', content: systemInstruction });
  }

  for (const entry of history) {
    messages.push(historyEntryToOpenAI(entry));
  }

  messages.push(currentMessageToOpenAI(message, images));

  return messages;
}

function historyEntryToOpenAI(entry: HistoryMessage): OpenAIMessage {
  const role = entry.role === 'user' ? 'user' : 'assistant';
  const hasImages = entry.images && entry.images.length > 0;

  if (hasImages) {
    const content: OpenAIContentBlock[] = [
      ...imagesToOpenAIContent(entry.images!),
      { type: 'text', text: entry.text || '' },
    ];
    return { role, content };
  }

  return { role, content: entry.text || '' };
}

function currentMessageToOpenAI(message: string, images: string[]): OpenAIMessage {
  const hasImages = images && images.length > 0;

  if (hasImages) {
    const content: OpenAIContentBlock[] = [
      ...imagesToOpenAIContent(images),
      { type: 'text', text: message || '' },
    ];
    return { role: 'user', content };
  }

  return { role: 'user', content: message || '' };
}

// ============================================================
// Anthropic Message Formatting
// ============================================================

export function formatAnthropicMessages(
  message: string,
  images: string[],
  history: HistoryMessage[]
): AnthropicMessage[] {
  const rawMessages: AnthropicMessage[] = [];

  for (const entry of history) {
    rawMessages.push(historyEntryToAnthropic(entry));
  }

  rawMessages.push(currentMessageToAnthropic(message, images));

  return mergeConsecutiveSameRole(rawMessages);
}

function historyEntryToAnthropic(entry: HistoryMessage): AnthropicMessage {
  const role = entry.role === 'user' ? 'user' : 'assistant';
  const hasImages = entry.images && entry.images.length > 0;

  if (hasImages) {
    const content: AnthropicContentBlock[] = [
      ...imagesToAnthropicContent(entry.images!),
      { type: 'text', text: entry.text || '' },
    ];
    return { role, content };
  }

  return { role, content: entry.text || '' };
}

function currentMessageToAnthropic(message: string, images: string[]): AnthropicMessage {
  const hasImages = images && images.length > 0;

  if (hasImages) {
    const content: AnthropicContentBlock[] = [
      ...imagesToAnthropicContent(images),
      { type: 'text', text: message || '' },
    ];
    return { role: 'user', content };
  }

  return { role: 'user', content: message || '' };
}

function mergeConsecutiveSameRole(messages: AnthropicMessage[]): AnthropicMessage[] {
  const merged: AnthropicMessage[] = [];

  for (const msg of messages) {
    if (merged.length === 0 && msg.role === 'assistant') {
      // Drop leading assistant messages
      continue;
    }

    const last = merged[merged.length - 1];

    if (last && last.role === msg.role) {
      last.content = [
        ...normalizeToContentBlocks(last.content),
        ...normalizeToContentBlocks(msg.content),
      ];
    } else {
      merged.push({ ...msg });
    }
  }

  return merged;
}

function normalizeToContentBlocks(
  content: string | AnthropicContentBlock[]
): AnthropicContentBlock[] {
  if (typeof content === 'string') {
    return [{ type: 'text', text: content }];
  }
  return content;
}
