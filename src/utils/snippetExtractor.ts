import { CodeSnippet } from '../types';
import { getExtension } from './fileExtensions';

/**
 * Scans markdown text and automatically registers generated code segments
 * as virtual workspace files.
 */
export function extractCodeSnippets(text: string, messageId: string): CodeSnippet[] {
  const snippets: CodeSnippet[] = [];
  const regex = /```(\w*)\n([\s\S]*?)```/g;
  let match;
  let index = 1;

  while ((match = regex.exec(text)) !== null) {
    const rawLang = match[1] || 'plaintext';
    const code = match[2].trim();

    const language = rawLang.trim().toLowerCase();
    const extension = getExtension(language);

    // Formulate clean file descriptor names
    const title = `module_${index}.${extension}`;

    snippets.push({
      id: `${messageId}-snippet-${index}`,
      code: code,
      language: language,
      title: title,
      messageId: messageId
    });

    index++;
  }

  return snippets;
}


