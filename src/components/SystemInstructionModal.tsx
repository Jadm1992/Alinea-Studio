import React, { useState } from 'react';
import { 
  Settings2, 
  Sparkles, 
  Sliders, 
  Check, 
  RotateCcw, 
  Key, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  Database,
  Layers,
  Info,
  Palette
} from 'lucide-react';
import { ModelOption, Provider, PROVIDER_CONFIG } from '../types';
import { appThemes } from '../utils/themeConfig';

interface SystemInstructionModalProps {
  currentInstruction: string;
  currentTemperature: number;
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    instruction: string,
    temperature: number,
    apiKeys: Record<string, string>,
    customModels: ModelOption[],
    theme: string
  ) => void;
  initialKeys: Record<string, string>;
  initialCustomModels: ModelOption[];
  currentTheme: string;
  selectedModelId: string;
}

import { PersonaTab } from './settings/PersonaTab';
import { ThemeTab } from './settings/ThemeTab';
import { ApiKeysTab } from './settings/ApiKeysTab';

export const SystemInstructionModal: React.FC<SystemInstructionModalProps> = ({
  currentInstruction,
  currentTemperature,
  isOpen,
  onClose,
  onSave,
  initialKeys,
  initialCustomModels,
  currentTheme,
  selectedModelId,
}) => {
  const isAzureLocked = selectedModelId === 'azure/ai';
  const [activeTab, setActiveTab] = useState<'persona' | 'keys' | 'theme'>('persona');
  const [instruction, setInstruction] = useState(currentInstruction);
  const [temperature, setTemperature] = useState(currentTemperature);
  const [theme, setTheme] = useState(currentTheme);

  // Managed API Keys State
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({
    gemini: initialKeys.gemini || '',
    openrouter: initialKeys.openrouter || '',
    openai: initialKeys.openai || '',
    deepseek: initialKeys.deepseek || '',
    anthropic: initialKeys.anthropic || '',
  });

  // Visible keys state
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});

  // Dynamic Custom Models State
  const [customModels, setCustomModels] = useState<ModelOption[]>(initialCustomModels);

  // Form states for adding custom models
  const [newModelId, setNewModelId] = useState('');
  const [newModelName, setNewModelName] = useState('');
  const [newModelProvider, setNewModelProvider] = useState<Provider>('openrouter');
  const [newModelDescription, setNewModelDescription] = useState('');
  const [newModelBadge, setNewModelBadge] = useState('Custom');

  if (!isOpen) return null;

  const toggleKeyVisibility = (provider: string) => {
    setVisibleKeys((prev) => ({ ...prev, [provider]: !prev[provider] }));
  };

  const handleKeyChange = (provider: string, value: string) => {
    setApiKeys((prev) => ({ ...prev, [provider]: value }));
  };

  const handleAddCustomModel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModelId.trim() || !newModelName.trim()) return;

    // Standardize Custom ID to ensure provider is correctly flagged or prefixed
    let finalId = newModelId.trim();
    if (newModelProvider === 'openrouter' && !finalId.startsWith('openrouter/')) {
      finalId = `openrouter/${finalId}`;
    } else if (newModelProvider === 'azure' && !finalId.startsWith('azure/')) {
      finalId = `azure/${finalId}`;
    }

    const newModel: ModelOption = {
      id: finalId,
      name: newModelName.trim(),
      description: newModelDescription.trim() || `Configured model leveraging ${newModelProvider.toUpperCase()}`,
      isPaid: true,
      badge: newModelBadge.trim() || 'Custom',
    };

    // Append model and reset inputs
    setCustomModels((prev) => [...prev, newModel]);
    setNewModelId('');
    setNewModelName('');
    setNewModelDescription('');
    setNewModelBadge('Custom');
  };

  const handleDeleteModel = (id: string) => {
    setCustomModels((prev) => prev.filter((m) => m.id !== id));
  };



  const handleReset = () => {
    if (activeTab === 'persona') {
      setInstruction('You are a highly competent, helpful, and friendly general assistant.');
      setTemperature(0.7);
    } else if (activeTab === 'theme') {
      setTheme('moody');
    } else {
      if (window.confirm('Clear all API Keys and registered custom models from local browser memory?')) {
        setApiKeys({
          gemini: '',
          openrouter: '',
          openai: '',
          deepseek: '',
          anthropic: '',
        });
        setCustomModels([]);
      }
    }
  };

  const handleSave = () => {
    onSave(instruction, temperature, apiKeys, customModels, theme);
    onClose();
  };


  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="w-full max-w-2xl bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header containing Tabs */}
        <div className="px-5 py-4 bg-[var(--theme-surface)] border-b border-[var(--theme-border)] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-bold text-[var(--theme-text-primary)] tracking-widest uppercase">
                Studio Preferences
              </span>
            </div>
            <button 
              onClick={onClose}
              className="text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] transition text-xs font-mono p-1 rounded hover:bg-[var(--theme-surface-hover)]"
            >
              ESC ✕
            </button>
          </div>

          {/* Navigation Tab Triggers */}
          <div className="flex items-center gap-1.5 bg-[var(--theme-bg)] p-1 rounded-xl border border-[var(--theme-border)] overflow-x-auto w-full max-w-full">
            <button
              onClick={() => setActiveTab('persona')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition cursor-pointer ${
                activeTab === 'persona'
                  ? 'bg-[var(--theme-surface)]/80 text-purple-400 border border-[var(--theme-border)]'
                  : 'text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Persona & Flow</span>
            </button>
            <button
              onClick={() => setActiveTab('theme')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition cursor-pointer ${
                activeTab === 'theme'
                  ? 'bg-[var(--theme-surface)]/80 text-purple-400 border border-[var(--theme-border)]'
                  : 'text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)]'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Alinea Theme</span>
            </button>
            <button
              onClick={() => setActiveTab('keys')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition cursor-pointer ${
                activeTab === 'keys'
                  ? 'bg-[var(--theme-surface)]/80 text-purple-400 border border-[var(--theme-border)]'
                  : 'text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)]'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>API Keys & Custom LLMs</span>
            </button>
          </div>
        </div>

        {/* Modal Body with scrolls */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto min-h-0">
          {activeTab === 'persona' ? (
            <PersonaTab
              isAzureLocked={isAzureLocked}
              instruction={instruction}
              setInstruction={setInstruction}
              temperature={temperature}
              setTemperature={setTemperature}
            />
          ) : activeTab === 'theme' ? (
            <ThemeTab theme={theme} setTheme={setTheme} />
          ) : (
            <ApiKeysTab
              apiKeys={apiKeys}
              handleKeyChange={handleKeyChange}
              visibleKeys={visibleKeys}
              toggleKeyVisibility={toggleKeyVisibility}
              customModels={customModels}
              handleAddCustomModel={handleAddCustomModel}
              handleDeleteModel={handleDeleteModel}
              newModelId={newModelId}
              setNewModelId={setNewModelId}
              newModelName={newModelName}
              setNewModelName={setNewModelName}
              newModelProvider={newModelProvider}
              setNewModelProvider={setNewModelProvider}
              newModelDescription={newModelDescription}
              setNewModelDescription={setNewModelDescription}
              newModelBadge={newModelBadge}
              setNewModelBadge={setNewModelBadge}
            />
          )}
        </div>

        {/* Modal Actions */}
        <div className="px-5 py-4 bg-[var(--theme-surface)] border-t border-[var(--theme-border)] flex flex-wrap-reverse sm:flex-nowrap items-center justify-between gap-3">
          <button
            onClick={handleReset}
            className="flex items-center justify-center w-full sm:w-auto gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] hover:bg-[var(--theme-surface-hover)] transition border border-transparent shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{activeTab === 'persona' ? 'Reset Defaults' : 'Reset Keys & Custom Models'}</span>
          </button>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] hover:bg-[var(--theme-surface-hover)] bg-[var(--theme-surface)] transition border border-[var(--theme-border)]"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#10b981] hover:bg-[#059669] text-[#000000] rounded-lg text-xs font-bold transition select-none shadow-md active:scale-95 shrink-0"
            >
              <Check className="w-4 h-4 text-[#000000] font-extrabold" />
              <span>Apply Preferences</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
