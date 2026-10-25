import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export type ConditionTier = 1 | 2 | 3 | 4 | 5;

export interface ConditionOption {
  label: string;
  tier: ConditionTier;
}

/** Strict 5-tier standard — one label per tier, no overlap. */
export const conditionOptions: ConditionOption[] = [
  { label: 'Poor / Used', tier: 1 },
  { label: 'Fair', tier: 2 },
  { label: 'Good', tier: 3 },
  { label: 'Like New', tier: 4 },
  { label: 'Brand New / Mint', tier: 5 },
];

const tierColors: Record<ConditionTier, string> = {
  5: 'bg-emerald-500',
  4: 'bg-lime-400',
  3: 'bg-amber-400',
  2: 'bg-orange-500',
  1: 'bg-red-500',
};

const tierLabel: Record<ConditionTier, string> = {
  5: 'Brand New / Mint',
  4: 'Like New',
  3: 'Good',
  2: 'Fair',
  1: 'Poor / Used',
};

export function tierToLabel(tier: ConditionTier): string {
  return tierLabel[tier];
}

/** Inactive bar styling: low opacity grey, visible but clearly muted. */
function inactiveBarClass(theme: 'light' | 'dark'): string {
  return theme === 'dark'
    ? 'bg-slate-700 opacity-40'
    : 'bg-gray-200 opacity-40';
}

export function conditionToTier(condition: string, score: number): ConditionTier {
  const c = condition?.toLowerCase().trim();
  if (c === 'brand new' || c === 'mint' || c === 'new') return 5;
  if (c === 'like new') return 4;
  if (c === 'good') return 3;
  if (c === 'fair') return 2;
  if (c === 'poor' || c === 'used' || c === 'parts only' || c === 'heavily used') return 1;

  const s = score ?? 0;
  if (s >= 100) return 5;
  if (s >= 90) return 4;
  if (s >= 80) return 3;
  if (s >= 60) return 2;
  return 1;
}

interface ConditionBarsProps {
  tier: ConditionTier;
  size?: 'sm' | 'md';
  theme?: 'light' | 'dark';
}

/**
 * Unified condition bars — used everywhere (cards, modal, profile, quick view).
 * Always renders all 5 bars. Active bars are illuminated with spectrum color,
 * inactive bars are dimmed to low-opacity grey.
 *
 * Fixed dimensions: sm = 4px × 10px, gap 2px; md = 6px × 12px, gap 3px.
 */
export function ConditionBars({ tier, size = 'md', theme = 'light' }: ConditionBarsProps) {
  const dims = size === 'sm'
    ? { w: 'w-[4px]', h: 'h-[10px]', gap: 'gap-[2px]', rounded: 'rounded-[1.5px]' }
    : { w: 'w-[6px]', h: 'h-[12px]', gap: 'gap-[3px]', rounded: 'rounded-[2px]' };

  return (
    <div className={`inline-flex items-center ${dims.gap}`} role="img" aria-label={`Condition: ${tierLabel[tier]}`}>
      {([1, 2, 3, 4, 5] as ConditionTier[]).map((t) => {
        const active = t <= tier;
        return (
          <span
            key={t}
            className={`${dims.w} ${dims.h} ${dims.rounded} transition-colors ${
              active ? tierColors[tier] : inactiveBarClass(theme)
            }`}
          />
        );
      })}
    </div>
  );
}

/**
 * Compact dropdown condition selector.
 * Collapsed: single line showing bars + label.
 * Expanded: popup with all 5 options.
 */
interface ConditionDropdownProps {
  tier: ConditionTier;
  onChange: (tier: ConditionTier, label: string) => void;
}

export function ConditionDropdown({ tier, onChange }: ConditionDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = conditionOptions.find((o) => o.tier === tier);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-line bg-lineSoft/60 hover:border-ink-400/50 hover:bg-lineSoft transition-colors text-left"
      >
        <ConditionBars tier={tier} size="md" />
        <span className="text-[12px] font-semibold text-ink-900 flex-1">{current?.label}</span>
        <ChevronDown size={14} className={`text-ink-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-line bg-surface shadow-lg z-50 overflow-hidden animate-[scaleIn_0.15s_ease-out] origin-top">
          {conditionOptions.map((opt) => {
            const isOn = opt.tier === tier;
            return (
              <button
                key={opt.tier}
                type="button"
                onClick={() => {
                  onChange(opt.tier, opt.label);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 transition-colors text-left border-b border-line last:border-b-0 ${
                  isOn ? 'bg-ink-900' : 'hover:bg-lineSoft'
                }`}
              >
                <ConditionBars tier={opt.tier} size="md" theme={isOn ? 'dark' : 'light'} />
                <span className={`text-[12px] font-semibold flex-1 ${isOn ? 'text-white' : 'text-ink-700'}`}>
                  {opt.label}
                </span>
                {isOn && (
                  <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                    Selected
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
