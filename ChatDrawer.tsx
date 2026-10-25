import { useEffect, useRef, useState } from 'react';
import {
  X,
  Minus,
  Send,
  Paperclip,
  Zap,
  Check,
  ArrowLeftRight,
  XCircle,
  MessageSquare,
  Shield,
  Pin,
  MapPin,
  Coffee,
  Home,
  Calendar,
  Clock,
  Car,
  QrCode,
  ScanLine,
  Camera,
  AlertTriangle,
  PartyPopper,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import type { ChatThread, ChatMessage, OfferStatus, ProtocolState, ProtocolMessageType, MeetupDetails } from '@/data/chat';
import { formatTime } from '@/data/chat';
import { TradeProtocolPanel } from '@/components/TradeProtocolPanel';

interface ChatDrawerProps {
  open: boolean;
  onToggle: () => void;
  threads: ChatThread[];
  activeThreadId: string | null;
  onSelectThread: (id: string) => void;
  onSendMessage: (threadId: string, text: string) => void;
  onOfferAction: (threadId: string, messageId: string, action: 'accept' | 'decline' | 'counter') => void;
  onProposeMeetup: (threadId: string, details: {
    mode: 'safe-zone' | 'home-base';
    location: { name: string; address: string; distanceKm: number; type: string } | null;
    homeOwner: string | null;
    suburbRadius: string | null;
    date: string;
    time: string;
  }) => void;
  onAgreeMeetup: (threadId: string) => void;
  onOnMyWay: (threadId: string) => void;
  onGenerateQR: (threadId: string) => void;
  onScanQR: (threadId: string) => void;
  onInspection: (threadId: string, result: 'match' | 'reject') => void;
  onConfirmFinalSwap: (threadId: string) => void;
  onReportGhosting: (threadId: string) => void;
  unreadCount: number;
}

function OfferCard({
  message,
  onAction,
}: {
  message: ChatMessage;
  onAction: (action: 'accept' | 'decline' | 'counter') => void;
}) {
  const offer = message.offer!;
  const status: OfferStatus = offer.status;

  return (
    <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-br from-slate-900 to-slate-950 overflow-hidden shadow-lg">
      <div className="flex items-center gap-2 px-3.5 py-2 bg-emerald-500/10 border-b border-emerald-500/20">
        <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-500/20">
          <Zap size={11} className="text-emerald-400 fill-emerald-400" />
        </span>
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
          Swap Terminal · System Offer
        </span>
        <span className="ml-auto text-[9px] font-mono text-slate-500 tnum">
          {formatTime(message.timestamp)}
        </span>
      </div>
      <div className="px-3.5 py-2.5 border-b border-slate-800">
        <p className="font-mono text-[10.5px] leading-relaxed text-slate-300">
          <span className="text-emerald-400">{'>'}</span> {message.text}
        </p>
      </div>
      <div className="px-3.5 py-3 flex items-center gap-2.5">
        <div className="flex-1 min-w-0">
          <p className="text-[8px] font-bold uppercase tracking-wider text-slate-500 mb-1">Offering</p>
          <div className="flex items-center gap-2">
            <img src={offer.offeredItemImage} alt="" className="w-10 h-10 rounded-md object-cover flex-shrink-0" />
            <p className="text-[11px] font-semibold text-slate-200 truncate">{offer.offeredItemTitle}</p>
          </div>
        </div>
        <div className="flex-shrink-0 flex flex-col items-center">
          <ArrowLeftRight size={16} className="text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0 text-right">
          <p className="text-[8px] font-bold uppercase tracking-wider text-slate-500 mb-1">Requesting</p>
          <div className="flex items-center gap-2 justify-end">
            <p className="text-[11px] font-semibold text-slate-200 truncate">{offer.targetItemTitle}</p>
            <img src={offer.targetItemImage} alt="" className="w-10 h-10 rounded-md object-cover flex-shrink-0" />
          </div>
        </div>
      </div>
      {offer.cashTopUp && offer.cashTopUp !== '$0' && (
        <div className="px-3.5 pb-2.5">
          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/20">
            <span className="text-[9px] font-mono text-amber-400">Cash top-up:</span>
            <span className="text-[10px] font-bold text-amber-300 tnum">{offer.cashTopUp}</span>
          </div>
        </div>
      )}
      {status === 'pending' ? (
        <div className="px-3.5 pb-3.5 flex gap-2">
          <button onClick={() => onAction('accept')} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] transition-all text-white text-[11px] font-bold">
            <Check size={13} /> Accept Swap
          </button>
          <button onClick={() => onAction('counter')} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 active:scale-[0.98] transition-all text-slate-200 text-[11px] font-bold">
            <ArrowLeftRight size={12} /> Counter
          </button>
          <button onClick={() => onAction('decline')} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 active:scale-[0.98] transition-all text-red-400 text-[11px] font-bold border border-red-500/30">
            <XCircle size={13} /> Decline
          </button>
        </div>
      ) : (
        <div className="px-3.5 pb-3.5">
          <div className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-bold ${
            status === 'accepted' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : status === 'declined' ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
          }`}>
            {status === 'accepted' && <><Check size={13} /> Swap Accepted — protocol initiated</>}
            {status === 'declined' && <><XCircle size={13} /> Offer Declined</>}
            {status === 'countered' && <><ArrowLeftRight size={13} /> Counter proposed — awaiting response</>}
          </div>
        </div>
      )}
    </div>
  );
}

function ProtocolCard({
  message,
  threadId,
  meetup,
  onAgreeMeetup,
  onGenerateQR,
  onScanQR,
  onInspection,
  onConfirmFinalSwap,
  protocolState,
  theirName,
}: {
  message: ChatMessage;
  threadId: string;
  meetup?: MeetupDetails;
  onAgreeMeetup: (threadId: string) => void;
  onGenerateQR: (threadId: string) => void;
  onScanQR: (threadId: string) => void;
  onInspection: (threadId: string, result: 'match' | 'reject') => void;
  onConfirmFinalSwap: (threadId: string) => void;
  protocolState?: ProtocolState;
  theirName: string;
}) {
  const ptype = message.protocol?.protocolType;
  if (!ptype) return null;

  const meetupData = message.protocol?.meetup ?? meetup;

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 overflow-hidden my-1.5">
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/60 border-b border-slate-700">
        <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-500/15 border border-emerald-500/30">
          <ShieldCheck size={11} className="text-emerald-400" />
        </span>
        <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-400">Protocol System</span>
        <span className="ml-auto text-[9px] font-mono text-slate-500 tnum">{formatTime(message.timestamp)}</span>
      </div>

      <div className="px-3 py-2.5">
        <p className="text-[10.5px] text-slate-300 leading-relaxed mb-2">{message.text}</p>

        {/* Protocol start */}
        {ptype === 'protocol-start' && (
          <div className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <PartyPopper size={12} className="text-emerald-400" />
            <p className="text-[10px] text-emerald-400 font-bold">Trade Execution Protocol Initiated</p>
          </div>
        )}

        {/* Meetup proposal */}
        {ptype === 'meetup-proposal' && meetupData && !meetupData.agreed && (
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-slate-800 border border-slate-700">
              {meetupData.mode === 'safe-zone' ? <Coffee size={13} className="text-emerald-400" /> : <Home size={13} className="text-sky-400" />}
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold text-slate-200 truncate">
                  {meetupData.location?.name ?? `${meetupData.homeOwner}'s home`}
                </p>
                <p className="text-[8px] text-slate-500">
                  {meetupData.mode === 'safe-zone' ? meetupData.location?.address : `Address Shield: ${meetupData.suburbRadius}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700">
              <Calendar size={11} className="text-amber-400" />
              <span className="text-[10px] text-slate-300 font-semibold">{meetupData.date}</span>
              <Clock size={11} className="text-amber-400 ml-1" />
              <span className="text-[10px] text-slate-300 font-semibold">{meetupData.time}</span>
            </div>
            <button
              onClick={() => onAgreeMeetup(threadId)}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-[11px] font-bold transition-colors"
            >
              <Check size={13} /> AGREE MEETUP
            </button>
          </div>
        )}

        {/* Meetup agreed */}
        {ptype === 'meetup-agreed' && (
          <div className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <Check size={12} className="text-emerald-400" />
            <p className="text-[10px] text-emerald-400 font-bold">Meetup confirmed by both parties</p>
          </div>
        )}

        {/* On my way */}
        {ptype === 'on-my-way' && (
          <div className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-sky-500/10 border border-sky-500/20">
            <Car size={12} className="text-sky-400" />
            <p className="text-[10px] text-sky-400 font-bold">Traveler is en route — address unlocking soon</p>
          </div>
        )}

        {/* Address unlocked */}
        {ptype === 'address-unlocked' && (
          <div className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <MapPin size={12} className="text-emerald-400" />
            <p className="text-[10px] text-emerald-400 font-bold">Address Shield unlocked — full address revealed</p>
          </div>
        )}

        {/* QR generated */}
        {ptype === 'qr-generated' && (
          <div className="flex flex-col items-center gap-2 py-2">
            <div className="w-24 h-24 rounded-lg bg-white flex items-center justify-center border border-slate-600">
              <QrCode size={48} className="text-slate-900" />
            </div>
            <p className="text-[9px] text-slate-500 text-center">Dynamic QR Code generated — other trader scans to verify GPS presence</p>
            {!protocolState?.qrScanned && (
              <button
                onClick={() => onScanQR(threadId)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold hover:bg-emerald-500/20 transition-colors"
              >
                <ScanLine size={13} /> Scan This QR
              </button>
            )}
          </div>
        )}

        {/* QR scanned */}
        {ptype === 'qr-scanned' && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <ShieldCheck size={12} className="text-emerald-400" />
              <p className="text-[10px] text-emerald-400 font-bold">GPS check-in verified — both traders on-site</p>
            </div>
            {!protocolState?.inspectionResult && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Camera size={12} className="text-amber-400" />
                  <span className="text-[10px] font-bold text-amber-400">Quick Inspection</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => onInspection(threadId, 'match')}
                    className="flex items-center justify-center gap-1 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold hover:bg-emerald-500/20 transition-colors"
                  >
                    <Check size={11} /> ITEMS MATCH
                  </button>
                  <button
                    onClick={() => onInspection(threadId, 'reject')}
                    className="flex items-center justify-center gap-1 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-[9px] font-bold hover:bg-red-500/20 transition-colors"
                  >
                    <AlertTriangle size={11} /> REJECT
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Inspection result */}
        {ptype === 'inspection-result' && message.protocol?.inspection && (
          <div className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg border ${
            message.protocol.inspection === 'match'
              ? 'bg-emerald-500/10 border-emerald-500/20'
              : 'bg-red-500/10 border-red-500/20'
          }`}>
            {message.protocol.inspection === 'match' ? <Check size={12} className="text-emerald-400" /> : <XCircle size={12} className="text-red-400" />}
            <p className={`text-[10px] font-bold ${message.protocol.inspection === 'match' ? 'text-emerald-400' : 'text-red-400'}`}>
              {message.protocol.inspection === 'match' ? 'Items match — ready to swap' : 'Trade aborted safely — no penalty applied'}
            </p>
          </div>
        )}

        {/* Final swap */}
        {ptype === 'final-swap' && (
          <div className="space-y-2">
            <p className="text-[9px] text-slate-500 text-center">Both traders must confirm after holding the swapped items</p>
            {!protocolState?.finalConfirmedBy.includes('You') && (
              <button
                onClick={() => onConfirmFinalSwap(threadId)}
                className="w-full group relative overflow-hidden flex items-center justify-center gap-1.5 py-3 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-400 hover:from-emerald-500 hover:to-emerald-300 text-ink-900 text-[11px] font-extrabold transition-all"
              >
                <Zap size={14} className="fill-ink-900" /> CONFIRM FINAL SWAP
              </button>
            )}
            {protocolState?.finalConfirmedBy.includes('You') && !protocolState?.swapCompleted && (
              <div className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[9px] font-bold">
                <Clock size={11} /> Waiting for {theirName}...
              </div>
            )}
          </div>
        )}

        {/* Swap completed */}
        {ptype === 'swap-completed' && (
          <div className="flex flex-col items-center gap-2 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            <PartyPopper size={24} className="text-emerald-400" />
            <p className="text-[13px] font-extrabold text-emerald-400">SWAP COMPLETED</p>
            <p className="text-[8px] font-mono text-slate-400">Trust scores updated · Offers auto-revoked</p>
          </div>
        )}

        {/* Ghosting */}
        {ptype === 'ghosting-warning' && (
          <div className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-red-500/10 border border-red-500/30">
            <ShieldAlert size={12} className="text-red-400" />
            <p className="text-[10px] text-red-400 font-bold">15-min ghosting protection activated</p>
          </div>
        )}
        {ptype === 'ghosting-reported' && (
          <div className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-red-500/10 border border-red-500/30">
            <AlertTriangle size={12} className="text-red-400" />
            <p className="text-[10px] text-red-400 font-bold">Ghosting reported — penalties applied, you've been released</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StickyProgressHeader({ state }: { state: ProtocolState }) {
  if (!state.active) return null;
  const steps = [
    { num: 1, label: 'Pending Meetup Location', id: 'meetup', status: state.steps[0].status },
    { num: 2, label: 'QR Check-In & Inspection', id: 'checkin', status: state.steps[1].status },
    { num: 3, label: 'Final Handshake', id: 'final', status: state.steps[2].status },
  ];
  const current = steps.find((s) => s.status === 'active') ?? steps.find((s) => s.status === 'pending') ?? steps[steps.length - 1];

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border-b border-emerald-500/20 flex-shrink-0">
      <MapPin size={12} className="text-emerald-400 flex-shrink-0" />
      <span className="text-[10px] font-mono font-bold text-emerald-400">
        Step {current.num}: {current.label}
      </span>
      <div className="ml-auto flex items-center gap-1">
        {steps.map((s) => (
          <span
            key={s.id}
            className={`w-1.5 h-1.5 rounded-full ${
              s.status === 'complete' ? 'bg-emerald-500' : s.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-700'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  if (message.type === 'offer') {
    return <OfferCard message={message} onAction={() => {}} />;
  }

  const isMe = message.sender === 'me';
  const isSystem = message.sender === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center my-1">
        <div className="px-3 py-1.5 rounded-full bg-lineSoft border border-line text-[10px] font-medium text-ink-500 max-w-[85%] text-center">
          {message.text}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`max-w-[75%] ${isMe ? 'order-2' : ''}`}>
        <div className={`px-3.5 py-2.5 rounded-2xl text-[12.5px] leading-relaxed ${
          isMe ? 'bg-ink-900 text-white rounded-br-md' : 'bg-lineSoft text-ink-900 rounded-bl-md border border-line'
        }`}>
          {message.text}
        </div>
        <p className={`text-[9px] text-ink-400 mt-0.5 ${isMe ? 'text-right' : 'text-left'}`}>{formatTime(message.timestamp)}</p>
      </div>
    </div>
  );
}

export function ChatDrawer({
  open,
  onToggle,
  threads,
  activeThreadId,
  onSelectThread,
  onSendMessage,
  onOfferAction,
  onProposeMeetup,
  onAgreeMeetup,
  onOnMyWay,
  onGenerateQR,
  onScanQR,
  onInspection,
  onConfirmFinalSwap,
  onReportGhosting,
  unreadCount,
}: ChatDrawerProps) {
  const [input, setInput] = useState('');
  const [showList, setShowList] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeThread = threads.find((t) => t.id === activeThreadId) ?? null;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeThread?.messages.length, activeThreadId]);

  useEffect(() => {
    if (activeThreadId) setShowList(false);
  }, [activeThreadId]);

  const handleSend = () => {
    if (!input.trim() || !activeThread) return;
    onSendMessage(activeThread.id, input.trim());
    setInput('');
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-[58] bg-ink-900/40 backdrop-blur-sm lg:hidden animate-[fadeIn_0.2s_ease-out]" onClick={onToggle} />
      )}

      <aside className={`fixed top-0 right-0 z-[59] h-full w-full sm:w-[360px] lg:w-[34vw] max-w-[440px] bg-surface border-l border-line flex flex-col transition-transform duration-300 ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        {showList || !activeThread ? (
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-line bg-surface flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <MessageSquare size={18} className="text-ink-900" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 flex items-center justify-center text-[9px] font-bold text-white tnum">{unreadCount}</span>
                  )}
                </div>
                <h2 className="text-[14px] font-bold text-ink-900">Messages</h2>
              </div>
              <button onClick={onToggle} aria-label="Close chat" className="w-7 h-7 rounded-md hover:bg-lineSoft flex items-center justify-center text-ink-500 transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {threads.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                  <div className="w-14 h-14 rounded-full bg-lineSoft border border-line flex items-center justify-center mb-3">
                    <MessageSquare size={22} className="text-ink-400" />
                  </div>
                  <p className="text-[13px] font-semibold text-ink-700">No conversations yet</p>
                  <p className="text-[11px] text-ink-400 mt-1 leading-relaxed">Propose a trade on any item to start chatting with the owner.</p>
                </div>
              ) : (
                threads.map((thread) => (
                  <button key={thread.id} onClick={() => onSelectThread(thread.id)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-lineSoft/60 transition-colors text-left border-b border-lineSoft/50">
                    <div className="relative flex-shrink-0">
                      <span className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center text-[14px] font-bold text-white">{thread.participantAvatar}</span>
                      {thread.online && <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-surface" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[13px] font-semibold text-ink-900 truncate">{thread.participantName}</p>
                        {thread.unread > 0 && <span className="flex-shrink-0 min-w-[18px] h-4.5 px-1.5 rounded-full bg-emerald-500 flex items-center justify-center text-[9px] font-bold text-white tnum">{thread.unread}</span>}
                      </div>
                      {thread.pinnedItemTitle && <p className="text-[11px] text-ink-500 truncate mt-0.5">Re: {thread.pinnedItemTitle}</p>}
                      {thread.protocolState?.active && (
                        <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-[8px] font-bold text-emerald-600">
                          <Shield size={8} /> Protocol Active
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* Conversation header */}
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-line bg-surface flex-shrink-0">
              <button onClick={() => setShowList(true)} aria-label="Back to messages" className="w-8 h-8 rounded-md hover:bg-lineSoft flex items-center justify-center text-ink-500 transition-colors flex-shrink-0">
                <Minus size={16} className="rotate-90" />
              </button>
              <div className="relative flex-shrink-0">
                <span className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center text-[13px] font-bold text-white">{activeThread.participantAvatar}</span>
                {activeThread.online && <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-surface" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-[13px] font-bold text-ink-900 truncate">{activeThread.participantName}</p>
                  <Shield size={11} className="text-emerald-500 flex-shrink-0" />
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`text-[10px] font-medium ${activeThread.online ? 'text-emerald-600' : 'text-ink-400'}`}>{activeThread.online ? 'Online now' : 'Offline'}</span>
                  <span className="text-line">·</span>
                  <span className="text-[10px] font-medium text-amber-600">{activeThread.reputationRank}</span>
                </div>
              </div>
              <button onClick={onToggle} aria-label="Close chat" className="w-8 h-8 rounded-md hover:bg-lineSoft flex items-center justify-center text-ink-500 transition-colors flex-shrink-0">
                <X size={16} />
              </button>
            </div>

            {/* Sticky protocol progress header */}
            {activeThread.protocolState?.active && (
              <StickyProgressHeader state={activeThread.protocolState} />
            )}

            {/* Pinned item banner */}
            {activeThread.pinnedItemTitle && (
              <div className="flex items-center gap-2 px-4 py-2 bg-lineSoft/60 border-b border-line flex-shrink-0">
                <Pin size={12} className="text-ink-400 flex-shrink-0" />
                <p className="text-[11px] text-ink-600 truncate flex-1">
                  <span className="font-semibold text-ink-800">{activeThread.pinnedItemTitle}</span>
                  <span className="text-ink-400"> · {activeThread.pinnedItemValue}</span>
                </p>
              </div>
            )}

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-1 bg-canvas/50">
              {activeThread.messages.map((msg) =>
                msg.type === 'offer' ? (
                  <OfferCard key={msg.id} message={msg} onAction={(action) => onOfferAction(activeThread.id, msg.id, action)} />
                ) : msg.type === 'protocol' ? (
                  <ProtocolCard
                    key={msg.id}
                    message={msg}
                    threadId={activeThread.id}
                    meetup={activeThread.protocolState?.meetup ?? undefined}
                    onAgreeMeetup={onAgreeMeetup}
                    onGenerateQR={onGenerateQR}
                    onScanQR={onScanQR}
                    onInspection={onInspection}
                    onConfirmFinalSwap={onConfirmFinalSwap}
                    protocolState={activeThread.protocolState}
                    theirName={activeThread.participantName}
                  />
                ) : (
                  <MessageBubble key={msg.id} message={msg} />
                ),
              )}
            </div>

            {/* Trade Protocol Panel (slides up from bottom) */}
            {activeThread.protocolState?.active && (
              <TradeProtocolPanel
                state={activeThread.protocolState}
                myName="You"
                theirName={activeThread.participantName}
                onProposeMeetup={(details) => onProposeMeetup(activeThread.id, details)}
                onAgreeMeetup={() => onAgreeMeetup(activeThread.id)}
                onOnMyWay={() => onOnMyWay(activeThread.id)}
                onGenerateQR={() => onGenerateQR(activeThread.id)}
                onScanQR={() => onScanQR(activeThread.id)}
                onInspection={(result) => onInspection(activeThread.id, result)}
                onConfirmFinalSwap={() => onConfirmFinalSwap(activeThread.id)}
                onReportGhosting={() => onReportGhosting(activeThread.id)}
              />
            )}

            {/* Footer / input */}
            <div className="flex items-center gap-2 px-3 py-3 border-t border-line bg-surface flex-shrink-0">
              <button aria-label="Attach file" className="w-9 h-9 rounded-full hover:bg-lineSoft flex items-center justify-center text-ink-400 transition-colors flex-shrink-0">
                <Paperclip size={17} />
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Type a message..."
                className="flex-1 text-[13px] text-ink-900 placeholder:text-ink-400 bg-lineSoft/60 border border-line rounded-full px-4 py-2.5 outline-none focus:border-ink-400/60 transition-colors"
              />
              <button onClick={handleSend} disabled={!input.trim()} aria-label="Send message" className="w-9 h-9 rounded-full bg-ink-900 hover:bg-ink-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-white transition-colors flex-shrink-0">
                <Send size={16} />
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
