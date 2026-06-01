import React from 'react';
import { Key, Eye, EyeOff, Database, Trash2, Layers, Plus, Info } from 'lucide-react';
import { ModelOption, Provider, PROVIDER_CONFIG } from '../../types';

interface ApiKeysTabProps {
  apiKeys: Record<string, string>;
  handleKeyChange: (provider: string, value: string) => void;
  visibleKeys: Record<string, boolean>;
  toggleKeyVisibility: (provider: string) => void;
  customModels: ModelOption[];
  handleAddCustomModel: (e: React.FormEvent) => void;
  handleDeleteModel: (id: string) => void;
  newModelId: string;
  setNewModelId: (val: string) => void;
  newModelName: string;
  setNewModelName: (val: string) => void;
  newModelProvider: Provider;
  setNewModelProvider: (val: Provider) => void;
  newModelDescription: string;
  setNewModelDescription: (val: string) => void;
  newModelBadge: string;
  setNewModelBadge: (val: string) => void;
}

export const ApiKeysTab: React.FC<ApiKeysTabProps> = ({
  apiKeys,
  handleKeyChange,
  visibleKeys,
  toggleKeyVisibility,
  customModels,
  handleAddCustomModel,
  handleDeleteModel,
  newModelId,
  setNewModelId,
  newModelName,
  setNewModelName,
  newModelProvider,
  setNewModelProvider,
  newModelDescription,
  setNewModelDescription,
  newModelBadge,
  setNewModelBadge,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex gap-2.5 p-3 rounded-xl bg-amber-950/20 border border-amber-900/40 text-amber-300">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <div className="text-[11px] leading-relaxed">
          <p className="font-semibold text-amber-200">Local Browser Storage Settings</p>
          <p className="text-[var(--theme-text-muted)] mt-0.5">
            Your API Keys are compiled and stored securely in your web browser's local sandbox storage. They are sent directly to your sandbox-backed Node server environment to authenticate with LLM APIs on-demand.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-[11px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider flex items-center gap-1.5">
          <Key className="w-3.5 h-3.5 text-emerald-400" />
          Secret Provider Credentials
        </label>

        <div className="space-y-3 bg-[var(--theme-surface-hover)] border border-[var(--theme-border)] p-4 rounded-xl">
          {PROVIDER_CONFIG.map((prov) => {
            const isVisible = !!visibleKeys[prov.id];
            return (
              <div key={prov.id} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--theme-text-primary)]">{prov.label}</span>
                  <span className="text-[10px] text-[var(--theme-text-primary)] font-mono font-medium">
                    {apiKeys[prov.id] ? '✓ Configured locally' : 'No custom key configured'}
                  </span>
                </div>
                <div className="relative flex items-center bg-[var(--theme-bg)] rounded-lg border border-[var(--theme-border)] focus-within:border-emerald-500/50 overflow-hidden">
                  <input
                    type={isVisible ? 'text' : 'password'}
                    value={apiKeys[prov.id] || ''}
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

      <div className="space-y-4 pt-1">
        <label className="text-[11px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          Custom Model Registrations
        </label>

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
                    <p className="text-[10px] text-[var(--theme-text-primary)] font-mono mt-1 leading-none truncate">{m.id}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteModel(m.id)}
                    className="p-1.5 text-[var(--theme-text-primary)] hover:text-rose-400 rounded hover:bg-[var(--theme-surface-hover)] transition cursor-pointer"
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
            <p className="text-xs text-[var(--theme-text-primary)]">No custom models registered yet.</p>
          </div>
        )}

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
                {PROVIDER_CONFIG.map(p => <option key={p.id} value={p.id}>{p.shortName}</option>)}
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
  );
};
