import { useState, useEffect } from 'react';
import {
  MapPin,
  Coffee,
  Home,
  Calendar,
  Clock,
  Check,
  ChevronDown,
  ChevronUp,
  QrCode,
  ScanLine,
  Camera,
  ShieldAlert,
  Car,
  Lock,
  Zap,
  AlertTriangle,
  XCircle,
  PartyPopper,
  ShieldCheck,
  TrendingUp,
  Building2,
  BookOpen,
  Trees,
} from 'lucide-react';
import type { ProtocolState, MeetupMode, MeetupLocation } from '@/data/chat';
import { SAFE_ZONE_LOCATIONS } from '@/data/chat';

interface TradeProtocolPanelProps {
  state: ProtocolState;
  myName: string;
  theirName: string;
  onProposeMeetup: (details: {
    mode: MeetupMode;
    location: MeetupLocation | null;
    homeOwner: string | null;
    suburbRadius: string | null;
    date: string;
    time: string;
  }) => void;
  onAgreeMeetup: () => void;
  onOnMyWay: () => void;
  onGenerateQR: () => void;
  onScanQR: () => void;
  onInspection: (result: 'match' | 'reject') => void;
  onConfirmFinalSwap: () => void;
  onReportGhosting: () => void;
}

function StepHeader({
  stepNumber,
  label,
  status,
  expanded,
  onToggle,
}: {
  stepNumber: number;
  label: string;
  status: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  const statusIcon = status === 'complete' ? (
    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/40">
      <Check size={11} className="text-emerald-400" />
    </span>
  ) : status === 'active' ? (
    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-500/20 border border-sky-500/40">
      <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
    </span>
  ) : (
    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 border border-slate-700">
      <span className="text-[9px] font-mono font-bold text-slate-500 tnum">{stepNumber}</span>
    </span>
  );

  return (
    <button
      onClick={onToggle}
      disabled={status === 'pending'}
      className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors ${
        status === 'active' ? 'bg-sky-500/5 hover:bg-sky-500/10' : 'hover:bg-slate-800/40'
      } ${status === 'pending' ? 'cursor-default' : 'cursor-pointer'}`}
    >
      {statusIcon}
      <span className={`text-[11px] font-bold ${
        status === 'complete' ? 'text-emerald-400' : status === 'active' ? 'text-sky-300' : 'text-slate-400'
      }`}>
        {status === 'complete' && `✓ Step ${stepNumber}: `}
        {status !== 'complete' && status === 'active' && `Step ${stepNumber}: `}
        {status === 'pending' && `Step ${stepNumber}: `}
        {label}
      </span>
      {status !== 'pending' && (expanded ? <ChevronUp size={12} className="ml-auto text-slate-500" /> : <ChevronDown size={12} className="ml-auto text-slate-500" />)}
    </button>
  );
}

function GhostingCountdown({ startTime, reported, onReport }: { startTime: number; reported: boolean; onReport: () => void }) {
  const [remaining, setRemaining] = useState(0);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const update = () => {
      const elapsed = Date.now() - startTime;
      const left = Math.max(0, 15 * 60 * 1000 - elapsed);
      setRemaining(left);
      if (left <= 0) setExpired(true);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);

  return (
    <div className="mx-3 mb-3 rounded-lg border border-red-500/30 bg-red-500/5 p-3">
      <div className="flex items-center gap-2 mb-2">
        <ShieldAlert size={14} className="text-red-400" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">
          Anti-Ghosting Protection
        </span>
      </div>
      <p className="text-[10px] text-slate-400 mb-2">
        You checked in but the other trader hasn't arrived. Waiting period active.
      </p>
      <div className="flex items-center gap-2 mb-3">
        <Clock size={16} className={expired ? 'text-red-400' : 'text-amber-400'} />
        <span className={`font-mono text-[20px] font-bold tnum ${expired ? 'text-red-400' : 'text-amber-400'}`}>
          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </span>
        <span className="text-[9px] font-mono text-slate-500">
          {expired ? 'EXPIRED' : 'remaining'}
        </span>
      </div>
      {reported ? (
        <div className="flex items-center gap-1.5 py-2 rounded-md bg-red-500/15 border border-red-500/30 text-red-400 text-[10px] font-bold justify-center">
          <AlertTriangle size={12} /> Ghosting Reported — Penalty Applied
        </div>
      ) : expired ? (
        <button
          onClick={onReport}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-md bg-red-500 hover:bg-red-400 text-white text-[10px] font-bold transition-colors"
        >
          <ShieldAlert size={13} /> REPORT GHOSTING
        </button>
      ) : (
        <div className="flex items-center justify-center gap-1.5 py-2 rounded-md bg-slate-800 text-slate-500 text-[10px] font-bold">
          <Clock size={12} /> Waiting for other trader to arrive...
        </div>
      )}
    </div>
  );
}

export function TradeProtocolPanel({
  state,
  myName,
  theirName,
  onProposeMeetup,
  onAgreeMeetup,
  onOnMyWay,
  onGenerateQR,
  onScanQR,
  onInspection,
  onConfirmFinalSwap,
  onReportGhosting,
}: TradeProtocolPanelProps) {
  const [expandedStep, setExpandedStep] = useState<ProtocolState['currentStep']>(null);
  const [meetupMode, setMeetupMode] = useState<MeetupMode>('safe-zone');
  const [selectedLoc, setSelectedLoc] = useState<MeetupLocation | null>(SAFE_ZONE_LOCATIONS[0]);
  const [homeOwner, setHomeOwner] = useState<'me' | 'them'>('me');
  const [meetupDate, setMeetupDate] = useState('');
  const [meetupTime, setMeetupTime] = useState('');

  useEffect(() => {
    if (state.currentStep && !state.steps.find((s) => s.id === state.currentStep)?.status.includes('complete')) {
      setExpandedStep(state.currentStep);
    }
  }, [state.currentStep]);

  const step1 = state.steps[0];
  const step2 = state.steps[1];
  const step3 = state.steps[2];

  const canPropose = meetupMode === 'home-base' || !!selectedLoc;

  const handlePropose = () => {
    if (!canPropose) return;
    onProposeMeetup({
      mode: meetupMode,
      location: meetupMode === 'safe-zone' ? selectedLoc : null,
      homeOwner: meetupMode === 'home-base' ? (homeOwner === 'me' ? myName : theirName) : null,
      suburbRadius: meetupMode === 'home-base' ? '500m radius' : null,
      date: meetupDate,
      time: meetupTime,
    });
  };

  if (!state.active) return null;

  return (
    <div className="flex flex-col bg-slate-950 border-t border-emerald-500/20 flex-shrink-0">
      {/* Panel header */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-emerald-500/5 border-b border-emerald-500/20">
        <span className="flex h-6 w-6 items-center justify-center rounded bg-emerald-500/15 border border-emerald-500/30">
          <Zap size={12} className="text-emerald-400 fill-emerald-400" />
        </span>
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
          Protocol Panel
        </span>
        <span className="ml-auto text-[9px] font-mono text-slate-500">
          Trade Execution Protocol
        </span>
      </div>

      {/* Steps */}
      <div className="max-h-[60vh] overflow-y-auto">
        {/* Step 1: Meetup */}
        <div className={`border-b border-slate-800 ${step1.status === 'complete' ? 'bg-emerald-500/5' : ''}`}>
          <StepHeader
            stepNumber={1}
            label="Meetup Scheduled"
            status={step1.status}
            expanded={expandedStep === 'meetup'}
            onToggle={() => setExpandedStep(expandedStep === 'meetup' ? null : 'meetup')}
          />
          {expandedStep === 'meetup' && step1.status === 'active' && (
            <div className="px-3 pb-3 space-y-3">
              {/* Mode selector */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setMeetupMode('safe-zone')}
                  className={`flex items-center gap-2 px-2.5 py-2.5 rounded-lg border text-left transition-colors ${
                    meetupMode === 'safe-zone'
                      ? 'border-emerald-500/40 bg-emerald-500/10'
                      : 'border-slate-700 bg-slate-900 hover:border-slate-600'
                  }`}
                >
                  <Coffee size={14} className={meetupMode === 'safe-zone' ? 'text-emerald-400' : 'text-slate-500'} />
                  <div>
                    <p className={`text-[10px] font-bold ${meetupMode === 'safe-zone' ? 'text-emerald-400' : 'text-slate-400'}`}>Public Safe Zone</p>
                    <p className="text-[8px] text-slate-500">Cafes, shopping centers</p>
                  </div>
                </button>
                <button
                  onClick={() => setMeetupMode('home-base')}
                  className={`flex items-center gap-2 px-2.5 py-2.5 rounded-lg border text-left transition-colors ${
                    meetupMode === 'home-base'
                      ? 'border-sky-500/40 bg-sky-500/10'
                      : 'border-slate-700 bg-slate-900 hover:border-slate-600'
                  }`}
                >
                  <Home size={14} className={meetupMode === 'home-base' ? 'text-sky-400' : 'text-slate-500'} />
                  <div>
                    <p className={`text-[10px] font-bold ${meetupMode === 'home-base' ? 'text-sky-400' : 'text-slate-400'}`}>Home Base Exchange</p>
                    <p className="text-[8px] text-slate-500">Address Shield protected</p>
                  </div>
                </button>
              </div>

              {/* Safe zone locations */}
              {meetupMode === 'safe-zone' && (
                <div className="space-y-1.5">
                  <p className="text-[9px] font-mono uppercase tracking-wider text-slate-500">Recommended mid-point locations</p>
                  {SAFE_ZONE_LOCATIONS.map((loc) => {
                    const icon = loc.type === 'cafe' ? Coffee : loc.type === 'shopping' ? Building2 : loc.type === 'library' ? BookOpen : Trees;
                    const Icon = icon;
                    return (
                      <button
                        key={loc.name}
                        onClick={() => setSelectedLoc(loc)}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg border text-left transition-colors ${
                          selectedLoc?.name === loc.name
                            ? 'border-emerald-500/40 bg-emerald-500/10'
                            : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                        }`}
                      >
                        <Icon size={13} className={selectedLoc?.name === loc.name ? 'text-emerald-400' : 'text-slate-500'} />
                        <div className="min-w-0 flex-1">
                          <p className={`text-[10px] font-semibold truncate ${selectedLoc?.name === loc.name ? 'text-emerald-300' : 'text-slate-300'}`}>{loc.name}</p>
                          <p className="text-[8px] text-slate-500 truncate">{loc.address}</p>
                        </div>
                        <span className="text-[8px] font-mono text-slate-500 tnum flex-shrink-0">{loc.distanceKm}km</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Home base selector */}
              {meetupMode === 'home-base' && (
                <div className="space-y-2">
                  <p className="text-[9px] font-mono uppercase tracking-wider text-slate-500">Meet at whose home?</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setHomeOwner('me')}
                      className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border text-left transition-colors ${
                        homeOwner === 'me'
                          ? 'border-sky-500/40 bg-sky-500/10'
                          : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                      }`}
                    >
                      <Home size={13} className={homeOwner === 'me' ? 'text-sky-400' : 'text-slate-500'} />
                      <div>
                        <p className={`text-[10px] font-bold ${homeOwner === 'me' ? 'text-sky-300' : 'text-slate-400'}`}>My Home</p>
                        <p className="text-[8px] text-slate-500">{myName}'s address</p>
                      </div>
                    </button>
                    <button
                      onClick={() => setHomeOwner('them')}
                      className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border text-left transition-colors ${
                        homeOwner === 'them'
                          ? 'border-sky-500/40 bg-sky-500/10'
                          : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                      }`}
                    >
                      <Home size={13} className={homeOwner === 'them' ? 'text-sky-400' : 'text-slate-500'} />
                      <div>
                        <p className={`text-[10px] font-bold ${homeOwner === 'them' ? 'text-sky-300' : 'text-slate-400'}`}>Their Home</p>
                        <p className="text-[8px] text-slate-500">{theirName}'s address</p>
                      </div>
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-amber-500/5 border border-amber-500/20">
                    <Lock size={11} className="text-amber-400 flex-shrink-0" />
                    <p className="text-[8px] text-amber-400/80">
                      Address Shield: Only 500m suburb radius shown. Full address unlocks 30-45 min before meetup.
                    </p>
                  </div>
                </div>
              )}

              {/* Date & time */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-mono uppercase tracking-wider text-slate-500 block mb-1">Date</label>
                  <input
                    type="date"
                    value={meetupDate}
                    onChange={(e) => setMeetupDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-md px-2.5 py-2 text-[11px] text-slate-200 outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-mono uppercase tracking-wider text-slate-500 block mb-1">Time</label>
                  <input
                    type="time"
                    value={meetupTime}
                    onChange={(e) => setMeetupTime(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-md px-2.5 py-2 text-[11px] text-slate-200 outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              {/* Propose button */}
              <button
                onClick={handlePropose}
                disabled={!canPropose || !meetupDate || !meetupTime}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-ink-900 text-[11px] font-bold transition-colors"
              >
                <MapPin size={13} /> Propose Meetup
              </button>
            </div>
          )}

          {/* Step 1 completed: show meetup summary + on-my-way */}
          {step1.status === 'complete' && state.meetup && (
            <div className="px-3 pb-3">
              <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-800 mb-2">
                {state.meetup.mode === 'safe-zone' ? <MapPin size={12} className="text-emerald-400" /> : <Home size={12} className="text-sky-400" />}
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold text-slate-300 truncate">
                    {state.meetup.location?.name ?? `${state.meetup.homeOwner}'s home`}
                  </p>
                  <p className="text-[8px] text-slate-500">
                    {state.meetup.date} at {state.meetup.time}
                    {state.meetup.mode === 'home-base' && state.meetup.suburbRadius && ` · ${state.meetup.suburbRadius}`}
                  </p>
                </div>
              </div>
              {/* On My Way button for home-base */}
              {state.meetup.mode === 'home-base' && !state.meetup.onMyWay && (
                <button
                  onClick={onOnMyWay}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 text-[10px] font-bold hover:bg-sky-500/20 transition-colors"
                >
                  <Car size={13} /> ON MY WAY
                </button>
              )}
              {state.meetup.onMyWay && state.meetup.addressUnlocked && (
                <div className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                  <Lock size={11} className="text-emerald-400" />
                  <p className="text-[9px] text-emerald-400 font-semibold">Address Unlocked — full street address revealed</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Ghosting countdown (shown during Step 2 if activated) */}
        {state.ghosting.active && state.ghosting.countdownStart && (
          <GhostingCountdown
            startTime={state.ghosting.countdownStart}
            reported={state.ghosting.reported}
            onReport={onReportGhosting}
          />
        )}

        {/* Step 2: QR Check-In */}
        <div className={`border-b border-slate-800 ${step2.status === 'complete' ? 'bg-emerald-500/5' : ''}`}>
          <StepHeader
            stepNumber={2}
            label="On-Site Verified"
            status={step2.status}
            expanded={expandedStep === 'checkin'}
            onToggle={() => setExpandedStep(expandedStep === 'checkin' ? null : 'checkin')}
          />
          {expandedStep === 'checkin' && step2.status === 'active' && (
            <div className="px-3 pb-3 space-y-3">
              {/* QR Code generation / scan */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onGenerateQR}
                  disabled={state.qrGenerated}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-lg border transition-colors ${
                    state.qrGenerated
                      ? 'border-emerald-500/30 bg-emerald-500/10 cursor-default'
                      : 'border-slate-700 bg-slate-900 hover:border-slate-600'
                  }`}
                >
                  <QrCode size={20} className={state.qrGenerated ? 'text-emerald-400' : 'text-slate-400'} />
                  <span className={`text-[10px] font-bold ${state.qrGenerated ? 'text-emerald-400' : 'text-slate-300'}`}>
                    {state.qrGenerated ? 'QR Generated' : 'Generate QR'}
                  </span>
                </button>
                <button
                  onClick={onScanQR}
                  disabled={!state.qrGenerated || state.qrScanned}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-lg border transition-colors ${
                    state.qrScanned
                      ? 'border-emerald-500/30 bg-emerald-500/10 cursor-default'
                      : !state.qrGenerated
                        ? 'border-slate-800 bg-slate-900 opacity-40 cursor-not-allowed'
                        : 'border-slate-700 bg-slate-900 hover:border-slate-600'
                  }`}
                >
                  <ScanLine size={20} className={state.qrScanned ? 'text-emerald-400' : 'text-slate-400'} />
                  <span className={`text-[10px] font-bold ${state.qrScanned ? 'text-emerald-400' : 'text-slate-300'}`}>
                    {state.qrScanned ? 'Scan Complete' : 'Scan QR'}
                  </span>
                </button>
              </div>

              {/* GPS verification note */}
              <div className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-800">
                <MapPin size={11} className="text-sky-400 flex-shrink-0" />
                <p className="text-[8px] text-slate-500">
                  QR scan verifies both traders are physically at the same GPS location. Prevents remote/fake trade farming.
                </p>
              </div>

              {/* Inspection panel */}
              {state.qrScanned && state.inspectionResult === null && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Camera size={12} className="text-amber-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Quick Inspection</span>
                  </div>
                  <p className="text-[9px] text-slate-500">
                    Compare the physical items with their original photos. Confirm they match the descriptions before swapping.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onInspection('match')}
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold hover:bg-emerald-500/20 transition-colors"
                    >
                      <Check size={13} /> ITEMS MATCH
                    </button>
                    <button
                      onClick={() => onInspection('reject')}
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-bold hover:bg-red-500/20 transition-colors"
                    >
                      <AlertTriangle size={13} /> REJECT SAFELY
                    </button>
                  </div>
                </div>
              )}

              {/* Inspection result */}
              {state.inspectionResult === 'reject' && (
                <div className="flex items-center gap-1.5 px-2.5 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30">
                  <XCircle size={13} className="text-red-400" />
                  <p className="text-[10px] text-red-400 font-semibold">Trade aborted safely — no trust score penalty</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Step 3: Final Lock & Handshake */}
        <div className={`border-b border-slate-800 ${step3.status === 'complete' ? 'bg-emerald-500/5' : ''}`}>
          <StepHeader
            stepNumber={3}
            label="Final Lock & Handshake"
            status={step3.status}
            expanded={expandedStep === 'final'}
            onToggle={() => setExpandedStep(expandedStep === 'final' ? null : 'final')}
          />
          {expandedStep === 'final' && step3.status === 'active' && (
            <div className="px-3 pb-3 space-y-3">
              <div className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-800">
                <ShieldCheck size={11} className="text-emerald-400 flex-shrink-0" />
                <p className="text-[8px] text-slate-500">
                  Both traders must confirm after holding the swapped items in hand. The platform will then auto-complete the swap, update trust scores, and revoke all other pending offers.
                </p>
              </div>

              {/* Confirmations */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${state.finalConfirmedBy.includes(myName) ? 'bg-emerald-500/20 border-emerald-500/40' : 'bg-slate-800 border-slate-700'}`}>
                    {state.finalConfirmedBy.includes(myName) && <Check size={11} className="text-emerald-400" />}
                  </span>
                  <span className="text-[10px] text-slate-300">{myName} (You)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${state.finalConfirmedBy.includes(theirName) ? 'bg-emerald-500/20 border-emerald-500/40' : 'bg-slate-800 border-slate-700'}`}>
                    {state.finalConfirmedBy.includes(theirName) && <Check size={11} className="text-emerald-400" />}
                  </span>
                  <span className="text-[10px] text-slate-300">{theirName}</span>
                </div>
              </div>

              {/* Final swap button */}
              {!state.finalConfirmedBy.includes(myName) && (
                <button
                  onClick={onConfirmFinalSwap}
                  className="w-full group relative overflow-hidden flex items-center justify-center gap-2 py-3 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-400 hover:from-emerald-500 hover:to-emerald-300 text-ink-900 text-[12px] font-extrabold tracking-wide transition-all active:scale-[0.98]"
                >
                  <Zap size={16} className="fill-ink-900" />
                  CONFIRM FINAL SWAP
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </button>
              )}
              {state.finalConfirmedBy.includes(myName) && !state.swapCompleted && (
                <div className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold">
                  <Clock size={12} /> Waiting for {theirName} to confirm...
                </div>
              )}
            </div>
          )}

          {/* Swap completed */}
          {state.swapCompleted && (
            <div className="px-3 pb-3">
              <div className="flex flex-col items-center gap-2 py-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <PartyPopper size={28} className="text-emerald-400" />
                <p className="text-[14px] font-extrabold text-emerald-400">SWAP COMPLETED</p>
                <div className="flex items-center gap-2 text-[9px] font-mono text-slate-400">
                  <TrendingUp size={11} className="text-emerald-400" />
                  Trust Scores increased · Pending offers auto-revoked
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
