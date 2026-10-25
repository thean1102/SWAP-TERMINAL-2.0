import type { TradeItem } from '@/data/items';

export type OfferStatus = 'pending' | 'accepted' | 'declined' | 'countered';

export type ProtocolStepId = 'meetup' | 'checkin' | 'final' | 'ghosting';

export type ProtocolStepStatus = 'pending' | 'active' | 'complete' | 'rejected';

export interface ProtocolStep {
  id: ProtocolStepId;
  label: string;
  status: ProtocolStepStatus;
}

export type MeetupMode = 'safe-zone' | 'home-base';
export type MeetupRole = 'proposer' | 'responder';

export interface MeetupLocation {
  name: string;
  address: string;
  distanceKm: number;
  type: 'cafe' | 'shopping' | 'library' | 'park';
}

export interface MeetupDetails {
  mode: MeetupMode;
  location: MeetupLocation | null;
  homeOwner: string | null;
  suburbRadius: string | null;
  fullAddress: string | null;
  date: string;
  time: string;
  proposer: MeetupRole;
  agreed: boolean;
  onMyWay: boolean;
  addressUnlocked: boolean;
}

export interface ProtocolState {
  active: boolean;
  currentStep: ProtocolStepId | null;
  steps: ProtocolStep[];
  meetup: MeetupDetails | null;
  qrGenerated: boolean;
  qrScanned: boolean;
  inspectionResult: 'match' | 'reject' | null;
  finalConfirmedBy: string[];
  swapCompleted: boolean;
  ghosting: {
    active: boolean;
    checkedInUser: string | null;
    countdownStart: number | null;
    reported: boolean;
  };
}

export type ProtocolMessageType =
  | 'protocol-start'
  | 'meetup-proposal'
  | 'meetup-agreed'
  | 'on-my-way'
  | 'address-unlocked'
  | 'qr-generated'
  | 'qr-scanned'
  | 'inspection-result'
  | 'final-swap'
  | 'swap-completed'
  | 'ghosting-warning'
  | 'ghosting-reported';

export interface ProtocolMessageData {
  protocolType: ProtocolMessageType;
  meetup?: MeetupDetails;
  inspection?: 'match' | 'reject';
  finalConfirmedBy?: string[];
  ghostingCountdownStart?: number;
}

export interface SwapOffer {
  offeredItemTitle: string;
  targetItemTitle: string;
  cashTopUp: string;
  offeredItemImage: string;
  targetItemImage: string;
  status: OfferStatus;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  sender: 'system' | 'me' | 'them';
  type: 'text' | 'offer' | 'protocol';
  text?: string;
  offer?: SwapOffer;
  protocol?: ProtocolMessageData;
  timestamp: number;
}

export interface ChatThread {
  id: string;
  participantName: string;
  participantSuburb: string;
  participantAvatar: string;
  participantLocation: string;
  online: boolean;
  reputationRank: string;
  unread: number;
  pinnedItemTitle?: string;
  pinnedItemValue?: string;
  messages: ChatMessage[];
  protocolState?: ProtocolState;
}

let idCounter = 0;
const nextId = (prefix: string) => `${prefix}-${Date.now()}-${idCounter++}`;

export function createOfferMessage(
  threadId: string,
  senderName: string,
  offeredItem: TradeItem,
  targetItem: TradeItem,
  cashTopUp: string,
): ChatMessage {
  const cashPart = cashTopUp && cashTopUp !== '$0' ? ` | Cash Top-up: ${cashTopUp}` : '';
  return {
    id: nextId('msg'),
    threadId,
    sender: 'system',
    type: 'offer',
    text: `SWAP OFFER INITIATED: ${senderName} proposed a trade. Offering: ${offeredItem.title} ⇄ Requesting: ${targetItem.title}${cashPart}.`,
    offer: {
      offeredItemTitle: offeredItem.title,
      targetItemTitle: targetItem.title,
      cashTopUp: cashTopUp || '$0',
      offeredItemImage: offeredItem.images[0],
      targetItemImage: targetItem.images[0],
      status: 'pending',
    },
    timestamp: Date.now(),
  };
}

export function createTextMessage(
  threadId: string,
  sender: 'me' | 'them',
  text: string,
): ChatMessage {
  return {
    id: nextId('msg'),
    threadId,
    sender,
    type: 'text',
    text,
    timestamp: Date.now(),
  };
}

export function createThread(
  item: TradeItem,
): ChatThread {
  return {
    id: nextId('thread'),
    participantName: item.owner,
    participantSuburb: item.suburb,
    participantAvatar: item.owner.charAt(0),
    participantLocation: item.location,
    online: Math.random() > 0.4,
    reputationRank: item.totalTrades >= 15 ? 'Gold Trader' : item.totalTrades >= 8 ? 'Silver Trader' : 'Verified Trader',
    unread: 1,
    pinnedItemTitle: item.title,
    pinnedItemValue: item.estimatedValue,
    messages: [],
  };
}

export function formatTime(ts: number): string {
  const d = new Date(ts);
  const hh = d.getHours().toString().padStart(2, '0');
  const mm = d.getMinutes().toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

export function createProtocolState(): ProtocolState {
  return {
    active: false,
    currentStep: null,
    steps: [
      { id: 'meetup', label: 'Schedule & Spot Selection', status: 'pending' },
      { id: 'checkin', label: 'On-Site QR Check-In & Inspection', status: 'pending' },
      { id: 'final', label: 'Final Lock & Handshake', status: 'pending' },
    ],
    meetup: null,
    qrGenerated: false,
    qrScanned: false,
    inspectionResult: null,
    finalConfirmedBy: [],
    swapCompleted: false,
    ghosting: {
      active: false,
      checkedInUser: null,
      countdownStart: null,
      reported: false,
    },
  };
}

export function createProtocolMessage(
  threadId: string,
  protocolType: ProtocolMessageType,
  text: string,
  data?: Partial<ProtocolMessageData>,
): ChatMessage {
  return {
    id: nextId('msg'),
    threadId,
    sender: 'system',
    type: 'protocol',
    text,
    protocol: { protocolType, ...data },
    timestamp: Date.now(),
  };
}

export const SAFE_ZONE_LOCATIONS: MeetupLocation[] = [
  { name: 'Cabramatta Library', address: 'Hughes St, Cabramatta NSW 2166', distanceKm: 1.2, type: 'library' },
  { name: 'Liverpool Westfields', address: 'Macquarie St, Liverpool NSW 2170', distanceKm: 2.8, type: 'shopping' },
  { name: 'Cabramatta Cafe Central', address: 'Railway Pde, Cabramatta NSW 2166', distanceKm: 0.9, type: 'cafe' },
  { name: 'Parramatta Park Entrance', address: 'Pitt St, Parramatta NSW 2150', distanceKm: 3.5, type: 'park' },
];

export type OfferState = 'active' | 'matched' | 'closed';

export interface IncomingOffer {
  id: string;
  offererName: string;
  offererItemTitle: string;
  offererItemImage: string;
  offererCondition: string;
  offererConditionScore: number;
  offererEstimatedValue: string;
  cashTopUp: string;
  cashDiff: number;
  matchScore: number;
  timestamp: number;
  state: OfferState;
}

function parseValue(v: string): number {
  return parseInt(v.replace(/[^0-9]/g, ''), 10) || 0;
}

export function generateMockOffers(targetItem: TradeItem, pool: TradeItem[]): IncomingOffer[] {
  const targetVal = parseValue(targetItem.estimatedValue);
  const candidates = pool.filter((it) => it.id !== targetItem.id).slice(0, 6);

  return candidates.map((it, idx) => {
    const offerVal = parseValue(it.estimatedValue);
    const cashDiff = targetVal - offerVal;
    const cashTopUp = cashDiff > 0 ? `${cashDiff}` : cashDiff < 0 ? `-${Math.abs(cashDiff)}` : '$0';
    const baseMatch = it.matchRate;
    const matchScore = Math.min(99, baseMatch + Math.floor(Math.random() * 8) - 2);

    return {
      id: `offer-${targetItem.id}-${idx}`,
      offererName: it.owner,
      offererItemTitle: it.title,
      offererItemImage: it.images[0],
      offererCondition: it.condition,
      offererConditionScore: it.conditionScore,
      offererEstimatedValue: it.estimatedValue,
      cashTopUp,
      cashDiff,
      matchScore,
      timestamp: Date.now() - idx * 60000 - Math.floor(Math.random() * 30000),
      state: 'active' as OfferState,
    };
  });
}
