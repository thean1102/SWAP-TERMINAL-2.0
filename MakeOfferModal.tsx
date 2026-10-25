import { useEffect, useMemo, useState } from 'react';
import {
  X,
  Check,
  Plus,
  Minus,
  ArrowLeftRight,
  Repeat2,
  Zap,
  TrendingUp,
  Package,
  Crosshair,
} from 'lucide-react';
import type { TradeItem, SubCategoryId } from '@/data/items';
import { ConditionBars, conditionToTier, tierToLabel } from '@/components/ConditionBars';

interface MakeOfferModalProps {
  open: boolean;
  targetItem: TradeItem | null;
  inventory: TradeItem[];
  onClose: () => void;
  onAddQuickItem: () => void;
  onSubmit: (selectedItems: TradeItem[], cashMode: CashMode, cashAmount: number, matchScore: number) => void;
}

type CashMode = 'even' | 'i-add' | 'host-adds';

function parseValue(v: string): number {
  return parseInt(v.replace(/[^0-9]/g, ''), 10) || 0;
}

function calcMatchScore(
  target: TradeItem,
  offered: TradeItem[],
  cashAmount: number,
  cashMode: CashMode,
): number {
  if (offered.length === 0) return 0;

  const targetVal = parseValue(target.estimatedValue);
  const offerVal = offered.reduce((sum, it) => sum + parseValue(it.estimatedValue), 0);
  const cashAdjust = cashMode === 'even' ? 0 : cashMode === 'i-add' ? cashAmount : -cashAmount;
  const totalOffer = offerVal + cashAdjust;

  const valueRatio = targetVal > 0 ? Math.min(totalOffer, targetVal) / Math.max(totalOffer, targetVal) : 0.5;
  const valueScore = Math.round(valueRatio * 60);

  const avgCondition = offered.reduce((sum, it) => sum + it.conditionScore, 0) / offered.length;
  const conditionScore = Math.round((avgCondition / 100) * 25);

  const matchBonus = Math.min(14, offered[0].matchRate / 7);

  return Math.min(99, Math.max(5, valueScore + conditionScore + Math.round(matchBonus)));
}

function InventoryTile({
  item,
  selected,
  onToggle,
}: {
  item: TradeItem;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`relative text-left rounded-lg overflow-hidden border transition-all ${
        selected
          ? 'border-emerald-500 ring-1 ring-emerald-400'
          : 'border-slate-700 hover:border-slate-500'
      }`}
    >
      <div className="aspect-[4/3] bg-slate-800 overflow-hidden">
        <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
      </div>
      <div className="p-2 bg-slate-900">
        <p className="text-[10px] font-semibold text-slate-200 truncate">{item.title}</p>
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-1.5">
            <ConditionBars tier={conditionToTier(item.condition, item.conditionScore)} size="sm" theme="dark" />
            <span className="text-[8px] text-slate-500">{tierToLabel(conditionToTier(item.condition, item.conditionScore))}</span>
          </div>
          <span className="text-[9px] font-mono font-bold text-slate-400 tnum">{item.estimatedValue}</span>
        </div>
      </div>
      {/* Checkmark overlay */}
      {selected && (
        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
          <Check size={12} className="text-white" />
        </div>
      )}
    </button>
  );
}

export function MakeOfferModal({
  open,
  targetItem,
  inventory,
  onClose,
  onAddQuickItem,
  onSubmit,
}: MakeOfferModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [cashMode, setCashMode] = useState<CashMode>('even');
  const [cashAmount, setCashAmount] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setSelectedIds([]);
      setCashMode('even');
      setCashAmount(0);
      setSubmitting(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  const selectedItems = useMemo(
    () => inventory.filter((it) => selectedIds.includes(it.id)),
    [inventory, selectedIds],
  );

  const matchScore = useMemo(
    () => (targetItem ? calcMatchScore(targetItem, selectedItems, cashAmount, cashMode) : 0),
    [targetItem, selectedItems, cashAmount, cashMode],
  );

  if (!open || !targetItem) return null;

  const toggleItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSubmit = () => {
    if (selectedItems.length === 0) return;
    setSubmitting(true);
    setTimeout(() => {
      onSubmit(selectedItems, cashMode, cashAmount, matchScore);
      setSubmitting(false);
    }, 600);
  };

  const cashDisabled = cashMode === 'even';

  return (
    <div
      className="fixed inset-0 z-[56] flex items-center justify-center p-0 sm:p-4 bg-ink-900/70 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
      onClick={onClose}
    >
      <div
        className="relative w-full h-full sm:max-w-2xl sm:max-h-[92vh] bg-slate-950 sm:rounded-xl overflow-hidden border border-slate-800 flex flex-col animate-[scaleIn_0.25s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-900 border-b border-slate-800 flex-shrink-0">
          <span className="flex h-7 w-7 items-center justify-center rounded bg-emerald-500/15 border border-emerald-500/30">
            <Crosshair size={14} className="text-emerald-400" />
          </span>
          <div>
            <h2 className="text-[14px] font-bold text-slate-100 tracking-tight">Make an Offer</h2>
            <p className="text-[9px] font-mono text-slate-500">SWAP_TERMINAL v2.0 · OFFER_INTENT</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="ml-auto w-7 h-7 rounded-md bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {/* Target item banner */}
          <div className="p-4 bg-slate-900/60 border-b border-slate-800">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400">Target Item · Host Listing</span>
            </div>
            <div className="flex items-start gap-3">
              <img
                src={targetItem.images[0]}
                alt={targetItem.title}
                className="w-16 h-16 rounded-lg object-cover border border-slate-700 flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-bold text-slate-100 truncate">{targetItem.title}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {targetItem.owner} · {targetItem.suburb}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1.5">
                    <ConditionBars tier={conditionToTier(targetItem.condition, targetItem.conditionScore)} size="sm" theme="dark" />
                    <span className="text-[10px] text-slate-400">{tierToLabel(conditionToTier(targetItem.condition, targetItem.conditionScore))}</span>
                  </div>
                  <span className="font-mono text-[11px] font-bold text-slate-200 tnum">{targetItem.estimatedValue}</span>
                </div>
              </div>
              {/* Looking-for tag */}
              {!targetItem.freeTrade && targetItem.lookingFor && (
                <div className="flex-shrink-0 max-w-[40%]">
                  <span className="block text-[7px] font-bold uppercase tracking-wider text-slate-600 mb-0.5">Looking For</span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-800 border border-slate-700 text-[9px] font-medium text-slate-300">
                    <Repeat2 size={9} className="text-slate-500" />
                    {targetItem.lookingFor}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Inventory selector */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Package size={12} className="text-emerald-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                  Your Inventory · Select 1 or more
                </span>
              </div>
              <button
                onClick={onAddQuickItem}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-colors"
              >
                <Plus size={11} /> Add Quick Item
              </button>
            </div>

            {inventory.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-700 p-8 text-center">
                <Package size={28} className="text-slate-700 mx-auto mb-3" />
                <p className="text-[12px] font-semibold text-slate-400">Your inventory is empty</p>
                <p className="text-[10px] text-slate-600 mt-1 mb-3">Add an item to offer in this swap</p>
                <button
                  onClick={onAddQuickItem}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-[11px] font-semibold text-emerald-400 hover:bg-emerald-500/25 transition-colors"
                >
                  <Plus size={13} /> Add Quick Item
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2.5">
                {inventory.map((item) => (
                  <InventoryTile
                    key={item.id}
                    item={item}
                    selected={selectedIds.includes(item.id)}
                    onToggle={() => toggleItem(item.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Cash adjustment */}
          <div className="px-4 pb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-2.5">
              Cash Adjustment / Differential
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => { setCashMode('even'); setCashAmount(0); }}
                className={`flex flex-col items-center gap-1 py-2.5 rounded-lg border transition-all ${
                  cashMode === 'even'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                    : 'border-slate-700 bg-slate-900 text-slate-500 hover:border-slate-600'
                }`}
              >
                <ArrowLeftRight size={14} />
                <span className="text-[10px] font-bold">Even Trade</span>
                <span className="font-mono text-[9px] tnum">$0</span>
              </button>
              <button
                onClick={() => setCashMode('i-add')}
                className={`flex flex-col items-center gap-1 py-2.5 rounded-lg border transition-all ${
                  cashMode === 'i-add'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                    : 'border-slate-700 bg-slate-900 text-slate-500 hover:border-slate-600'
                }`}
              >
                <Plus size={14} />
                <span className="text-[10px] font-bold">I Add Cash</span>
                <span className="font-mono text-[9px] tnum">+ $</span>
              </button>
              <button
                onClick={() => setCashMode('host-adds')}
                className={`flex flex-col items-center gap-1 py-2.5 rounded-lg border transition-all ${
                  cashMode === 'host-adds'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                    : 'border-slate-700 bg-slate-900 text-slate-500 hover:border-slate-600'
                }`}
              >
                <Minus size={14} />
                <span className="text-[10px] font-bold">Host Adds</span>
                <span className="font-mono text-[9px] tnum">- $</span>
              </button>
            </div>

            {/* Cash amount input */}
            {!cashDisabled && (
              <div className="mt-2.5 flex items-center gap-2 px-3 py-2.5 rounded-lg border border-slate-700 bg-slate-900 animate-[fadeIn_0.15s_ease-out]">
                <span className={`font-mono text-[14px] font-bold ${cashMode === 'i-add' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {cashMode === 'i-add' ? '+' : '-'}
                </span>
                <span className="font-mono text-[14px] text-slate-400">$</span>
                <input
                  type="number"
                  min={0}
                  value={cashAmount || ''}
                  onChange={(e) => setCashAmount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  placeholder="0"
                  className="w-full bg-transparent text-[14px] font-mono text-slate-100 placeholder:text-slate-600 outline-none tnum"
                />
                <span className="text-[10px] font-mono text-slate-500">
                  {cashMode === 'i-add' ? 'You pay' : 'Host pays'}
                </span>
              </div>
            )}
          </div>

          {/* Match score badge */}
          <div className="px-4 pb-4">
            <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-700 bg-slate-900">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className={matchScore >= 80 ? 'text-emerald-400' : matchScore >= 50 ? 'text-amber-400' : 'text-slate-500'} />
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Live Match Score</span>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <div className="w-24 h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      matchScore >= 80 ? 'bg-emerald-500' : matchScore >= 50 ? 'bg-amber-400' : 'bg-slate-600'
                    }`}
                    style={{ width: `${matchScore}%` }}
                  />
                </div>
                <span
                  className={`font-mono text-[18px] font-bold tnum ${
                    matchScore >= 80
                      ? 'text-emerald-400'
                      : matchScore >= 50
                        ? 'text-amber-400'
                        : 'text-slate-500'
                  }`}
                >
                  {matchScore}<span className="text-[10px]">%</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer — submit */}
        <div className="px-4 py-4 border-t border-slate-800 bg-slate-900 flex-shrink-0">
          <button
            onClick={handleSubmit}
            disabled={selectedItems.length === 0 || submitting}
            className="group relative w-full overflow-hidden flex items-center justify-center gap-2 py-3.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed transition-all text-ink-900 text-[14px] font-bold tracking-wide"
          >
            <Zap size={17} className="fill-ink-900" />
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-ink-900 border-t-transparent rounded-full animate-spin" />
                SUBMITTING...
              </span>
            ) : (
              'SUBMIT SWAP OFFER'
            )}
            {!submitting && (
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            )}
          </button>
          <p className="text-center text-[9px] font-mono text-slate-600 mt-2">
            {selectedItems.length === 0
              ? 'Select at least 1 item from your inventory to submit'
              : `Status: OFFER SUBMITTED / PENDING REVIEW — no outbid pressure`}
          </p>
        </div>
      </div>
    </div>
  );
}
