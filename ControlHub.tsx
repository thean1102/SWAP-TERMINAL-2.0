import { useState } from 'react';
import {
  X,
  Backpack,
  Bookmark,
  History,
  User,
  Settings,
  ChevronRight,
  Plus,
  Package,
  TrendingUp,
  Shield,
  Star,
  MapPin,
  Maximize2,
} from 'lucide-react';
import type { TradeItem } from '@/data/items';
import { ConditionBars, conditionToTier, tierToLabel } from '@/components/ConditionBars';

export type HubPanel = 'menu' | 'inventory' | 'saved' | 'history' | 'profile' | 'settings';

interface ControlHubProps {
  open: boolean;
  onClose: () => void;
  inventory: TradeItem[];
  onAddItem: () => void;
  onOpenInventory: () => void;
}

interface HubMenuItem {
  id: HubPanel;
  label: string;
  icon: typeof Backpack;
  accent: string;
  desc: string;
}

const MENU_ITEMS: HubMenuItem[] = [
  { id: 'inventory', label: 'My Inventory', icon: Backpack, accent: 'text-emerald-400', desc: 'Your stash & active listings' },
  { id: 'saved', label: 'Saved Items', icon: Bookmark, accent: 'text-sky-400', desc: 'Bookmarked listings' },
  { id: 'history', label: 'Trade History', icon: History, accent: 'text-amber-400', desc: 'Past swaps & offers' },
  { id: 'profile', label: 'Profile & Reputation', icon: User, accent: 'text-violet-400', desc: 'Your trader stats' },
  { id: 'settings', label: 'Settings & Safety', icon: Settings, accent: 'text-slate-400', desc: 'Preferences & privacy' },
];

function InventoryPanel({
  inventory,
  onAddItem,
  onBack,
}: {
  inventory: TradeItem[];
  onAddItem: () => void;
  onBack: () => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800">
        <button onClick={onBack} className="text-slate-500 hover:text-slate-300 text-[11px] font-mono">← back</button>
        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
          <Backpack size={12} /> My Inventory
        </span>
        <span className="ml-auto text-[10px] font-mono text-slate-600 tnum">{inventory.length} items</span>
      </div>
      <div className="px-4 py-3">
        <button
          onClick={onAddItem}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[12px] font-semibold hover:bg-emerald-500/20 transition-colors mb-3"
        >
          <Plus size={14} /> Add New Item
        </button>
        {inventory.length === 0 ? (
          <div className="text-center py-10">
            <Package size={32} className="text-slate-700 mx-auto mb-3" />
            <p className="text-[12px] font-semibold text-slate-500">No items yet</p>
            <p className="text-[10px] text-slate-600 mt-1">Add your first item to start trading</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {inventory.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors">
                <img src={item.images[0]} alt="" className="w-12 h-12 rounded-md object-cover border border-slate-700 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-semibold text-slate-200 truncate">{item.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <ConditionBars tier={conditionToTier(item.condition, item.conditionScore)} size="sm" theme="dark" />
                    <span className="text-[9px] text-slate-500">{tierToLabel(conditionToTier(item.condition, item.conditionScore))}</span>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="font-mono text-[11px] font-bold text-slate-200 tnum">{item.estimatedValue}</p>
                  <p className="text-[8px] text-slate-600 tnum">{item.views} views</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SavedPanel({ onBack }: { onBack: () => void }) {
  return (
    <div>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800">
        <button onClick={onBack} className="text-slate-500 hover:text-slate-300 text-[11px] font-mono">← back</button>
        <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
          <Bookmark size={12} /> Saved Items
        </span>
      </div>
      <div className="text-center py-12">
        <Bookmark size={32} className="text-slate-700 mx-auto mb-3" />
        <p className="text-[12px] font-semibold text-slate-500">No saved items yet</p>
        <p className="text-[10px] text-slate-600 mt-1">Bookmark listings to find them quickly</p>
      </div>
    </div>
  );
}

function HistoryPanel({ onBack }: { onBack: () => void }) {
  const trades = [
    { id: 't1', item: 'Canon EOS R6', partner: 'Marcus T.', date: 'Oct 18', status: 'Completed', value: '$1,800' },
    { id: 't2', item: 'AirPods Pro', partner: 'Sarah K.', date: 'Oct 12', status: 'Completed', value: '$220' },
    { id: 't3', item: 'IKEA Desk', partner: 'James L.', date: 'Oct 5', status: 'Cancelled', value: '$150' },
    { id: 't4', item: 'GoPro Hero 11', partner: 'Nina P.', date: 'Sep 28', status: 'Completed', value: '$420' },
  ];
  return (
    <div>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800">
        <button onClick={onBack} className="text-slate-500 hover:text-slate-300 text-[11px] font-mono">← back</button>
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
          <History size={12} /> Trade History
        </span>
      </div>
      <div className="px-4 py-3 space-y-2.5">
        {trades.map((t) => (
          <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-900 border border-slate-800">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${t.status === 'Completed' ? 'bg-emerald-500' : 'bg-red-500'}`} />
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-semibold text-slate-200 truncate">{t.item}</p>
              <p className="text-[9px] text-slate-500">{t.partner} · {t.date}</p>
            </div>
            <div className="flex-shrink-0 text-right">
              <p className="font-mono text-[11px] font-bold text-slate-300 tnum">{t.value}</p>
              <p className={`text-[8px] font-semibold uppercase ${t.status === 'Completed' ? 'text-emerald-400' : 'text-red-400'}`}>{t.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfilePanel({ onBack }: { onBack: () => void }) {
  const stats = [
    { label: 'Total Swaps', value: '14', icon: TrendingUp, color: 'text-emerald-400' },
    { label: 'Avg Match', value: '87%', icon: Star, color: 'text-amber-400' },
    { label: 'Response Time', value: '~11m', icon: Shield, color: 'text-sky-400' },
    { label: 'Rating', value: '4.9/5', icon: Star, color: 'text-violet-400' },
  ];
  return (
    <div>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800">
        <button onClick={onBack} className="text-slate-500 hover:text-slate-300 text-[11px] font-mono">← back</button>
        <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400 flex items-center gap-1.5">
          <User size={12} /> Profile & Reputation
        </span>
      </div>
      <div className="px-4 py-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-slate-700 flex items-center justify-center text-[20px] font-bold text-white border border-slate-600">
            Y
          </div>
          <div>
            <p className="text-[14px] font-bold text-slate-100">You</p>
            <p className="text-[10px] text-slate-500 flex items-center gap-1"><MapPin size={9} /> Cabramatta, NSW</p>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[9px] font-bold text-emerald-400 mt-1">
              <Shield size={8} /> Verified Trader
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {stats.map((s) => (
            <div key={s.label} className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-900 border border-slate-800">
              <s.icon size={16} className={s.color} />
              <div>
                <p className="font-mono text-[14px] font-bold text-slate-200 tnum">{s.value}</p>
                <p className="text-[8px] uppercase tracking-wider text-slate-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingsPanel({ onBack }: { onBack: () => void }) {
  const toggles = [
    { label: 'Show my listings publicly', desc: 'Visible in browse feed', on: true },
    { label: 'New offer notifications', desc: 'Push when someone offers', on: true },
    { label: 'Match score suggestions', desc: 'AI-powered swap ideas', on: true },
    { label: 'Location precision', desc: 'Show exact suburb', on: false },
  ];
  return (
    <div>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800">
        <button onClick={onBack} className="text-slate-500 hover:text-slate-300 text-[11px] font-mono">← back</button>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Settings size={12} /> Settings & Safety
        </span>
      </div>
      <div className="px-4 py-3 space-y-2.5">
        {toggles.map((t) => (
          <div key={t.label} className="flex items-center gap-3 p-3 rounded-lg bg-slate-900 border border-slate-800">
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-semibold text-slate-200">{t.label}</p>
              <p className="text-[9px] text-slate-500">{t.desc}</p>
            </div>
            <div className={`w-9 h-5 rounded-full flex-shrink-0 relative transition-colors ${t.on ? 'bg-emerald-500' : 'bg-slate-700'}`}>
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${t.on ? 'left-4.5' : 'left-0.5'}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ControlHub({ open, onClose, inventory, onAddItem, onOpenInventory }: ControlHubProps) {
  const [panel, setPanel] = useState<HubPanel>('menu');

  const handleBack = () => setPanel('menu');

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-[58] bg-ink-900/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 z-[59] h-full w-full sm:w-[380px] max-w-[420px] bg-slate-950 border-l border-slate-800 flex flex-col transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 bg-slate-900 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded bg-emerald-500/15 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </span>
            <div>
              <h2 className="text-[14px] font-bold text-slate-100 tracking-tight">Control Hub</h2>
              <p className="text-[9px] font-mono text-slate-500">SYS_PANEL · v3.0</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close hub"
            className="ml-auto w-7 h-7 rounded-md bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {panel === 'menu' && (
            <div className="p-3 space-y-1.5">
              {MENU_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setPanel(item.id)}
                  className="group w-full flex items-center gap-3 px-3 py-3.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-600 transition-colors text-left"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-800 border border-slate-700 group-hover:border-slate-500 transition-colors">
                    <item.icon size={15} className={item.accent} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-semibold text-slate-200">{item.label}</p>
                    <p className="text-[9px] text-slate-500 truncate">{item.desc}</p>
                  </div>
                  {item.id === 'inventory' && inventory.length > 0 && (
                    <span className="flex-shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-[9px] font-bold tnum border border-emerald-500/20">
                      {inventory.length}
                    </span>
                  )}
                  <ChevronRight size={14} className="text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
          {panel === 'inventory' && (
            <div className="p-3 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <button onClick={handleBack} className="text-slate-500 hover:text-slate-300 text-[11px] font-mono">← back</button>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Backpack size={12} /> My Inventory
                </span>
                <span className="ml-auto text-[10px] font-mono text-slate-600 tnum">{inventory.length} items</span>
              </div>
              <button
                onClick={onOpenInventory}
                className="w-full flex items-center justify-center gap-1.5 py-3 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-[12px] font-bold hover:bg-emerald-500/20 transition-colors"
              >
                <Maximize2 size={14} /> Open Floating Inventory Window
              </button>
              <button
                onClick={onAddItem}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 text-[12px] font-semibold hover:bg-slate-700 transition-colors"
              >
                <Plus size={14} /> Add New Item
              </button>
              {inventory.length === 0 ? (
                <div className="text-center py-10">
                  <Package size={32} className="text-slate-700 mx-auto mb-3" />
                  <p className="text-[12px] font-semibold text-slate-500">No items yet</p>
                  <p className="text-[10px] text-slate-600 mt-1">Add your first item to start trading</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {inventory.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors">
                      <img src={item.images[0]} alt="" className="w-10 h-10 rounded-md object-cover border border-slate-700 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-semibold text-slate-200 truncate">{item.title}</p>
                        <p className="font-mono text-[10px] text-slate-400 tnum">{item.estimatedValue}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {panel === 'saved' && <SavedPanel onBack={handleBack} />}
          {panel === 'history' && <HistoryPanel onBack={handleBack} />}
          {panel === 'profile' && <ProfilePanel onBack={handleBack} />}
          {panel === 'settings' && <SettingsPanel onBack={handleBack} />}
        </div>
      </aside>
    </>
  );
}
