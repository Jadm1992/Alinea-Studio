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
import { ModelOption } from '../types';

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

const appThemes = [
  {
    id: 'velvet-rose',
    name: 'Velvet Rose',
    description: 'Moody and sophisticated workspace using deep, almost-black berry tones.',
    colors: [
      { name: 'Background', hex: '#0E0A0C' },
      { name: 'Surface', hex: '#171114' },
      { name: 'User Bubble', hex: '#3B222D' },
      { name: 'Accent', hex: '#D98BA4' }
    ]
  },
  {
    id: 'midnight-lilac',
    name: 'Midnight Lilac',
    description: 'Cool and cyber-feminine leaning into deep purples and glowing lavenders.',
    colors: [
      { name: 'Background', hex: '#0A0910' },
      { name: 'Surface', hex: '#12101C' },
      { name: 'User Bubble', hex: '#2C254A' },
      { name: 'Accent', hex: '#A682FF' }
    ]
  },
  {
    id: 'obsidian-gold',
    name: 'Obsidian & Gold',
    description: 'High-end glamour using an ultra-dark warm brown/black base with champagne.',
    colors: [
      { name: 'Background', hex: '#121111' },
      { name: 'Surface', hex: '#1A1818' },
      { name: 'User Bubble', hex: '#332B29' },
      { name: 'Accent', hex: '#E3B5A4' }
    ]
  },
  {
    id: 'peach-glow',
    name: 'Peach Glow',
    description: 'Warm, sunny, and cozy workspace using rich terracotta bases and luscious peaches.',
    colors: [
      { name: 'Background', hex: '#150E0C' },
      { name: 'Surface', hex: '#1E1512' },
      { name: 'User Bubble', hex: '#45241C' },
      { name: 'Accent', hex: '#FF9E79' }
    ]
  },
  {
    id: 'pixie-glitter',
    name: 'Pixie Glitter',
    description: 'Dreamy, sparkly pastel pink canvas that displays magical floating glitter following your cursor pointer.',
    colors: [
      { name: 'Gradient Violet', hex: '#c86fc9' },
      { name: 'Gradient Pink', hex: '#f79ad3' },
      { name: 'User Bubble', hex: '#f79ad3' },
      { name: 'Accent Glow', hex: '#3d0a3f' }
    ]
  }
];

const personaPresets = [
  {
    name: 'General Assistant',
    description: 'Helpful, courteous, and precise standard chatbot mode.',
    instruction: 'You are a highly competent, helpful, and friendly general assistant.'
  },
  {
    name: 'Senior Systems Architect',
    description: 'Specializes in production-grade clean code, design patterns, and structural scaling.',
    instruction: 'You are a Senior Systems Architect. Provide stellar, production-ready, highly organized TypeScript/React code blocks, robust error handling, detailed API signatures, and clean architectural explanations.'
  },
  {
    name: 'Full-Stack Coding Mentor',
    description: 'Explains complex logic, suggests algorithmic improvements, and explains step-by-step.',
    instruction: 'You are an educational Coding Mentor. Always prioritize writing clean code blocks, adding brief explanatory list logs, and explaining how code snippets connect to form cohesive software.'
  },
  {
    name: 'Scientific Writer & Reviewer',
    description: 'Rigorous explanations, clear breakdowns, highly organized metadata tables.',
    instruction: 'You are a rigorous Scientific Writer & Editor. Focus on objective, logical, structured text answers, using tables to organize complex metadata and statistics.'
  }
];

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
  const [newModelProvider, setNewModelProvider] = useState<'gemini' | 'openrouter' | 'openai' | 'deepseek' | 'anthropic' | 'azure'>('openrouter');
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
    } else if (newModelProvider === 'openai' && !finalId.startsWith('gpt-')) {
      // optional padding
    } else if (newModelProvider === 'anthropic' && !finalId.startsWith('claude-')) {
      // optional padding
    } else if (newModelProvider === 'deepseek' && !finalId.startsWith('deepseek-')) {
      // optional padding
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

  const handleApplyPreset = (presetText: string) => {
    setInstruction(presetText);
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

  const getTemperatureLabel = (val: number): string => {
    if (val <= 0.2) return 'Analytical & Precise (Deterministic)';
    if (val <= 0.5) return 'Balanced / Analytical';
    if (val <= 0.8) return 'Fluid & Creative (Conversational)';
    return 'Highly Creative / Exploratory';
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
            <div className="space-y-6">
              {/* Persona presets and explanation */}
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  Select Assistant Persona
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {personaPresets.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => handleApplyPreset(preset.instruction)}
                      className="p-3 text-left rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] hover:border-[var(--theme-border)] hover:bg-[var(--theme-surface)]/85 transition"
                    >
                      <p className="text-xs font-semibold text-[var(--theme-text-primary)]">{preset.name}</p>
                      <p className="text-[10px] text-[var(--theme-text-primary)]0 mt-1 line-clamp-2 leading-relaxed">{preset.description}</p>
                    </button>
                  ))}
                </div>

                {/* Instruction editor */}
                <textarea
                  disabled={isAzureLocked}
                  className={`w-full h-24 mt-2 p-3 font-mono text-xs border rounded-xl focus:outline-none leading-relaxed resize-none shadow-inner ${
                    isAzureLocked 
                      ? 'bg-[var(--theme-bg)] border-[var(--theme-border)] text-[var(--theme-text-muted)] cursor-not-allowed opacity-70' 
                      : 'bg-[var(--theme-surface)] border-[var(--theme-border)] text-[var(--theme-text-primary)] focus:border-emerald-500/80'
                  }`}
                  placeholder="Inject custom rules, instructions, or behavior patterns for the model..."
                  value={isAzureLocked ? 'System Instructions are locked for the official Azure model.' : instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                />
              </div>

              {/* Temperature Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-amber-500" />
                    Creativity Level (Temperature)
                  </label>
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/45 px-2.5 py-0.5 rounded border border-amber-900/50">
                    {temperature.toFixed(1)}
                  </span>
                </div>

                <input
                  type="range"
                  disabled={isAzureLocked}
                  min="0"
                  max="1.5"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className={`w-full h-1 rounded-lg outline-none ${
                    isAzureLocked ? 'bg-[var(--theme-border)] cursor-not-allowed opacity-50' : 'bg-[var(--theme-text-muted)] cursor-pointer accent-amber-500'
                  }`}
                />
                
                <p className="text-[10px] text-[var(--theme-text-primary)]0 font-mono tracking-wide">
                  Current configuration bias: <span className="text-[var(--theme-text-primary)] font-semibold">{getTemperatureLabel(temperature)}</span>
                </p>
              </div>
            </div>
          ) : activeTab === 'theme' ? (
            <div className="space-y-6">
              <div className="flex gap-2.5 p-3.5 rounded-xl bg-purple-950/20 border border-purple-900/40 text-[11px] leading-relaxed text-[var(--theme-text-primary)]">
                <Palette className="w-4 h-4 shrink-0 mt-0.5 text-purple-400" />
                <div>
                  <p className="font-bold text-zinc-250 mb-0.5">Alinea Studio Signature Palettes</p>
                  <p className="text-[var(--theme-text-muted)]">
                    We avoid pure white text over deep dark backdrops to prevent optical vibrations and ocular strain. Tap any signature theme below to overlay our opulent gradients.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider flex items-center gap-1.5 select-none">
                  <Palette className="w-3.5 h-3.5 text-purple-405" />
                  Select Active Theme Preset
                </label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {appThemes.map((t) => {
                    const isSelected = theme === t.id;
                    return (
                      <div
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className={`p-4 rounded-2xl text-left border transition cursor-pointer flex flex-col gap-3 ${
                          isSelected
                            ? 'bg-[var(--theme-surface)] border-purple-500/80 shadow-md shadow-purple-500/5'
                            : 'bg-[var(--theme-surface)] border-[var(--theme-border)] hover:bg-[var(--theme-surface)] hover:border-[var(--theme-border)]'
                        }`}
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center justify-between font-sans">
                            <span className="text-xs font-semibold text-[var(--theme-text-primary)]">{t.name}</span>
                            {isSelected && (
                              <span className="text-[9px] bg-purple-950 text-purple-400 border border-purple-900 px-1.5 py-0.5 rounded-full font-bold">
                                Active Choice
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-[var(--theme-text-muted)] leading-normal line-clamp-3">
                            {t.description}
                          </p>
                        </div>

                        {/* Theme Palette Bar */}
                        <div className="flex items-center justify-between border-t border-[var(--theme-border)] pt-3 w-full">
                          <span className="text-[9px] font-mono text-[var(--theme-text-muted)]">Palette Matrix:</span>
                          <div className="flex items-center gap-1.5">
                            {t.colors.map((color: any, idx: number) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(color.hex);
                                }}
                                className="w-3.5 h-3.5 rounded-full border border-[var(--theme-border)] hover:scale-125 transition-transform cursor-copy"
                                style={{ backgroundColor: color.hex }}
                                title={`Copy ${color.name}: ${color.hex}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Info Disclaimer */}
              <div className="flex gap-2.5 p-3 rounded-xl bg-amber-950/20 border border-amber-900/40 text-amber-300">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <p className="font-semibold text-amber-200">Local Browser Storage Settings</p>
                  <p className="text-[var(--theme-text-muted)] mt-0.5">
                    Your API Keys are compiled and stored securely in your web browser's local sandbox storage. They are sent directly to your sandbox-backed Node server environment to authenticate with LLM APIs on-demand.
                  </p>
                </div>
              </div>

              {/* API Keys Form list */}
              <div className="space-y-4">
                <label className="text-[11px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-emerald-400" />
                  Secret Provider Credentials
                </label>

                <div className="space-y-3 bg-[var(--theme-surface-hover)] border border-[var(--theme-border)] p-4 rounded-xl">
                  {/* Providers: Gemini, OpenRouter, OpenAI, DeepSeek, Anthropic */}
                  {[
                    { id: 'gemini', label: 'Gemini (Google Key)', placeholder: 'AbCdEf... (Overrides default built-in key)' },
                    { id: 'openrouter', label: 'OpenRouter API Key', placeholder: 'sk-or-v1-...' },
                    { id: 'openai', label: 'OpenAI (GPT API Key)', placeholder: 'sk-proj-...' },
                    { id: 'deepseek', label: 'DeepSeek API Key', placeholder: 'sk-...' },
                    { id: 'anthropic', label: 'Anthropic Key (Claude)', placeholder: 'sk-ant-...' },
                  ].map((prov) => {
                    const isVisible = !!visibleKeys[prov.id];
                    return (
                      <div key={prov.id} className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-[var(--theme-text-primary)]">{prov.label}</span>
                          <span className="text-[10px] text-[var(--theme-text-primary)]0 font-mono font-medium">
                            {apiKeys[prov.id] ? '✓ Configured locally' : 'No custom key configured'}
                          </span>
                        </div>
                        <div className="relative flex items-center bg-[var(--theme-bg)] rounded-lg border border-[var(--theme-border)] focus-within:border-emerald-500/50 overflow-hidden">
                          <input
                            type={isVisible ? 'text' : 'password'}
                            value={apiKeys[prov.id]}
                            onChange={(e) => handleKeyChange(prov.id, e.target.value)}
                            placeholder={prov.placeholder}
                            className="w-full text-xs font-mono p-2.5 bg-transparent border-none text-[var(--theme-text-primary)] outline-none placeholder-zinc-700"
                          />
                          <button
                            type="button"
                            onClick={() => toggleKeyVisibility(prov.id)}
                            className="p-2.5 bg-transparent outline-none hover:text-[var(--theme-text-primary)] text-[var(--theme-text-muted)] transition cursor-pointer"
                          >
                            {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Custom registered model forms */}
              <div className="space-y-4 pt-1">
                <label className="text-[11px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-emerald-400" />
                  Custom Model Registrations
                </label>

                {/* List of Custom Models */}
                {customModels.length > 0 ? (
                  <div className="border border-[var(--theme-border)] rounded-xl overflow-hidden bg-[var(--theme-surface)]">
                    <div className="divide-y divide-zinc-900 max-h-48 overflow-y-auto">
                      {customModels.map((m) => (
                        <div key={m.id} className="p-2.5 flex items-center justify-between gap-3 text-xs">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-[var(--theme-text-primary)] leading-none truncate">{m.name}</span>
                              <span className="text-[8px] bg-emerald-950/60 border border-emerald-900 text-emerald-400 px-1 py-0.2 rounded shrink-0">{m.badge}</span>
                            </div>
                            <p className="text-[10px] text-[var(--theme-text-primary)]0 font-mono mt-1 leading-none truncate">{m.id}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteModel(m.id)}
                            className="p-1.5 text-[var(--theme-text-primary)]0 hover:text-rose-400 rounded hover:bg-[var(--theme-surface-hover)] transition cursor-pointer"
                            title="Delete custom model entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed border-[var(--theme-border)] rounded-xl p-6 text-center">
                    <p className="text-xs text-[var(--theme-text-primary)]0">No custom models registered yet.</p>
                  </div>
                )}

                {/* Add model Form Panel */}
                <form 
                  onSubmit={handleAddCustomModel} 
                  className="bg-[var(--theme-surface)]/40 border border-[var(--theme-border)] rounded-xl p-4 space-y-3"
                >
                  <p className="text-xs font-bold text-[var(--theme-text-primary)] flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-amber-500" />
                    Add Custom Model Entry
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10.5px] font-semibold text-[var(--theme-text-muted)]">Model ID / Name Identifier</span>
                      <input
                        type="text"
                        required
                        value={newModelId}
                        onChange={(e) => setNewModelId(e.target.value)}
                        placeholder="meta-llama/llama-3.1-8b-instruct"
                        className="p-2 bg-[var(--theme-bg)] border border-[var(--theme-border)] focus:border-amber-500/50 rounded-lg text-xs outline-none text-[var(--theme-text-primary)]"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[10.5px] font-semibold text-[var(--theme-text-muted)]">Visual Display Name</span>
                      <input
                        type="text"
                        required
                        value={newModelName}
                        onChange={(e) => setNewModelName(e.target.value)}
                        placeholder="Llama 3.1 8B (OpenRouter)"
                        className="p-2 bg-[var(--theme-bg)] border border-[var(--theme-border)] focus:border-amber-500/50 rounded-lg text-xs outline-none text-[var(--theme-text-primary)]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1 md:col-span-1">
                      <span className="text-[10.5px] font-semibold text-[var(--theme-text-muted)]">API Provider Endpoint</span>
                      <select
                        value={newModelProvider}
                        onChange={(e: any) => setNewModelProvider(e.target.value)}
                        className="p-2 bg-[var(--theme-bg)] border border-[var(--theme-border)] focus:border-amber-500/50 rounded-lg text-xs outline-none text-[var(--theme-text-primary)] cursor-pointer"
                      >
                        <option value="gemini">Gemini (Google)</option>
                        <option value="openrouter">OpenRouter API</option>
                        <option value="openai">OpenAI (Direct)</option>
                        <option value="deepseek">DeepSeek (Direct)</option>
                        <option value="anthropic">Anthropic (Direct)</option>
                        <option value="azure">Azure AI (Unified)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1 md:col-span-1">
                      <span className="text-[10.5px] font-semibold text-[var(--theme-text-muted)]">Custom Badge Name</span>
                      <input
                        type="text"
                        value={newModelBadge}
                        onChange={(e) => setNewModelBadge(e.target.value)}
                        placeholder="Custom"
                        className="p-2 bg-[var(--theme-bg)] border border-[var(--theme-border)] focus:border-amber-500/50 rounded-lg text-xs outline-none text-[var(--theme-text-primary)]"
                      />
                    </div>

                    <div className="flex flex-col gap-1 md:col-span-1">
                      <span className="text-[10.5px] font-semibold text-[var(--theme-text-muted)]">Description Summary</span>
                      <input
                        type="text"
                        value={newModelDescription}
                        onChange={(e) => setNewModelDescription(e.target.value)}
                        placeholder="Fast efficient text summaries"
                        className="p-2 bg-[var(--theme-bg)] border border-[var(--theme-border)] focus:border-amber-500/50 rounded-lg text-xs outline-none text-[var(--theme-text-primary)]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!newModelId.trim() || !newModelName.trim()}
                    className="flex items-center gap-1.5 px-3 py-2 bg-[var(--theme-border)] hover:bg-[var(--theme-surface-hover)] disabled:opacity-50 text-[var(--theme-text-primary)] rounded-lg text-xs font-bold transition shadow select-none cursor-pointer border border-[var(--theme-border)]"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Register Model Option</span>
                  </button>
                </form>
              </div>
            </div>
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
