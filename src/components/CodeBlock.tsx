import React, { useState } from 'react';
import { highlightCode } from '../utils/highlighter';
import { getExtension } from '../utils/fileExtensions';
import { Clipboard, Check, HardDriveDownload, FolderPlus, ChevronUp, ChevronDown, Code } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language: string;
  onAddToWorkspace?: (code: string, language: string) => void;
  isWorkspaceCopy?: boolean;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language,
  onAddToWorkspace,
  isWorkspaceCopy = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [added, setAdded] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const langNormalized = language || 'javascript';
  const highlighted = highlightCode(code, langNormalized);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleSaveFile = () => {
    try {
      const extension = getExtension(langNormalized);
      const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `snippet_${Date.now()}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failure:', err);
    }
  };

  const handleAddToWorkspace = () => {
    if (onAddToWorkspace) {
      onAddToWorkspace(code, langNormalized);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };


  return (
    <div className="my-4 rounded-xl overflow-hidden shadow-2xl flex flex-col border border-[var(--theme-border)]" style={{ backgroundColor: 'var(--theme-code-bg)' }}>
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-2.5 select-none" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
        <div className="flex items-center gap-1.5 hover:opacity-100 opacity-80 transition-opacity">
          <Code className="w-4 h-4" style={{ color: 'var(--theme-text-muted)' }} />
          <span className="text-sm font-medium tracking-wide ml-1" style={{ color: 'var(--theme-text-muted)' }}>
            Code
          </span>
        </div>
        <div className="flex items-center gap-1">
          {onAddToWorkspace && !isWorkspaceCopy && (
            <button
              onClick={handleAddToWorkspace}
              disabled={added}
              title="Add to Code Workspace"
              className="p-1.5 rounded transition flex items-center gap-1 text-[11px] font-bold"
              style={{ color: 'var(--theme-text-primary)' }}
            >
              <FolderPlus className="w-3.5 h-3.5" style={{ color: added ? 'var(--theme-text-muted)' : 'var(--theme-highlight)' }} />
            </button>
          )}
          <button
            onClick={handleSaveFile}
            title="Download snippet as file"
            className="p-1.5 rounded transition opacity-70 hover:opacity-100"
            style={{ color: 'var(--theme-text-primary)' }}
          >
            <HardDriveDownload className="w-4 h-4" />
          </button>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded transition flex items-center gap-1 opacity-70 hover:opacity-100"
            title="Copy Code"
            style={{ color: 'var(--theme-text-primary)' }}
          >
            {copied ? (
              <Check className="w-4 h-4 animate-scale" style={{ color: 'var(--theme-highlight)' }} />
            ) : (
              <Clipboard className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded transition opacity-70 hover:opacity-100 ml-1"
            title={isExpanded ? "Collapse code" : "Expand code"}
            style={{ color: 'var(--theme-text-primary)' }}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Code Area */}
      {isExpanded && (
        <div className="p-4 overflow-x-auto font-mono text-[13px] leading-relaxed" style={{ backgroundColor: 'var(--theme-code-bg)', color: 'var(--theme-text-primary)' }}>
          <pre className="m-0 leading-relaxed font-mono">
            <code
              className={`language-${langNormalized} block font-mono whitespace-pre`}
              dangerouslySetInnerHTML={{ __html: highlighted }}
            />
          </pre>
        </div>
      )}
    </div>
  );
};
