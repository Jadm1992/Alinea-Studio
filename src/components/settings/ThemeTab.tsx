import React from 'react';
import { Palette } from 'lucide-react';
import { appThemes } from '../../utils/themeConfig';

interface ThemeTabProps {
  theme: string;
  setTheme: (val: string) => void;
}

export const ThemeTab: React.FC<ThemeTabProps> = ({ theme, setTheme }) => {
  return (
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
  );
};
