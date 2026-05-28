import React from 'react';

export interface MarkdownBlockItem {
  type: 'text' | 'code';
  content: string;
  language?: string;
  isStreaming?: boolean;
}

/**
 * Splits text into content blocks of either plain text/markdown or code snippets.
 * Correctly identifies unfinished blocks during real-time streaming.
 */
export function parseMarkdownBlocks(text: string): MarkdownBlockItem[] {
  const blocks: MarkdownBlockItem[] = [];
  let currentIndex = 0;

  while (currentIndex < text.length) {
    const nextCodeStart = text.indexOf('```', currentIndex);
    if (nextCodeStart === -1) {
      const textContent = text.slice(currentIndex);
      if (textContent) {
        blocks.push({ type: 'text', content: textContent });
      }
      break;
    }

    if (nextCodeStart > currentIndex) {
      blocks.push({ type: 'text', content: text.slice(currentIndex, nextCodeStart) });
    }

    const codeContentStart = nextCodeStart + 3;
    const nextCodeEnd = text.indexOf('```', codeContentStart);

    if (nextCodeEnd === -1) {
      // Stream is incomplete
      const rest = text.slice(codeContentStart);
      const lineBreakIndex = rest.indexOf('\n');
      let language = 'javascript';
      let code = rest;

      if (lineBreakIndex !== -1) {
        language = rest.slice(0, lineBreakIndex).trim();
        code = rest.slice(lineBreakIndex + 1);
      }

      blocks.push({
        type: 'code',
        content: code,
        language: language || 'javascript',
        isStreaming: true
      });
      break;
    }

    const fullCodeBlock = text.slice(codeContentStart, nextCodeEnd);
    const lineBreakIndex = fullCodeBlock.indexOf('\n');
    let language = 'javascript';
    let code = fullCodeBlock;

    if (lineBreakIndex !== -1) {
      language = fullCodeBlock.slice(0, lineBreakIndex).trim();
      code = fullCodeBlock.slice(lineBreakIndex + 1);
    }

    blocks.push({
      type: 'code',
      content: code,
      language: language || 'javascript'
    });

    currentIndex = nextCodeEnd + 3;
  }

  return blocks;
}

/**
 * Parses inline formatting tags: **bold**, *italic*, and `inline code`
 * and maps them directly to inline React elements.
 */
export function parseInlineText(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let index = 0;

  while (index < text.length) {
    const boldIdx = text.indexOf('**', index);
    const codeIdx = text.indexOf('`', index);
    const italicIdx = text.indexOf('*', index);

    const indices = [
      { type: 'bold', pos: boldIdx },
      { type: 'code', pos: codeIdx },
      { type: 'italic', pos: italicIdx }
    ].filter(x => x.pos !== -1).sort((a, b) => a.pos - b.pos);

    if (indices.length === 0) {
      parts.push(text.substring(index));
      break;
    }

    const closest = indices[0];
    if (closest.pos > index) {
      parts.push(text.substring(index, closest.pos));
    }

    if (closest.type === 'bold') {
      const endBold = text.indexOf('**', closest.pos + 2);
      if (endBold !== -1) {
        parts.push(
          <strong key={`bold-${closest.pos}`} className="font-semibold text-emerald-400">
            {text.substring(closest.pos + 2, endBold)}
          </strong>
        );
        index = endBold + 2;
      } else {
        parts.push('**');
        index = closest.pos + 2;
      }
    } else if (closest.type === 'code') {
      const endCode = text.indexOf('`', closest.pos + 1);
      if (endCode !== -1) {
        parts.push(
          <code key={`code-${closest.pos}`} className="px-1.5 py-0.5 rounded bg-[var(--theme-border)] text-rose-400 font-mono text-xs select-all">
            {text.substring(closest.pos + 1, endCode)}
          </code>
        );
        index = endCode + 1;
      } else {
        parts.push('`');
        index = closest.pos + 1;
      }
    } else { // italic
      const endItalic = text.indexOf('*', closest.pos + 1);
      if (endItalic !== -1) {
        parts.push(
          <em key={`ital-${closest.pos}`} className="italic text-[var(--theme-text-primary)]">
            {text.substring(closest.pos + 1, endItalic)}
          </em>
        );
        index = endItalic + 1;
      } else {
        parts.push('*');
        index = closest.pos + 1;
      }
    }
  }

  return parts;
}

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface TextBlockRendererProps {
  content: string;
}

export const TextBlockRenderer: React.FC<TextBlockRendererProps> = ({ content }) => {
  return (
    <div className="markdown-body text-[15px] leading-relaxed text-[var(--theme-text-primary)]">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        urlTransform={(value) => value}
        components={{
          h1: ({node, ...props}) => <h1 className="font-bold text-2xl mt-4 mb-2 tracking-tight" {...props} />,
          h2: ({node, ...props}) => <h2 className="font-semibold text-xl mt-4 mb-2 tracking-tight border-b border-[var(--theme-border)] pb-1" {...props} />,
          h3: ({node, ...props}) => <h3 className="font-medium text-lg mt-3 mb-1.5" {...props} />,
          h4: ({node, ...props}) => <h4 className="font-medium text-base mt-2.5 mb-1.5" {...props} />,
          p: ({node, ...props}) => <p className="mb-3 break-words" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc pl-6 my-2 space-y-1.5" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal pl-6 my-2 space-y-1.5" {...props} />,
          li: ({node, ...props}) => <li className="mb-1 leading-relaxed" {...props} />,
          a: ({node, ...props}) => <a className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
          strong: ({node, ...props}) => <strong className="font-semibold text-emerald-400" {...props} />,
          em: ({node, ...props}) => <em className="italic" {...props} />,
          img: ({node, ...props}) => <img className="rounded-xl max-w-full my-4 shadow-md object-contain max-h-[500px]" referrerPolicy="no-referrer" {...props} />,
          code: ({node, className, children, ...props}) => {
            const isInline = !className;
            return isInline ? (
              <code className="px-1.5 py-0.5 rounded bg-[var(--theme-border)] text-rose-400 font-mono text-xs select-all" {...props}>
                {children}
              </code>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          table: ({node, ...props}) => (
            <div className="overflow-x-auto my-6 rounded-xl shadow-md border border-[var(--theme-border)]" style={{ backgroundColor: 'var(--theme-code-bg)' }}>
              <table className="w-full text-left border-collapse text-sm" {...props} />
            </div>
          ),
          th: ({node, ...props}) => <th className="px-5 py-3.5 border-b-2 border border-[var(--theme-border)] font-bold uppercase tracking-wider text-[11px]" style={{ backgroundColor: 'var(--theme-surface)', color: 'var(--theme-text-primary)' }} {...props} />,
          td: ({node, ...props}) => <td className="px-5 py-3.5 border border-[var(--theme-border)] text-[var(--theme-text-primary)]" {...props} />,
          hr: ({node, ...props}) => <hr className="my-4 border-[var(--theme-border)]" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
