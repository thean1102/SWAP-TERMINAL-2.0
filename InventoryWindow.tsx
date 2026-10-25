import { useEffect, useRef, useState, useCallback } from 'react';
import {
  X,
  Minus,
  Maximize2,
  ChevronDown,
  ChevronUp,
  Plus,
  Package,
  Backpack,
  TrendingUp,
  ArrowLeftRight,
  Eye,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import type { TradeItem } from '@/data/items';
import { ConditionBars, conditionToTier, tierToLabel } from '@/components/ConditionBars';

export interface ActiveOffer {
  id: string;
  targetItemTitle: string;
  targetItemImage: string;
  targetOwner: string;
  cashTopUp: string;
  matchScore: number;
  status: 'pending' | 'reviewing' | 'matched' | 'cancelled';
  threadId: string;
}

export interface InventoryItem extends TradeItem {
  stashStatus: 'listed' | 'stash';
  activeOffers: ActiveOffer[];
}

interface InventoryWindowProps {
  open: boolean;
  onClose: () => void;
  inventory: TradeItem[];
  onAddItem: () => void;
  onViewTradeBoard: (offer: ActiveOffer, myItem: TradeItem) => void;
  onCancelOffer: (offerId: string) => void;
}

type WinState = 'normal' | 'maximized' | 'minimized';
type ResizeDir = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

const DEFAULT_POS = { x: 60, y: 80 };
const DEFAULT_SIZE = { w: 950, h: 600 };
const MIN_W = 360;
const MIN_H = 320;

function StatusBadge({ status }: { status: 'listed' | 'stash' }) {
  if (status === 'listed') {
    return (
      <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
        Listed
      </span>
    );
  }
  return (
    <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500 bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded">
      In Stash
    </span>
  );
}

function OfferStatusLabel({ status }: { status: ActiveOffer['status'] }) {
  const styles: Record<ActiveOffer['status'], string> = {
    pending: 'text-amber-400',
    reviewing: 'text-sky-400',
    matched: 'text-emerald-400',
    cancelled: 'text-red-400',
  };
  const labels: Record<ActiveOffer['status'], string> = {
    pending: 'PENDING REVIEW',
    reviewing: 'REVIEWING',
    matched: 'MATCHED',
    cancelled: 'CANCELLED',
  };
  return <span className={`text-[8px] font-mono font-bold ${styles[status]}`}>{labels[status]}</span>;
}

function CompactItemCard({
  item,
  onViewTradeBoard,
  onCancelOffer,
}: {
  item: InventoryItem;
  onViewTradeBoard: (offer: ActiveOffer, myItem: TradeItem) => void;
  onCancelOffer: (offerId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const offerCount = item.activeOffers.length;
  const hasOffers = offerCount > 0;
  const firstActiveOffer = item.activeOffers[0];

  return (
    <div className="flex flex-col rounded-lg bg-slate-900 border border-slate-800 overflow-hidden hover:border-slate-600 transition-colors">
      {/* Horizontal row: thumbnail | info | tags */}
      <div className="flex items-center gap-3 p-2.5">
        {/* Thumbnail */}
        <img src={item.images[0]} alt="" className="w-12 h-12 rounded-md object-cover border border-slate-700 flex-shrink-0" />

        {/* Middle: title + condition */}
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-semibold text-slate-200 truncate">{item.title}</p>
          <div className="flex items-center gap-2 mt-1">
            <ConditionBars tier={conditionToTier(item.condition, item.conditionScore)} size="sm" theme="dark" />
            <span className="text-[9px] text-slate-500">{tierToLabel(conditionToTier(item.condition, item.conditionScore))}</span>
          </div>
        </div>

        {/* Right: status tags + price */}
        <div className="flex-shrink-0 flex flex-col items-end gap-1">
          <div className="flex items-center gap-1 flex-wrap justify-end">
            <StatusBadge status={item.stashStatus} />
            {hasOffers && (
              <span className="text-[8px] font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 border border-sky-500/20 px-1.5 py-0.5 rounded">
                Multi-Offer ({offerCount})
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[13px] font-bold text-slate-100 tnum">{item.estimatedValue}</span>
            {hasOffers && (
              <span className="flex items-center gap-0.5 text-[9px] font-mono font-bold text-emerald-400 tnum">
                <TrendingUp size={9} />{item.activeOffers[0].matchScore}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Offer summary toggle */}
      {hasOffers && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 border-t border-slate-800 bg-slate-950/50 hover:bg-slate-800/40 transition-colors text-left w-full"
        >
          {expanded ? <ChevronUp size={10} className="text-slate-500" /> : <ChevronDown size={10} className="text-slate-500" />}
          <span className="text-[9px] font-mono text-slate-500">
            {offerCount} active offer{offerCount > 1 ? 's' : ''}
          </span>
          {firstActiveOffer && firstActiveOffer.status !== 'cancelled' && firstActiveOffer.status !== 'matched' && (
            <button
              onClick={(e) => { e.stopPropagation(); onViewTradeBoard(firstActiveOffer, item); }}
              className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-semibold hover:bg-emerald-500/20 transition-colors"
            >
              <ExternalLink size={9} /> View Trade Board
            </button>
          )}
        </button>
      )}

      {/* Expanded offer list */}
      {hasOffers && expanded && (
        <div className="border-t border-slate-800/60 bg-slate-950/40 p-2 space-y-1.5">
          {item.activeOffers.map((offer, idx) => (
            <div key={offer.id} className="rounded-lg bg-slate-950 border border-slate-800 p-2">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono font-bold text-slate-600 tnum flex-shrink-0">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <img src={offer.targetItemImage} alt="" className="w-7 h-7 rounded object-cover border border-slate-700 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold text-slate-300 truncate">{offer.targetItemTitle}</p>
                  <p className="text-[8px] text-slate-500">
                    {offer.targetOwner} · {offer.cashTopUp !== '$0' ? offer.cashTopUp : 'Even'}
                  </p>
                </div>
                <OfferStatusLabel status={offer.status} />
              </div>
              {offer.status !== 'cancelled' && offer.status !== 'matched' && (
                <div className="flex gap-1.5 mt-1.5 pl-9">
                  <button
                    onClick={() => onViewTradeBoard(offer, item)}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-semibold hover:bg-emerald-500/20 transition-colors"
                  >
                    <ExternalLink size={8} /> Trade Board
                  </button>
                  <button
                    onClick={() => onCancelOffer(offer.id)}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-[8px] font-semibold hover:bg-red-500/20 transition-colors"
                  >
                    <XCircle size={8} /> Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TradeBoardModal({
  offer,
  myItem,
  onClose,
}: {
  offer: ActiveOffer;
  myItem: TradeItem;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[62] flex items-center justify-center p-4 bg-ink-900/70 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[88vh] bg-slate-950 sm:rounded-xl overflow-hidden border border-slate-800 flex flex-col animate-[scaleIn_0.25s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-900 border-b border-slate-800 flex-shrink-0">
          <span className="flex h-7 w-7 items-center justify-center rounded bg-emerald-500/15 border border-emerald-500/30">
            <ArrowLeftRight size={14} className="text-emerald-400" />
          </span>
          <div>
            <h2 className="text-[13px] font-bold text-slate-100 tracking-tight">Trade Board</h2>
            <p className="text-[9px] font-mono text-slate-500">
              Offer to {offer.targetOwner} · <OfferStatusLabel status={offer.status} />
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="ml-auto w-7 h-7 rounded-md bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3 p-4">
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-sky-400">Your Item</span>
              </div>
              <img src={myItem.images[0]} alt="" className="w-full h-28 rounded-lg object-cover border border-slate-700" />
              <p className="text-[12px] font-bold text-slate-200 truncate">{myItem.title}</p>
              <div className="flex items-center gap-2">
                <ConditionBars tier={conditionToTier(myItem.condition, myItem.conditionScore)} size="sm" theme="dark" />
                <span className="text-[10px] text-slate-400">{tierToLabel(conditionToTier(myItem.condition, myItem.conditionScore))}</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-500 font-mono">EST. VALUE</span>
                <span className="font-mono font-bold text-slate-200 tnum">{myItem.estimatedValue}</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400">Target Item</span>
              </div>
              <img src={offer.targetItemImage} alt="" className="w-full h-28 rounded-lg object-cover border border-slate-700" />
              <p className="text-[12px] font-bold text-slate-200 truncate">{offer.targetItemTitle}</p>
              <p className="text-[10px] text-slate-500">{offer.targetOwner}</p>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-500 font-mono">CASH TOP-UP</span>
                <span className={`font-mono font-bold tnum ${offer.cashTopUp !== '$0' ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {offer.cashTopUp}
                </span>
              </div>
            </div>
          </div>

          <div className="px-4 pb-4">
            <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-700 bg-slate-900">
              <TrendingUp size={16} className={offer.matchScore >= 80 ? 'text-emerald-400' : 'text-amber-400'} />
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Match Score</span>
              <div className="ml-auto flex items-center gap-2">
                <div className="w-20 h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${offer.matchScore >= 80 ? 'bg-emerald-500' : 'bg-amber-400'}`}
                    style={{ width: `${offer.matchScore}%` }}
                  />
                </div>
                <span className={`font-mono text-[16px] font-bold tnum ${offer.matchScore >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {offer.matchScore}%
                </span>
              </div>
            </div>
          </div>

          <div className="px-4 pb-4">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-2 block">Active Chat Log</span>
            <div className="rounded-lg border border-slate-800 bg-slate-900 p-3 space-y-2">
              <div className="flex justify-start">
                <div className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-[10px] max-w-[80%]">
                  System: SWAP OFFER INITIATED — Offering {myItem.title} for {offer.targetItemTitle}
                </div>
              </div>
              <div className="flex justify-start">
                <div className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-[10px] max-w-[80%]">
                  System: OFFER SUBMITTED · PENDING REVIEW — awaiting response from {offer.targetOwner}.
                </div>
              </div>
              <p className="text-center text-[8px] text-slate-600 pt-1">Chat thread active — open full chat to reply</p>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 border-t border-slate-800 bg-slate-900 flex-shrink-0 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[12px] font-bold transition-colors"
          >
            Close Board
          </button>
        </div>
      </div>
    </div>
  );
}

const RESIZE_HANDLES: { dir: ResizeDir; className: string }[] = [
  { dir: 'n', className: 'top-0 left-2 right-2 h-1.5 cursor-n-resize' },
  { dir: 's', className: 'bottom-0 left-2 right-2 h-1.5 cursor-s-resize' },
  { dir: 'e', className: 'right-0 top-2 bottom-2 w-1.5 cursor-e-resize' },
  { dir: 'w', className: 'left-0 top-2 bottom-2 w-1.5 cursor-w-resize' },
  { dir: 'ne', className: 'top-0 right-0 w-3 h-3 cursor-ne-resize' },
  { dir: 'nw', className: 'top-0 left-0 w-3 h-3 cursor-nw-resize' },
  { dir: 'se', className: 'bottom-0 right-0 w-3 h-3 cursor-se-resize' },
  { dir: 'sw', className: 'bottom-0 left-0 w-3 h-3 cursor-sw-resize' },
];

export function InventoryWindow({
  open,
  onClose,
  inventory,
  onAddItem,
  onViewTradeBoard,
  onCancelOffer,
}: InventoryWindowProps) {
  const [winState, setWinState] = useState<WinState>('normal');
  const [pos, setPos] = useState(DEFAULT_POS);
  const [size, setSize] = useState(DEFAULT_SIZE);
  const dragRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ dragging: boolean; offsetX: number; offsetY: number }>({ dragging: false, offsetX: 0, offsetY: 0 });
  const resizeState = useRef<{ resizing: boolean; dir: ResizeDir; startX: number; startY: number; startW: number; startH: number; startPosX: number; startPosY: number }>({ resizing: false, dir: 'se', startX: 0, startY: 0, startW: 0, startH: 0, startPosX: 0, startPosY: 0 });
  const [tradeBoardOffer, setTradeBoardOffer] = useState<{ offer: ActiveOffer; myItem: TradeItem } | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (dragState.current.dragging && winState === 'normal') {
        const newX = Math.max(0, Math.min(window.innerWidth - 200, e.clientX - dragState.current.offsetX));
        const newY = Math.max(0, Math.min(window.innerHeight - 60, e.clientY - dragState.current.offsetY));
        setPos({ x: newX, y: newY });
      }
      if (resizeState.current.resizing) {
        const dx = e.clientX - resizeState.current.startX;
        const dy = e.clientY - resizeState.current.startY;
        const dir = resizeState.current.dir;
        let newW = resizeState.current.startW;
        let newH = resizeState.current.startH;
        let newX = resizeState.current.startPosX;
        let newY = resizeState.current.startPosY;

        if (dir.includes('e')) newW = Math.max(MIN_W, resizeState.current.startW + dx);
        if (dir.includes('s')) newH = Math.max(MIN_H, resizeState.current.startH + dy);
        if (dir.includes('w')) {
          newW = Math.max(MIN_W, resizeState.current.startW - dx);
          newX = resizeState.current.startPosX + (resizeState.current.startW - newW);
        }
        if (dir.includes('n')) {
          newH = Math.max(MIN_H, resizeState.current.startH - dy);
          newY = resizeState.current.startPosY + (resizeState.current.startH - newH);
        }

        newW = Math.min(newW, window.innerWidth - newX - 10);
        newH = Math.min(newH, window.innerHeight - newY - 10);
        setSize({ w: newW, h: newH });
        setPos({ x: newX, y: newY });
      }
    };
    const handleMouseUp = () => {
      dragState.current.dragging = false;
      resizeState.current.resizing = false;
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [open, winState]);

  const handleDragStart = (e: React.MouseEvent) => {
    if (winState !== 'normal') return;
    dragState.current = {
      dragging: true,
      offsetX: e.clientX - pos.x,
      offsetY: e.clientY - pos.y,
    };
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'grabbing';
  };

  const handleResizeStart = (e: React.MouseEvent, dir: ResizeDir) => {
    e.stopPropagation();
    resizeState.current = {
      resizing: true,
      dir,
      startX: e.clientX,
      startY: e.clientY,
      startW: size.w,
      startH: size.h,
      startPosX: pos.x,
      startPosY: pos.y,
    };
    document.body.style.userSelect = 'none';
    document.body.style.cursor = `${dir}-resize`;
  };

  const inventoryWithOffers: InventoryItem[] = inventory.map((item, idx) => {
    if (idx === 0) {
      return {
        ...item,
        stashStatus: 'listed' as const,
        activeOffers: [
          {
            id: `offer-${item.id}-1`,
            targetItemTitle: 'Canon EOS R6 Mirrorless Camera',
            targetItemImage: 'https://images.pexels.com/photos/2422915/pexels-photo-2422915.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
            targetOwner: 'Marcus T.',
            cashTopUp: '$50',
            matchScore: 92,
            status: 'pending' as const,
            threadId: `thread-${item.id}-1`,
          },
          {
            id: `offer-${item.id}-2`,
            targetItemTitle: 'PS5 Slim + 2 Controllers',
            targetItemImage: 'https://images.pexels.com/photos/6211561/pexels-photo-6211561.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
            targetOwner: 'Sarah K.',
            cashTopUp: '$0',
            matchScore: 85,
            status: 'pending' as const,
            threadId: `thread-${item.id}-2`,
          },
        ],
      };
    }
    if (idx === 1) {
      return {
        ...item,
        stashStatus: 'listed' as const,
        activeOffers: [
          {
            id: `offer-${item.id}-1`,
            targetItemTitle: 'Custom Mechanical Keyboard',
            targetItemImage: 'https://images.pexels.com/photos/2115256/pexels-photo-2115256.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
            targetOwner: 'James L.',
            cashTopUp: '$20',
            matchScore: 78,
            status: 'pending' as const,
            threadId: `thread-${item.id}-1`,
          },
        ],
      };
    }
    return {
      ...item,
      stashStatus: 'stash' as const,
      activeOffers: [],
    };
  });

  const listedCount = inventoryWithOffers.filter((i) => i.stashStatus === 'listed').length;
  const stashCount = inventoryWithOffers.filter((i) => i.stashStatus === 'stash').length;
  const totalOffers = inventoryWithOffers.reduce((sum, i) => sum + i.activeOffers.length, 0);

  const handleViewTradeBoard = useCallback((offer: ActiveOffer, myItem: TradeItem) => {
    setTradeBoardOffer({ offer, myItem });
  }, []);

  const handleCancelOffer = useCallback((offerId: string) => {
    onCancelOffer(offerId);
  }, [onCancelOffer]);

  if (!open) return null;

  if (winState === 'minimized') {
    return (
      <div className="fixed z-[60] animate-[fadeIn_0.2s_ease-out]" style={{ left: pos.x, top: pos.y }}>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 border border-emerald-500/30 shadow-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <Backpack size={13} className="text-emerald-400" />
          <span className="text-[11px] font-bold text-slate-200">My Inventory</span>
          <span className="text-[9px] font-mono text-slate-500 tnum">{inventory.length} items</span>
          <button
            onClick={() => setWinState('normal')}
            aria-label="Restore"
            className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400"
          >
            <Maximize2 size={11} />
          </button>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-6 h-6 rounded bg-slate-800 hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center text-slate-400"
          >
            <X size={11} />
          </button>
        </div>
      </div>
    );
  }

  const windowStyle: React.CSSProperties = winState === 'maximized'
    ? { left: 0, top: 0, width: '100vw', height: '100vh' }
    : { left: pos.x, top: pos.y, width: size.w, height: size.h };

  return (
    <>
      <div className="fixed z-[60] animate-[fadeIn_0.2s_ease-out]" style={windowStyle}>
        <div className="w-full h-full flex flex-col bg-slate-950 rounded-lg border border-slate-800 shadow-2xl overflow-hidden relative">
          {/* Title bar — draggable */}
          <div
            ref={dragRef}
            onMouseDown={handleDragStart}
            className="flex items-center gap-2 px-3 py-2.5 bg-slate-900 border-b border-slate-800 flex-shrink-0 cursor-grab active:cursor-grabbing select-none"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded bg-emerald-500/15 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </span>
            <Backpack size={13} className="text-emerald-400" />
            <span className="text-[12px] font-bold text-slate-100">My Inventory</span>
            <span className="text-[8px] font-mono text-slate-600 ml-1">FLOAT_WIN · v3.0</span>

            <div className="ml-auto flex items-center gap-1">
              <button
                onClick={() => setWinState('minimized')}
                aria-label="Minimize"
                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 transition-colors"
              >
                <Minus size={12} />
              </button>
              <button
                onClick={() => setWinState(winState === 'maximized' ? 'normal' : 'maximized')}
                aria-label="Maximize"
                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 transition-colors"
              >
                <Maximize2 size={11} />
              </button>
              <button
                onClick={onClose}
                aria-label="Close"
                className="w-6 h-6 rounded bg-slate-800 hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center text-slate-400 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          </div>

          {/* Stats bar */}
          <div className="flex items-center gap-3 px-3 py-2 bg-slate-900/60 border-b border-slate-800 flex-shrink-0 text-[9px] font-mono">
            <span className="text-emerald-400">{listedCount} listed</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-500">{stashCount} in stash</span>
            <span className="text-slate-600">|</span>
            <span className="text-sky-400">{totalOffers} active offers</span>
            <button
              onClick={onAddItem}
              className="ml-auto flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-semibold hover:bg-emerald-500/20 transition-colors"
            >
              <Plus size={10} /> Add Item
            </button>
          </div>

          {/* Content — auto-fit grid, scrollable */}
          <div className="flex-1 overflow-y-auto p-3">
            {inventoryWithOffers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Package size={32} className="text-slate-700 mb-3" />
                <p className="text-[12px] font-semibold text-slate-500">No items in inventory</p>
                <p className="text-[10px] text-slate-600 mt-1 mb-3">Add your first item to start trading</p>
                <button
                  onClick={onAddItem}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold hover:bg-emerald-500/25 transition-colors"
                >
                  <Plus size={13} /> Add New Item
                </button>
              </div>
            ) : (
              <div
                className="grid gap-2.5"
                style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))' }}
              >
                {inventoryWithOffers.map((item) => (
                  <CompactItemCard
                    key={item.id}
                    item={item}
                    onViewTradeBoard={handleViewTradeBoard}
                    onCancelOffer={handleCancelOffer}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Resize handles on all edges and corners */}
          {winState === 'normal' &&
            RESIZE_HANDLES.map((h) => (
              <div
                key={h.dir}
                onMouseDown={(e) => handleResizeStart(e, h.dir)}
                className={`absolute z-10 ${h.className}`}
              />
            ))}
        </div>
      </div>

      {/* Trade Board Modal */}
      {tradeBoardOffer && (
        <TradeBoardModal
          offer={tradeBoardOffer.offer}
          myItem={tradeBoardOffer.myItem}
          onClose={() => setTradeBoardOffer(null)}
        />
      )}
    </>
  );
}
