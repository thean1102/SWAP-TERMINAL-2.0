import { useEffect, useMemo, useState } from 'react';
import {
  X,
  ArrowLeftRight,
  Zap,
  Check,
  TrendingUp,
  ArrowUpDown,
  Clock,
  ShieldCheck,
  Crosshair,
  Image as ImageIcon,
} from 'lucide-react';
import type { TradeItem } from '@/data/items';
import type { IncomingOffer } from '@/data/chat';
import { ConditionBars, conditionToTier, tierToLabel } from '@/components/ConditionBars';

interface OffersTerminalProps {
  open: boolean;
  listing: TradeItem | null;
  offers: IncomingOffer[];
  onClose: () => void;
  onExecute: (offer: IncomingOffer) => void;
}

type SortKey = 'matchScore' | 'timestamp';
type SortDir = 'asc' | 'desc';

function CashDiffBadge({ diff }: { diff: number }) {
  const positive = diff > 0;
  const neutral = diff === 0;
  return (
    <span
      className={`font-mono text-[11px] font-bold tnum px-1.5 py-0.5 rounded ${
        neutral
          ? 'text-slate-500 bg-slate-800/60'
          : positive
            ? 'text-emerald-400 bg-emerald-500/10'
            : 'text-red-400 bg-red-500/10'
      }`}
    >
      {positive ? '+' : ''}
      {diff === 0 ? '$0' : diff > 0 ? `$${diff}` : `-$${Math.abs(diff)}`}
    </span>
  );
}

function MatchScoreCell({ score }: { score: number }) {
  const color = score >= 90 ? 'text-emerald-400' : score >= 75 ? 'text-amber-400' : 'text-slate-400';
  return (
    <span className={`font-mono text-[13px] font-bold tnum ${color}`}>
      {score}<span className="text-[9px]">%</span>
    </span>
  );
}

function OfferRow({
  offer,
  index,
  selected,
  onSelect,
}: {
  offer: IncomingOffer;
  index: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const isClosed = offer.state !== 'active';
  return (
    <button
      onClick={onSelect}
      disabled={isClosed}
      className={`w-full grid grid-cols-[28px_1fr_auto_auto_auto] items-center gap-2 px-3 py-2.5 text-left transition-colors border-b border-slate-800/60 ${
        selected
          ? 'bg-emerald-500/10 border-l-2 border-l-emerald-400'
          : isClosed
            ? 'opacity-40 cursor-not-allowed'
            : 'hover:bg-slate-800/40'
      }`}
    >
      <span className="text-[10px] font-mono font-bold text-slate-600 tnum">
        {String(index + 1).padStart(2, '0')}
      </span>
      {/* Offerer + item */}
      <div className="flex items-center gap-2.5 min-w-0">
        <img src={offer.offererItemImage} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0 border border-slate-700" />
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-slate-200 truncate">{offer.offererItemTitle}</p>
          <p className="text-[9px] text-slate-500 truncate">{offer.offererName}</p>
        </div>
      </div>
      {/* Cash diff */}
      <CashDiffBadge diff={offer.cashDiff} />
      {/* Match score */}
      <MatchScoreCell score={offer.matchScore} />
      {/* State badge */}
      <span className="pr-1">
        {offer.state === 'matched' ? (
          <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
            Matched
          </span>
        ) : offer.state === 'closed' ? (
          <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
            Closed
          </span>
        ) : (
          <span className="text-[8px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
            Active
          </span>
        )}
      </span>
    </button>
  );
}

function ComparisonPanel({
  listing,
  offer,
}: {
  listing: TradeItem;
  offer: IncomingOffer;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 p-4 bg-slate-900/60 border-t border-slate-800">
      {/* Your item */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-sky-400">Your Listing</span>
        </div>
        <img src={listing.images[0]} alt="" className="w-full h-28 rounded-lg object-cover border border-slate-700" />
        <p className="text-[12px] font-bold text-slate-200 truncate">{listing.title}</p>
        <div className="flex items-center gap-2">
          <ConditionBars tier={conditionToTier(listing.condition, listing.conditionScore)} size="sm" theme="dark" />
          <span className="text-[10px] font-medium text-slate-400">{tierToLabel(conditionToTier(listing.condition, listing.conditionScore))}</span>
        </div>
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-slate-500 font-mono">EST. VALUE</span>
          <span className="font-mono font-bold text-slate-200 tnum">{listing.estimatedValue}</span>
        </div>
      </div>

      {/* Their offer */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400">Incoming Offer</span>
        </div>
        <img src={offer.offererItemImage} alt="" className="w-full h-28 rounded-lg object-cover border border-slate-700" />
        <p className="text-[12px] font-bold text-slate-200 truncate">{offer.offererItemTitle}</p>
        <div className="flex items-center gap-2">
          <ConditionBars tier={conditionToTier(offer.offererCondition, offer.offererConditionScore)} size="sm" theme="dark" />
          <span className="text-[10px] font-medium text-slate-400">{tierToLabel(conditionToTier(offer.offererCondition, offer.offererConditionScore))}</span>
        </div>
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-slate-500 font-mono">EST. VALUE</span>
          <span className="font-mono font-bold text-slate-200 tnum">{offer.offererEstimatedValue}</span>
        </div>
      </div>

      {/* Cash adjustment summary */}
      <div className="col-span-2 flex items-center gap-3 pt-2.5 border-t border-slate-800">
        <div className="flex-1 flex items-center gap-2">
          <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500">Cash Adjustment</span>
          <CashDiffBadge diff={offer.cashDiff} />
        </div>
        <div className="flex-1 flex items-center gap-2 justify-end">
          <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500">Match Score</span>
          <MatchScoreCell score={offer.matchScore} />
        </div>
      </div>
    </div>
  );
}

function ExecuteButton({
  offer,
  onExecute,
  executing,
}: {
  offer: IncomingOffer;
  onExecute: () => void;
  executing: boolean;
}) {
  if (offer.state === 'matched') {
    return (
      <div className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[12px] font-bold">
        <Check size={14} /> Swap Executed — Chat Launched
      </div>
    );
  }
  if (offer.state === 'closed') {
    return (
      <div className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-500 text-[12px] font-bold">
        Offer Closed
      </div>
    );
  }
  return (
    <button
      onClick={onExecute}
      disabled={executing}
      className="flex-1 group relative overflow-hidden flex items-center justify-center gap-2 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-50 transition-all text-ink-900 text-[13px] font-bold tracking-wide"
    >
      <Zap size={16} className="fill-ink-900" />
      {executing ? 'EXECUTING...' : 'EXECUTE SWAP'}
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
    </button>
  );
}

export function OffersTerminal({ open, listing, offers, onClose, onExecute }: OffersTerminalProps) {
  const [sortKey, setSortKey] = useState<SortKey>('matchScore');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [executing, setExecuting] = useState(false);
  const [localOffers, setLocalOffers] = useState<IncomingOffer[]>(offers);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    setLocalOffers(offers);
    setSelectedId(offers[0]?.id ?? null);
    setExecuting(false);
    setConfirming(false);
  }, [offers, listing]);

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

  const sortedOffers = useMemo(() => {
    const sorted = [...localOffers].sort((a, b) => {
      let cmp: number;
      if (sortKey === 'matchScore') cmp = a.matchScore - b.matchScore;
      else cmp = a.timestamp - b.timestamp;
      return sortDir === 'desc' ? -cmp : cmp;
    });
    return sorted;
  }, [localOffers, sortKey, sortDir]);

  const selectedOffer = sortedOffers.find((o) => o.id === selectedId) ?? sortedOffers[0] ?? null;
  const activeCount = localOffers.filter((o) => o.state === 'active').length;

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const handleExecute = () => {
    if (!selectedOffer || selectedOffer.state !== 'active') return;
    setConfirming(true);
  };

  const confirmExecute = () => {
    if (!selectedOffer) return;
    setExecuting(true);
    setTimeout(() => {
      setLocalOffers((prev) =>
        prev.map((o) =>
          o.id === selectedOffer.id
            ? { ...o, state: 'matched' as const }
            : o.state === 'active'
              ? { ...o, state: 'closed' as const }
              : o,
        ),
      );
      setExecuting(false);
      setConfirming(false);
      onExecute(selectedOffer);
    }, 900);
  };

  if (!open || !listing) return null;

  return (
    <div
      className="fixed inset-0 z-[55] flex items-center justify-center p-0 sm:p-4 bg-ink-900/70 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
      onClick={onClose}
    >
      <div
        className="relative w-full h-full sm:max-w-5xl sm:max-h-[92vh] bg-slate-950 sm:rounded-xl overflow-hidden border border-slate-800 flex flex-col animate-[scaleIn_0.25s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Terminal header bar */}
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-900 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded bg-emerald-500/15 border border-emerald-500/30">
              <Crosshair size={14} className="text-emerald-400" />
            </span>
            <div>
              <h2 className="text-[13px] font-bold text-slate-100 tracking-tight">Incoming Offers Terminal</h2>
              <p className="text-[9px] font-mono text-slate-500">
                {listing.title} · {activeCount} active offers
              </p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-[9px] font-mono text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE MATCHING ENGINE
            </div>
            <button
              onClick={onClose}
              aria-label="Close terminal"
              className="w-7 h-7 rounded-md bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Main split: order book + comparison */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Order book table */}
          <div className="flex flex-col flex-1 min-w-0 border-r border-slate-800">
            {/* Column headers */}
            <div className="grid grid-cols-[28px_1fr_auto_auto_auto] items-center gap-2 px-3 py-2 bg-slate-900/80 border-b border-slate-800 flex-shrink-0">
              <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-slate-600">#</span>
              <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-slate-500">Offer / User</span>
              <button
                onClick={() => {}}
                className="text-[8px] font-mono font-bold uppercase tracking-wider text-slate-500 text-left"
              >
                Cash Diff
              </button>
              <button
                onClick={() => toggleSort('matchScore')}
                className={`flex items-center gap-0.5 text-[8px] font-mono font-bold uppercase tracking-wider transition-colors ${
                  sortKey === 'matchScore' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Match
                {sortKey === 'matchScore' && (
                  <ArrowUpDown size={9} className={sortDir === 'desc' ? 'rotate-180' : ''} />
                )}
              </button>
              <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-slate-500">Status</span>
            </div>

            {/* Rows */}
            <div className="flex-1 overflow-y-auto">
              {sortedOffers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                  <p className="text-[13px] font-semibold text-slate-400">No incoming offers</p>
                  <p className="text-[11px] text-slate-600 mt-1">Offers will appear here when traders propose swaps on your listing.</p>
                </div>
              ) : (
                sortedOffers.map((offer, idx) => (
                  <OfferRow
                    key={offer.id}
                    offer={offer}
                    index={idx}
                    selected={offer.id === selectedOffer?.id}
                    onSelect={() => setSelectedId(offer.id)}
                  />
                ))
              )}
            </div>

            {/* Sort hint footer */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/60 border-t border-slate-800 flex-shrink-0">
              <Clock size={10} className="text-slate-600" />
              <span className="text-[8px] font-mono text-slate-600">
                Sorted by {sortKey === 'matchScore' ? 'MATCH SCORE' : 'TIMESTAMP'} · {sortDir === 'desc' ? 'HIGH→LOW' : 'LOW→HIGH'}
              </span>
              <button
                onClick={() => toggleSort('timestamp')}
                className={`ml-auto text-[8px] font-mono font-bold uppercase tracking-wider transition-colors ${
                  sortKey === 'timestamp' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Sort by Time {sortKey === 'timestamp' && <ArrowUpDown size={8} className="inline" />}
              </button>
            </div>
          </div>

          {/* Right: comparison + execution */}
          <div className="flex flex-col w-full lg:w-[48%] min-w-0 overflow-y-auto bg-slate-950">
            {selectedOffer ? (
              <>
                {/* Comparison header */}
                <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 flex-shrink-0">
                  <ArrowLeftRight size={13} className="text-emerald-400" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-300">
                    Side-by-Side Comparison
                  </span>
                  <span className="ml-auto flex items-center gap-1 text-[9px] font-mono text-slate-500">
                    <ShieldCheck size={10} className="text-emerald-400" />
                    {selectedOffer.offererName}
                  </span>
                </div>

                <ComparisonPanel listing={listing} offer={selectedOffer} />

                {/* Execution footer */}
                <div className="mt-auto p-4 border-t border-slate-800 bg-slate-900/60">
                  {confirming ? (
                    <div className="space-y-3">
                      <div className="text-center">
                        <p className="text-[11px] font-mono text-amber-400 mb-2">
                          {'>'} CONFIRM EXECUTION: This will match with {selectedOffer.offererName} and close all other offers.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={confirmExecute}
                          disabled={executing}
                          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-50 transition-all text-ink-900 text-[12px] font-bold"
                        >
                          {executing ? (
                            <><span className="w-3 h-3 border-2 border-ink-900 border-t-transparent rounded-full animate-spin" /> MATCHING...</>
                          ) : (
                            <><Check size={15} /> CONFIRM MATCH</>
                          )}
                        </button>
                        <button
                          onClick={() => setConfirming(false)}
                          className="px-4 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-[12px] font-bold transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <ExecuteButton offer={selectedOffer} onExecute={handleExecute} executing={executing} />
                    </div>
                  )}
                  <p className="text-center text-[9px] font-mono text-slate-600 mt-2">
                    Other active offers will be auto-closed with notification
                  </p>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center px-6">
                <Crosshair size={28} className="text-slate-700 mb-3" />
                <p className="text-[13px] font-semibold text-slate-400">Select an offer to compare</p>
                <p className="text-[11px] text-slate-600 mt-1">Click any row in the order book to view the side-by-side comparison.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
