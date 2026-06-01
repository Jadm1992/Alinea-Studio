import React from 'react';
import { Sparkles, Sliders } from 'lucide-react';

export const personaPresets = [
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

interface PersonaTabProps {
  isAzureLocked: boolean;
  instruction: string;
  setInstruction: (val: string) => void;
  temperature: number;
  setTemperature: (val: number) => void;
}

export const PersonaTab: React.FC<PersonaTabProps> = ({
  isAzureLocked,
  instruction,
  setInstruction,
  temperature,
  setTemperature,
}) => {
  const handleApplyPreset = (presetText: string) => {
    setInstruction(presetText);
  };

  const getTemperatureLabel = (val: number): string => {
    if (val <= 0.2) return 'Analytical & Precise (Deterministic)';
    if (val <= 0.5) return 'Balanced / Analytical';
    if (val <= 0.8) return 'Fluid & Creative (Conversational)';
    return 'Highly Creative / Exploratory';
  };

  return (
    <div className="space-y-6">
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
              <p className="text-[10px] text-[var(--theme-text-primary)] mt-1 line-clamp-2 leading-relaxed">{preset.description}</p>
            </button>
          ))}
        </div>

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
        
        <p className="text-[10px] text-[var(--theme-text-primary)] font-mono tracking-wide">
          Current configuration bias: <span className="text-[var(--theme-text-primary)] font-semibold">{getTemperatureLabel(temperature)}</span>
        </p>
      </div>
    </div>
  );
};
