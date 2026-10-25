import { useMemo, useState, useCallback } from 'react';
import { Info, Check } from 'lucide-react';
import { Header } from '@/components/Header';
import { CategoryBar } from '@/components/CategoryBar';
import { ItemCard } from '@/components/ItemCard';
import { QuickViewModal } from '@/components/QuickViewModal';
import { UserProfileModal } from '@/components/UserProfileModal';
import { CreateListingModal } from '@/components/CreateListingModal';
import { Sidebar } from '@/components/Sidebar';
import { ItemsSidebar } from '@/components/ItemsSidebar';
import { StayNearGrouped } from '@/components/StayNearGrouped';
import { ChatDrawer } from '@/components/ChatDrawer';
import { OffersTerminal } from '@/components/OffersTerminal';
import { MakeOfferModal } from '@/components/MakeOfferModal';
import { ControlHub } from '@/components/ControlHub';
import { InventoryWindow } from '@/components/InventoryWindow';
import { generateTraderProfile, type TraderProfile, type ProfileListing } from '@/data/traderProfiles';
import { items, stayNearSuburbs, type CategoryId, type SubCategoryId, type TradeItem } from '@/data/items';
import { createThread, createOfferMessage, createTextMessage, generateMockOffers, type ChatThread, type IncomingOffer } from '@/data/chat';

export default function App() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>('popular');
  const [activeSuburbs, setActiveSuburbs] = useState<string[]>([]);
  const [selected, setSelected] = useState<TradeItem | null>(null);
  const [profile, setProfile] = useState<TraderProfile | null>(null);
  const [query, setQuery] = useState('');
  const [activeSubCategory, setActiveSubCategory] = useState<SubCategoryId>('all');
  const [userListings, setUserListings] = useState<TradeItem[]>(() => [
    {
      id: 'inv-1',
      title: 'iPad Pro 11" (M2)',
      category: 'items',
      owner: 'You',
      suburb: 'Cabramatta',
      location: 'Cabramatta, NSW',
      distanceKm: 0,
      condition: 'Like New',
      conditionScore: 95,
      estimatedValue: '$900',
      lookingFor: 'Gaming laptop',
      description: 'iPad Pro 11" M2, 256GB, Wi-Fi. Apple Pencil 2 included. Barely used.',
      images: ['https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'],
      subCategory: 'electronics-tech' as SubCategoryId,
      matchRate: 90,
      totalTrades: 3,
      views: 120,
    },
    {
      id: 'inv-2',
      title: 'Sony WH-1000XM5 Headphones',
      category: 'items',
      owner: 'You',
      suburb: 'Cabramatta',
      location: 'Cabramatta, NSW',
      distanceKm: 0,
      condition: 'Mint',
      conditionScore: 98,
      estimatedValue: '$380',
      lookingFor: 'Mechanical keyboard',
      description: 'Sony WH-1000XM5, industry-leading noise cancelling. Original box, case, and cable included.',
      images: ['https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'],
      subCategory: 'electronics-tech' as SubCategoryId,
      matchRate: 85,
      totalTrades: 1,
      views: 65,
    },
    {
      id: 'inv-3',
      title: 'Nintendo Switch OLED + 4 Games',
      category: 'items',
      owner: 'You',
      suburb: 'Cabramatta',
      location: 'Cabramatta, NSW',
      distanceKm: 0,
      condition: 'Good',
      conditionScore: 88,
      estimatedValue: '$300',
      lookingFor: 'PS5 games',
      description: 'Switch OLED, joycons in great shape. Includes Zelda TotK, Mario Odyssey, Smash Bros, and Mario Kart.',
      images: ['https://images.pexels.com/photos/7131262/pexels-photo-7131262.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'],
      subCategory: 'electronics-tech' as SubCategoryId,
      matchRate: 78,
      totalTrades: 0,
      views: 42,
    },
  ]);
  const [showCreate, setShowCreate] = useState(false);
  const [toast, setToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatThreads, setChatThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [terminalListing, setTerminalListing] = useState<TradeItem | null>(null);
  const [terminalOffers, setTerminalOffers] = useState<IncomingOffer[]>([]);
  const [offerTarget, setOfferTarget] = useState<TradeItem | null>(null);
  const [hubOpen, setHubOpen] = useState(false);
  const [invWinOpen, setInvWinOpen] = useState(false);

  const handleSelectCategory = (id: CategoryId) => {
    setActiveCategory(id);
    if (id === 'popular') setActiveSuburbs([]);
    if (id !== 'items') setActiveSubCategory('all');
  };

  const handleToggleSuburb = (suburb: string) => {
    setActiveSuburbs((prev) =>
      prev.includes(suburb) ? prev.filter((s) => s !== suburb) : [...prev, suburb]
    );
  };

  const handleClearSuburbs = () => setActiveSuburbs([]);

  const hasActiveSuburbs = activeSuburbs.length > 0;

  const allItems = useMemo(() => items, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allItems.filter((it) => {
      if (activeCategory === 'popular') {
        if (!it.popular) return false;
      } else if (activeCategory === 'free-trade') {
        if (!it.freeTrade) return false;
      } else if (hasActiveSuburbs && !activeSuburbs.includes(it.suburb)) return false;

      if (activeSubCategory !== 'all' && it.subCategory !== activeSubCategory) return false;

      if (q) {
        const haystack = `${it.title} ${it.lookingFor ?? ''} ${it.location} ${it.suburb} ${it.owner}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [activeCategory, activeSuburbs, hasActiveSuburbs, activeSubCategory, query, allItems]);

  const heading = useMemo(() => {
    if (activeCategory === 'popular') return 'Popular trades right now';
    if (activeCategory === 'stay-near') return hasActiveSuburbs ? `Stay near — ${activeSuburbs.length} suburb${activeSuburbs.length > 1 ? 's' : ''} selected` : 'Stay near — pick a suburb';
    if (activeCategory === 'free-trade') return hasActiveSuburbs ? `Free trade near ${activeSuburbs.join(', ')}` : 'Free Trade — swap anything, they accept';
    return hasActiveSuburbs ? `Items near ${activeSuburbs.join(', ')}` : 'All items up for swap';
  }, [activeCategory, activeSuburbs, hasActiveSuburbs]);

  const handleShowProfile = (owner: string, suburb: string) => {
    const extraListings: ProfileListing[] = userListings
      .filter((it) => it.owner === owner)
      .map((it) => ({ title: it.title, value: it.estimatedValue, suburb: it.suburb, matchRate: it.matchRate }));
    setProfile(generateTraderProfile(owner, suburb, extraListings));
  };

  const handlePublish = (item: TradeItem) => {
    setUserListings((prev) => [item, ...prev]);
    setToastMsg('Trade item listed successfully!');
    setToast(true);
    setTimeout(() => setToast(false), 3000);
    setActiveCategory('items');
  };

  const unreadCount = chatThreads.reduce((sum, t) => sum + t.unread, 0);

  const handlePropose = useCallback((targetItem: TradeItem) => {
    setOfferTarget(targetItem);
  }, []);

  const handleOfferSubmit = useCallback(
    (selectedItems: TradeItem[], cashMode: 'even' | 'i-add' | 'host-adds', cashAmount: number, _matchScore: number) => {
      if (!offerTarget || selectedItems.length === 0) return;
      const primaryItem = selectedItems[0];
      const cashTopUp = cashMode === 'even' ? '$0' : cashMode === 'i-add' ? `${cashAmount}` : `-${cashAmount}`;

      const thread = createThread(offerTarget);
      const offerMsg = createOfferMessage(thread.id, 'You', primaryItem, offerTarget, cashTopUp);
      const extraItems = selectedItems.slice(1);
      const messages = [offerMsg];
      if (extraItems.length > 0) {
        messages.push(
          createTextMessage(thread.id, 'system', `+ Additional items offered: ${extraItems.map((it) => it.title).join(', ')}.`),
        );
      }
      messages.push(
        createTextMessage(thread.id, 'system', `OFFER SUBMITTED · PENDING REVIEW — awaiting response from ${offerTarget.owner}.`),
      );
      thread.messages = messages;

      setChatThreads((prev) => [thread, ...prev]);
      setActiveThreadId(thread.id);
      setOfferTarget(null);
      setChatOpen(true);
      setToastMsg('Swap offer submitted! Chat opened with seller.');
      setToast(true);
      setTimeout(() => setToast(false), 3000);
    },
    [offerTarget],
  );

  const handleSendMessage = useCallback((threadId: string, text: string) => {
    const msg = createTextMessage(threadId, 'me', text);
    setChatThreads((prev) =>
      prev.map((t) =>
        t.id === threadId ? { ...t, messages: [...t.messages, msg], unread: 0 } : t,
      ),
    );
    // Simulate a reply
    setTimeout(() => {
      const reply = createTextMessage(threadId, 'them', `Thanks for your message! I'll get back to you shortly.`);
      setChatThreads((prev) =>
        prev.map((t) =>
          t.id === threadId ? { ...t, messages: [...t.messages, reply] } : t,
        ),
      );
    }, 1200);
  }, []);

  const handleOfferAction = useCallback(
    (threadId: string, messageId: string, action: 'accept' | 'decline' | 'counter') => {
      setChatThreads((prev) =>
        prev.map((t) => {
          if (t.id !== threadId) return t;
          const messages = t.messages.map((m) => {
            if (m.id !== messageId || !m.offer) return m;
            const status = action === 'accept' ? 'accepted' : action === 'decline' ? 'declined' : 'countered';
            return { ...m, offer: { ...m.offer, status } };
          });
          const systemMsg = createTextMessage(
            threadId,
            'system',
            action === 'accept'
              ? 'Swap accepted by both parties. Arrange a meetup to exchange items.'
              : action === 'decline'
                ? 'Offer declined. You can propose a new trade anytime.'
                : 'Counter offer sent. Waiting for response.',
          );
          return { ...t, messages: [...messages, systemMsg] };
        }),
      );
    },
    [],
  );

  const handleSelectThread = (id: string) => {
    setActiveThreadId(id);
    setChatThreads((prev) =>
      prev.map((t) => (t.id === id ? { ...t, unread: 0 } : t)),
    );
  };

  const toggleChat = () => {
    setChatOpen((v) => !v);
  };

  const handleOpenTerminal = useCallback((listing: TradeItem) => {
    const offers = generateMockOffers(listing, items);
    setTerminalOffers(offers);
    setTerminalListing(listing);
  }, []);

  const handleExecuteOffer = useCallback(
    (offer: IncomingOffer) => {
      if (!terminalListing) return;
      const traderItem: TradeItem = {
        id: `trader-${offer.id}`,
        title: offer.offererItemTitle,
        category: 'items',
        owner: offer.offererName,
        suburb: terminalListing.suburb,
        location: terminalListing.location,
        distanceKm: 0,
        condition: offer.offererCondition,
        conditionScore: offer.offererConditionScore,
        estimatedValue: offer.offererEstimatedValue,
        lookingFor: terminalListing.title,
        description: 'Offered item for swap.',
        images: [offer.offererItemImage],
        subCategory: 'electronics-tech' as SubCategoryId,
        matchRate: offer.matchScore,
        totalTrades: 0,
        views: 0,
      };

      const thread = createThread(traderItem);
      const offerMsg = createOfferMessage(thread.id, offer.offererName, traderItem, terminalListing, offer.cashTopUp);
      const sysMsg = createTextMessage(thread.id, 'system', `SWAP MATCHED via Trading Terminal. ${offer.offererName}'s offer was accepted. All other offers have been closed.`);
      thread.messages = [offerMsg, sysMsg];

      setChatThreads((prev) => [thread, ...prev]);
      setActiveThreadId(thread.id);
      setChatOpen(true);
      setTerminalListing(null);
    },
    [terminalListing],
  );

  return (
    <div className="min-h-screen bg-canvas text-ink-900">
      <Header query={query} onQueryChange={setQuery} onOpenChat={toggleChat} onOpenHub={() => setHubOpen(true)} unreadCount={unreadCount} />

      <CategoryBar
        active={activeCategory}
        onChange={handleSelectCategory}
        activeSuburbs={activeSuburbs}
        suburbs={stayNearSuburbs}
        onToggleSuburb={handleToggleSuburb}
        onClearSuburbs={handleClearSuburbs}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-start">
          <section className="lg:col-span-7 min-w-0">
        {/* Page header */}
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-ink-900 tracking-tight">{heading}</h2>
            {activeCategory !== 'stay-near' && (
              <p className="text-[11px] text-ink-400 mt-0.5 tnum">
                {filtered.length} {filtered.length === 1 ? 'listing' : 'listings'} · live feed
              </p>
            )}
          </div>
        </div>

        {/* Free Trade info card — flat institutional style */}
        {activeCategory === 'free-trade' && (
          <div className="mb-5 p-3.5 rounded-xl border border-line bg-surface flex items-start gap-3">
            <span className="w-7 h-7 rounded-md bg-lineSoft border border-line flex items-center justify-center text-ink-500 flex-shrink-0">
              <Info size={14} />
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-ink-900">How Free Trade works</p>
              <p className="text-[11px] text-ink-500 mt-0.5 leading-relaxed">
                These owners did not specify what they want. Tap any listing and offer your own item — they will review and accept or pass. No haggling, just proposals.
              </p>
            </div>
          </div>
        )}

        {activeCategory === 'stay-near' && !hasActiveSuburbs ? (
          <StayNearGrouped
            suburbs={stayNearSuburbs}
            items={filtered}
            onOpen={setSelected}
            onSelectSuburb={handleToggleSuburb}
          />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center border border-line rounded-xl bg-surface">
            <p className="font-semibold text-ink-900 text-sm">No matches found</p>
            <p className="text-[11px] text-ink-500 mt-1">Try a different search or category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-3 gap-y-4">
            {filtered.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onOpen={setSelected}
                highlight={item.popular && activeCategory === 'popular'}
                onAddTrade={() => setShowCreate(true)}
              />
            ))}
          </div>
        )}

        <footer className="mt-16 pt-6 border-t border-line text-center text-[11px] text-ink-400">
          <p>&copy; 2026 Swap Terminal — a demo trading marketplace. Data is illustrative.</p>
        </footer>
          </section>

          {activeCategory === 'items' ? (
            <ItemsSidebar active={activeSubCategory} onChange={setActiveSubCategory} />
          ) : (
            <Sidebar onAddTrade={() => setShowCreate(true)} />
          )}
        </div>
      </main>

      <QuickViewModal item={selected} onClose={() => setSelected(null)} onShowProfile={handleShowProfile} onPropose={handlePropose} />
      <UserProfileModal profile={profile} onClose={() => setProfile(null)} />
      <CreateListingModal open={showCreate} onClose={() => setShowCreate(false)} onPublish={handlePublish} />

      <OffersTerminal
        open={!!terminalListing}
        listing={terminalListing}
        offers={terminalOffers}
        onClose={() => setTerminalListing(null)}
        onExecute={handleExecuteOffer}
      />

      <MakeOfferModal
        open={!!offerTarget}
        targetItem={offerTarget}
        inventory={userListings}
        onClose={() => setOfferTarget(null)}
        onAddQuickItem={() => { setOfferTarget(null); setShowCreate(true); }}
        onSubmit={handleOfferSubmit}
      />

      <ControlHub
        open={hubOpen}
        onClose={() => setHubOpen(false)}
        inventory={userListings}
        onAddItem={() => { setHubOpen(false); setShowCreate(true); }}
        onOpenInventory={() => { setHubOpen(false); setInvWinOpen(true); }}
      />

      <InventoryWindow
        open={invWinOpen}
        onClose={() => setInvWinOpen(false)}
        inventory={userListings}
        onAddItem={() => { setInvWinOpen(false); setShowCreate(true); }}
        onViewTradeBoard={() => {}}
        onCancelOffer={() => {}}
      />

      <ChatDrawer
        open={chatOpen}
        onToggle={toggleChat}
        threads={chatThreads}
        activeThreadId={activeThreadId}
        onSelectThread={handleSelectThread}
        onSendMessage={handleSendMessage}
        onOfferAction={handleOfferAction}
        unreadCount={unreadCount}
      />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] px-4 py-2.5 rounded-lg bg-ink-900 text-white text-[13px] font-medium flex items-center gap-2 animate-[scaleIn_0.2s_ease-out] border border-ink-700 shadow-lg">
          <Check size={15} className="text-odds-up" />
          {toastMsg}
        </div>
      )}
    </div>
  );
}
