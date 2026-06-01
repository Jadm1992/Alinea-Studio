import React from 'react';
import { parseMarkdownBlocks, TextBlockRenderer } from '../utils/markdownParser';
import { CodeBlock } from './CodeBlock';

interface RenderedMarkdownProps {
  text: string;
}

export const RenderedMarkdown: React.FC<RenderedMarkdownProps> = ({ text }) => {
  return (
    <div className="space-y-4">
      {parseMarkdownBlocks(text).map((block, idx) => {
        if (block.type === 'code') {
          return (
            <CodeBlock
              key={`cb-${idx}`}
              code={block.content}
              language={block.language || 'javascript'}
            />
          );
        } else {
          return <TextBlockRenderer key={`tb-${idx}`} content={block.content} />;
        }
      })}
    </div>
  );
};
