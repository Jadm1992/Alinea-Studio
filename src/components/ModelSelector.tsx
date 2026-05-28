import React, { useState, useRef, useEffect } from 'react';
import { ModelOption } from '../types';
import { Sparkles, Zap, Flame } from 'lucide-react';

export const modelOptions: ModelOption[] = [
  {
    id: 'azure/ai',
    name: 'Azure AI',
    description: 'Powered by your Azure AI Serverless endpoint',
    isPaid: false,
    badge: 'Private'
  }
];

interface ModelSelectorProps {
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  customModels?: ModelOption[];
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onSelectModel,
  customModels = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const allModels = [...modelOptions, ...customModels];
  const activeModel = allModels.find(m => m.id === selectedModel) || allModels[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative select-none" ref={dropdownRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-text-primary)] cursor-pointer hover:bg-[var(--theme-surface-hover)] hover:border-[var(--theme-border)] transition"
      >
        {activeModel.id.includes('pro') || activeModel.id.includes('claude') || activeModel.id.includes('gpt-4o') ? (
          <Sparkles className="w-4 h-4 text-emerald-400" />
        ) : (
          <Zap className="w-4 h-4 text-amber-400" />
        )}
        <div className="flex flex-col text-left">
          <span className="text-xs font-semibold tracking-tight leading-3">
            {activeModel.name}
          </span>
        </div>
      </div>

      {/* Hover Dropdown / Select Area */}
      <div className={`absolute right-0 top-full mt-2 w-72 rounded-xl bg-[var(--theme-bg)] border border-[var(--theme-border)] p-2 shadow-2xl transition duration-150 origin-top-right z-50 max-h-[85vh] overflow-y-auto ${isOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}>
        <div className="px-2 py-1.5 mb-1.5 border-b border-[var(--theme-border)]">
          <p className="text-xs font-medium text-[var(--theme-text-muted)]">Choose Model</p>
        </div>
        <div className="space-y-1">
          {allModels.map((model) => {
            const isSelected = model.id === selectedModel;
            return (
              <button
                key={model.id}
                onClick={() => {
                  onSelectModel(model.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left p-2.5 rounded-lg flex items-start gap-2.5 transition ${
                  isSelected
                    ? 'bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-text-primary)]'
                    : 'hover:bg-[var(--theme-surface-hover)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] border border-transparent'
                }`}
              >
                {model.id.includes('pro') || model.id.includes('claude') || model.id.includes('gpt-4') ? (
                  <Flame className={`w-4 h-4 mt-0.5 ${isSelected ? 'text-emerald-400' : 'text-[var(--theme-text-muted)]'}`} />
                ) : (
                  <Zap className={`w-4 h-4 mt-0.5 ${isSelected ? 'text-amber-400' : 'text-[var(--theme-text-primary)]0'}`} />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium truncate pr-1">{model.name}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-medium shrink-0 ${
                        model.id.includes('pro') || model.id.includes('claude') || model.id.includes('gpt-4')
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-900'
                          : model.badge === 'Custom'
                          ? 'bg-amber-950/70 text-amber-400 border border-amber-900/50'
                          : 'bg-[var(--theme-border)] text-[var(--theme-text-primary)]'
                      }`}
                    >
                      {model.badge}
                    </span>

                  </div>
                  <p className="text-[10px] text-[var(--theme-text-primary)]0 line-clamp-2 mt-0.5 leading-snug">
                    {model.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
