import type {
  HistoryMessage,
  OpenAIMessage,
  OpenAIContentBlock,
  AnthropicMessage,
  AnthropicContentBlock,
} from './types';
import { imagesToOpenAIContent, imagesToAnthropicContent } from './images';

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
