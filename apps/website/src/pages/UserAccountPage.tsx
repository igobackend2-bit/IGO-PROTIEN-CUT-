import React, { useState, useEffect } from 'react';
import {
  User,
  ShoppingBag,
  Crown,
  Wallet,
  Gift,
  Tag,
  Repeat,
  MapPin,
  Clock,
  Printer,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  XCircle,
  Pause,
  Play,
  Copy,
  Check,
  Plus,
  Trash2,
  Shield,
  Phone,
  Mail,
  Pencil,
  Lock,
  Truck,
  Star,
  Users,
  Trophy,
  MessageSquareText,
  Award,
  LocateFixed,
  Bell,
  CheckCheck
} from 'lucide-react';
import { StoreService } from '../lib/storage';
import { SupabaseService } from '../lib/supabaseClient';
import { OrderFeedbackModal } from '../components/OrderFeedbackModal';
import {
  signOut,
  fetchLoyalty,
  getCurrentUser,
  MEMBERSHIP_TIERS,
  tierForPoints,
  fetchProfile,
  upsertProfile
} from '../lib/api/auth';
import {
  fetchMySubscriptions,
  pauseSubscription,
  resumeSubscription,
  cancelSubscription,
  skipNextDelivery,
  RemoteSubscription
} from '../lib/api/subscriptions';
import { fetchMyPayments, PaymentRecord } from '../lib/api/payments';
import { fetchAchievements, AchievementRow } from '../lib/api/achievements';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '../lib/api/notifications';
import { Order, RewardTransaction, WalletTransaction, SavedAddress, AppNotification } from '../types';

type AccountTab = 'orders' | 'profile' | 'rewards' | 'wallet' | 'referral' | 'coupons' | 'subscriptions' | 'inbox';

const VALID_ACCOUNT_TABS: AccountTab[] = ['orders', 'profile', 'rewards', 'wallet', 'referral', 'coupons', 'subscriptions', 'inbox'];

interface UserAccountPageProps {
  onNavigate: (path: string) => void;
  onSelectOrderForTracking?: (order: Order) => void;
  // Lets a caller deep-link straight to a tab, e.g. the Cart page's address
  // "Edit" button navigating to `/account?tab=profile` instead of always
  // landing on the default Orders tab and leaving the customer to hunt for
  // the address list themselves.
  initialTab?: string;
}

// Sidebar tab config — was referenced (ACCOUNT_TABS.map(...)) but never
// actually defined anywhere in this file, so the account page's sidebar nav
// would throw "Cannot read properties of undefined" and crash at runtime.
// Order matches the 7 "TAB N" sections below (Orders, Subscriptions,
// Rewards, Wallet, Referral, Coupons, Profile).
const ACCOUNT_TABS = [
  { id: 'orders', label: 'My Orders', icon: ShoppingBag },
  { id: 'inbox', label: 'Inbox', icon: Bell },
  { id: 'subscriptions', label: 'Subscriptions', icon: Repeat },
  { id: 'rewards', label: 'Rewards & Tier', icon: Crown },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'referral', label: 'Refer & Earn', icon: Gift },
  { id: 'coupons', label: 'Coupons', icon: Tag },
  { id: 'profile', label: 'Profile & Addresses', icon: User }
];

export const UserAccountPage: React.FC<UserAccountPageProps> = ({
  onNavigate,
  onSelectOrderForTracking,
  initialTab
}) => {
  // Deep-link support (e.g. `/account?tab=profile`) — falls back to Orders
  // when initialTab is missing or isn't a recognized tab id, so a bad/old
  // link can never land on a blank tab.
  const [activeTab, setActiveTab] = useState<AccountTab>(
    initialTab && (VALID_ACCOUNT_TABS as string[]).includes(initialTab) ? (initialTab as AccountTab) : 'orders'
  );

  const [userProfile, setUserProfile] = useState(() => StoreService.getUserProfile());
  const [orders, setOrders] = useState<Order[]>(() => StoreService.getOrders());
  // Real subscriptions from the canonical `subscriptions` table (same one the
  // app reads/writes). Starts empty and loads in the background — there is no
  // safe local placeholder since a subscription has real billing/delivery
  // consequences, unlike orders/wishlist which have a harmless cached copy.
  const [subscriptions, setSubscriptions] = useState<RemoteSubscription[]>([]);
  const [subsLoading, setSubsLoading] = useState(true);
  const [subActionBusyId, setSubActionBusyId] = useState<string | null>(null);

  // Payment history — real rows from the canonical `payments` table.
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);

  // Achievement badges — real catalog + this user's unlocks.
  const [achievements, setAchievements] = useState<AchievementRow[]>([]);

  // Notification preferences — real columns on `profiles`, already read/written
  // by `fetchProfile`/`upsertProfile` in auth.ts; this page just needed a UI.
  const [notifyPrefs, setNotifyPrefs] = useState<{
    notifyOrderUpdates: boolean;
    notifyPromotions: boolean;
    notifyOffers: boolean;
    notifyStockAlerts: boolean;
  } | null>(null);
  const [notifyBusyKey, setNotifyBusyKey] = useState<string | null>(null);
  const [rewardHistory] = useState<RewardTransaction[]>(() => SupabaseService.getRewardHistory());
  const [walletHistory, setWalletHistory] = useState<WalletTransaction[]>(() => SupabaseService.getWalletHistory());

  // Add Money to Wallet
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [addMoneyAmount, setAddMoneyAmount] = useState<number>(500);

  // Inline toast (replaces window.alert)
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2200);
  };

  // Real order history + loyalty, pulled from the canonical tables the mobile
  // app and admin dashboard share. getOrders() already returned the cached
  // copy synchronously above, so this only upgrades what's on screen.
  const [loyalty, setLoyalty] = useState<{ points: number; tierLabel: string } | null>(null);

  useEffect(() => {
    let cancelled = false;

    StoreService.hydrateOrders()
      .then((fresh) => {
        if (!cancelled && fresh) setOrders(fresh);
      })
      .catch(() => {
        // Non-fatal — cached orders stay on screen.
      });

    getCurrentUser()
      .then((user) => {
        if (!user) return null;
        return fetchLoyalty(user.id);
      })
      .then((snapshot) => {
        if (!cancelled && snapshot) {
          setLoyalty({ points: snapshot.points, tierLabel: snapshot.tier.label });
        }
      })
      .catch(() => {});

    const onOrdersUpdated = () => setOrders(StoreService.getOrders());
    window.addEventListener('protein_cuts_orders_updated', onOrdersUpdated);

    return () => {
      cancelled = true;
      window.removeEventListener('protein_cuts_orders_updated', onOrdersUpdated);
    };
  }, []);

  // Real subscriptions, loaded from the canonical table this page shares
  // with the app. Replaces the old hard-coded localStorage sample.
  useEffect(() => {
    let cancelled = false;
    setSubsLoading(true);
    fetchMySubscriptions()
      .then((subs) => {
        if (!cancelled && subs) setSubscriptions(subs);
      })
      .finally(() => {
        if (!cancelled) setSubsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Real payment history, loaded from the canonical `payments` table.
  useEffect(() => {
    let cancelled = false;
    setPaymentsLoading(true);
    fetchMyPayments()
      .then((rows) => {
        if (!cancelled && rows) setPayments(rows);
      })
      .finally(() => {
        if (!cancelled) setPaymentsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Real achievement badges, loaded from the canonical `achievements` /
  // `user_achievements` tables — unlocking happens via a database trigger,
  // this page only ever reads.
  useEffect(() => {
    let cancelled = false;
    fetchAchievements()
      .then((rows) => {
        if (!cancelled && rows) setAchievements(rows);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Notification preferences, loaded from the real `profiles` columns.
  useEffect(() => {
    let cancelled = false;
    getCurrentUser()
      .then((user) => (user ? fetchProfile(user.id) : null))
      .then((profile) => {
        if (!cancelled && profile) {
          setNotifyPrefs({
            notifyOrderUpdates: profile.notifyOrderUpdates,
            notifyPromotions: profile.notifyPromotions,
            notifyOffers: profile.notifyOffers,
            notifyStockAlerts: profile.notifyStockAlerts
          });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const handleToggleNotifyPref = async (key: keyof NonNullable<typeof notifyPrefs>) => {
    if (!notifyPrefs) return;
    const nextValue = !notifyPrefs[key];
    setNotifyBusyKey(key);
    setNotifyPrefs({ ...notifyPrefs, [key]: nextValue });
    const user = await getCurrentUser();
    if (!user) {
      setNotifyBusyKey(null);
      return;
    }
    const result = await upsertProfile(user.id, { [key]: nextValue });
    if (!result.ok) {
      // Revert on failure rather than showing a preference that didn't save.
      setNotifyPrefs({ ...notifyPrefs, [key]: !nextValue });
      showToast(result.error ?? 'Could not save preference.');
    }
    setNotifyBusyKey(null);
  };

  // Addresses
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [newAddrLabel, setNewAddrLabel] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [newAddrName, setNewAddrName] = useState(userProfile.name);
  const [newAddrPhone, setNewAddrPhone] = useState(userProfile.phone);
  const [newAddrStreet, setNewAddrStreet] = useState('');
  const [newAddrPincode, setNewAddrPincode] = useState('560038');
  const [newAddrCity, setNewAddrCity] = useState('Bengaluru');

  // "Use current location" — browser geolocation + free OpenStreetMap
  // Nominatim reverse geocoding (no API key required). Best-effort only:
  // on any failure it leaves the fields as-is so the customer can just type
  // the address manually, same as before this existed.
  const [isLocating, setIsLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocateError('Location is not supported by this browser.');
      return;
    }
    setLocateError(null);
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
            { headers: { Accept: 'application/json' } }
          );
          const data = await res.json();
          const addr = data?.address ?? {};
          const streetLine = [addr.house_number, addr.road, addr.suburb || addr.neighbourhood]
            .filter(Boolean)
            .join(', ');
          if (streetLine) setNewAddrStreet(streetLine);
          const city = addr.city || addr.town || addr.village || addr.county;
          if (city) setNewAddrCity(city);
          if (addr.postcode) setNewAddrPincode(addr.postcode);
          if (!streetLine && !city && !addr.postcode) {
            setLocateError('Could not detect a precise address here — please fill it in manually.');
          }
        } catch {
          setLocateError('Could not detect your address. Please enter it manually.');
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        setLocateError('Location permission denied. Please enter your address manually.');
        setIsLocating(false);
      },
      { timeout: 10000 }
    );
  };

  // Edit Profile (name + phone — email stays read-only since it's tied to
  // the login/auth identity, not something to silently change here)
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editName, setEditName] = useState(userProfile.name);
  const [editPhone, setEditPhone] = useState(userProfile.phone);
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedProfile = { ...userProfile, name: editName.trim() || userProfile.name, phone: editPhone.trim() };
    setUserProfile(updatedProfile);
    StoreService.saveUserProfile(updatedProfile);
    setShowEditProfileModal(false);
    showToast('Profile updated.');
  };

  // Copied alert
  const [copiedCode, setCopiedCode] = useState(false);

  // Selected Order for Modal Detail / Print Invoice
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);

  // Order history list now shows just the order number + date per row —
  // clicking a row expands it in place to reveal status, items, total and
  // the action buttons, instead of always showing every order's full detail
  // at once.
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  // Order the customer is currently leaving post-delivery feedback for
  // (product review + delivery experience) — opens OrderFeedbackModal.
  const [feedbackOrder, setFeedbackOrder] = useState<Order | null>(null);

  // Inbox tab — reuses the exact same `notifications` table/API the header
  // bell dropdown reads (src/lib/api/notifications.ts), just surfaced as a
  // permanent page instead of a popover that disappears. Clicking a row
  // marks it read (so it "saves" as read, per request) and navigates
  // straight to its deepLink, same behavior as the bell dropdown.
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setNotificationsLoading(true);
    fetchNotifications()
      .then((rows) => {
        if (!cancelled) setNotifications(rows);
      })
      .finally(() => {
        if (!cancelled) setNotificationsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  const handleInboxItemClick = async (notif: AppNotification) => {
    if (!notif.isRead) {
      await markNotificationRead(notif.id);
      setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n)));
      window.dispatchEvent(new Event('protein_cuts_notifications_updated'));
    }
    if (notif.deepLink) onNavigate(notif.deepLink);
  };

  const handleMarkAllInboxRead = async () => {
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    window.dispatchEvent(new Event('protein_cuts_notifications_updated'));
  };

  const inboxIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'delivery': return <Truck className="w-4 h-4 text-emerald-600" />;
      case 'flash_sale': return <Sparkles className="w-4 h-4 text-emerald-600" />;
      case 'coupon': return <Tag className="w-4 h-4 text-emerald-600" />;
      case 'referral': return <Gift className="w-4 h-4 text-emerald-600" />;
      case 'support': return <MessageSquareText className="w-4 h-4 text-emerald-600" />;
      default: return <ShoppingBag className="w-4 h-4 text-emerald-600" />;
    }
  };

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(userProfile.referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const refreshSubscriptions = async () => {
    const subs = await fetchMySubscriptions();
    if (subs) setSubscriptions(subs);
  };

  const handleToggleSub = async (sub: RemoteSubscription) => {
    setSubActionBusyId(sub.id);
    const result =
      sub.status === 'active' ? await pauseSubscription(sub.id) : await resumeSubscription(sub.id, new Date());
    if (result.ok) {
      await refreshSubscriptions();
      showToast(sub.status === 'active' ? 'Subscription paused.' : 'Subscription resumed.');
    } else {
      showToast(result.error ?? 'Could not update the subscription.');
    }
    setSubActionBusyId(null);
  };

  const handleCancelSub = async (sub: RemoteSubscription) => {
    if (!window.confirm('Cancel this subscription? This cannot be undone.')) return;
    setSubActionBusyId(sub.id);
    const result = await cancelSubscription(sub.id);
    if (result.ok) {
      await refreshSubscriptions();
      showToast('Subscription cancelled.');
    } else {
      showToast(result.error ?? 'Could not cancel the subscription.');
    }
    setSubActionBusyId(null);
  };

  const handleSkipSub = async (sub: RemoteSubscription) => {
    setSubActionBusyId(sub.id);
    const result = await skipNextDelivery(sub);
    if (result.ok) {
      await refreshSubscriptions();
      showToast('Next delivery skipped.');
    } else {
      showToast(result.error ?? 'Could not skip the next delivery.');
    }
    setSubActionBusyId(null);
  };

  const handleCancelOrder = (orderId: string) => {
    const updated = StoreService.updateOrderStatus(orderId, 'Cancelled');
    setOrders(updated);
  };

  const handleAddMoneySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addMoneyAmount || addMoneyAmount <= 0) return;
    const updatedProfile = StoreService.addWalletFunds(addMoneyAmount);
    setUserProfile(updatedProfile);
    const updatedHistory = SupabaseService.addWalletTransaction({
      type: 'credit',
      amount: addMoneyAmount,
      description: 'Added money via UPI/Card',
      status: 'Completed'
    });
    setWalletHistory(updatedHistory);
    setShowAddMoneyModal(false);
    showToast(`₹${addMoneyAmount} added to your IGO Wallet!`);
  };

  const handleAddAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrStreet || !newAddrName.trim() || !newAddrPhone.trim()) return;

    // Fully-shaped SavedAddress so this address is immediately usable at
    // Checkout too — previously this only filled label/fullAddress/pincode,
    // which meant addresses saved here silently never appeared in the
    // Checkout address selector (it reads a differently-shaped list).
    const newAdd: SavedAddress = {
      id: `addr-${Date.now()}`,
      type: newAddrLabel,
      label: newAddrLabel,
      name: newAddrName.trim(),
      phone: newAddrPhone.trim(),
      flatNo: newAddrStreet,
      street: '',
      landmark: '',
      city: newAddrCity,
      pincode: newAddrPincode,
      fullAddress: `${newAddrStreet}, ${newAddrCity}`,
      isDefault: userProfile.savedAddresses.length === 0
    };

    const updatedList = [...userProfile.savedAddresses, newAdd];
    const updatedProfile = {
      ...userProfile,
      savedAddresses: updatedList,
      addresses: updatedList
    };
    setUserProfile(updatedProfile);
    StoreService.saveUserProfile(updatedProfile);
    setShowAddAddressModal(false);
    setNewAddrStreet('');
    showToast('Address saved — it will now show up at Checkout too.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Account Top Summary Card — lighter, cleaner treatment (plain white
          card, big circular avatar, contact row, single Edit Profile action)
          rather than the previous dark full-bleed panel. */}
      <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center font-black text-[#0F7B3A] text-3xl shrink-0">
              {userProfile.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black text-[#0A1F12]">{userProfile.name}</h1>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1">
                  {/* Uses the tier computed from reward_transactions, not the
                      cached profile default — otherwise this badge said "Gold"
                      while the stat below it correctly said "Bronze". */}
                  <Crown className="w-3 h-3" />{' '}
                  {loyalty?.tierLabel ?? userProfile.membershipTier} Member
                </span>
              </div>
              <div className="text-xs text-neutral-500 mt-1.5 flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-emerald-600" /> {userProfile.email}</span>
                <span className="text-neutral-300">•</span>
                {userProfile.phone ? (
                  <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-emerald-600" /> {userProfile.phone}</span>
                ) : (
                  <button
                    onClick={() => setShowEditProfileModal(true)}
                    className="flex items-center gap-1 text-emerald-700 font-semibold hover:underline cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" /> Add phone number
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setEditName(userProfile.name);
                setEditPhone(userProfile.phone);
                setShowEditProfileModal(true);
              }}
              className="flex items-center gap-2 bg-white border border-neutral-200 hover:border-emerald-400 hover:text-emerald-700 text-[#0A1F12] font-bold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit Profile
            </button>
            <button
              onClick={async () => {
                await signOut();
                StoreService.setLoggedIn(false);
                // Wipe the cached profile (name, wallet, saved addresses) so
                // the next visitor on this device — or this same person if
                // they browse on while signed out — never sees the previous
                // customer's data.
                StoreService.clearUserProfile();
                onNavigate('/');
              }}
              className="text-xs text-neutral-400 hover:text-[#0A1F12] font-bold px-3 py-2.5 transition cursor-pointer"
              title="Log Out"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Quick stats — kept, restyled as light chips instead of a dark panel */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-5 border-t border-neutral-100">
          <div className="bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3">
            {/* Points are summed from `reward_transactions` — the same ledger
                the app reads — falling back to the cached profile value. */}
            <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-wide">Reward Points</div>
            <div className="text-lg font-black text-[#0A1F12]">
              {loyalty?.points ?? userProfile.rewardPoints} pts
            </div>
          </div>
          <div className="bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3">
            <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-wide">Wallet Balance</div>
            <div className="text-lg font-black text-emerald-700">₹{userProfile.walletBalance}</div>
          </div>
          {loyalty && (
            <div className="bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3">
              {/* Tier ladder mirrors the app's Bronze/Silver/Gold/Platinum
                  (lib/models/membership_tier.dart) so a customer sees the
                  same status in the app and on the website. */}
              <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-wide">Membership</div>
              <div className="text-lg font-black text-amber-600">{loyalty.tierLabel}</div>
            </div>
          )}
        </div>
      </div>

      {/* Account navigation.
          A vertical sidebar on desktop rather than a horizontal tab row: with
          seven sections the row scrolled off-screen and the later tabs were
          effectively hidden. On mobile it falls back to a scrolling row, where
          vertical space is the scarcer resource. */}
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <nav className="lg:sticky lg:top-6 lg:self-start">
          <div className="flex lg:flex-col gap-1.5 overflow-x-auto no-scrollbar lg:overflow-visible">
            {ACCOUNT_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`group relative flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition cursor-pointer whitespace-nowrap lg:w-full ${
                    isActive
                      ? 'bg-emerald-50 text-[#0F7B3A]'
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-[#0A1F12]'
                  }`}
                >
                  {/* Green rail on the active item — the marker used across the
                      IGO group's account screens. */}
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-[#0F7B3A] hidden lg:block" />
                  )}
                  <Icon
                    className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-[#0F7B3A]' : 'text-neutral-400'}`}
                  />
                  <span className="flex-1 text-left">{tab.label}</span>
                  <ChevronRight
                    className={`hidden h-4 w-4 shrink-0 lg:block ${
                      isActive ? 'text-[#0F7B3A]' : 'text-neutral-300'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </nav>

        <div className="min-w-0 space-y-10">

      {/* TAB 1: MY ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-[#0A1F12]">Order History & Live Status</h2>
            <span className="text-xs text-neutral-500">{orders.length} total orders</span>
          </div>

          <div className="space-y-4">
            {orders.map((order) => {
              // Raw timestamps from Supabase look like
              // "2026-07-30T13:35:22.907555+00:00" — parse once and render a
              // proper "30 Jul 2026 · 7:05 PM" label instead of the ISO
              // string, matching how every mainstream order-history page
              // formats dates.
              const orderDate = new Date(order.createdAt);
              const formattedDate = Number.isNaN(orderDate.getTime())
                ? order.createdAt
                : orderDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
              const formattedTime = Number.isNaN(orderDate.getTime())
                ? null
                : orderDate.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
              const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

              const isExpanded = expandedOrderId === order.id;

              return (
                <div key={order.id} className="bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition">
                  {/* Collapsed row — just order number + placed-on date, per
                      request. Everything else (status, track, items, total,
                      invoice/cancel) only shows once this is clicked open. */}
                  <button
                    onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                    className="w-full flex items-center justify-between gap-3 px-6 py-4 bg-neutral-50 hover:bg-neutral-100 transition text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-white border border-neutral-200 flex items-center justify-center shrink-0">
                        <ShoppingBag className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-black text-[#0A1F12] text-sm">#{order.orderNumber}</div>
                        <div className="text-[11px] text-neutral-400 mt-0.5">
                          Placed on {formattedDate}{formattedTime ? ` · ${formattedTime}` : ''}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </button>

                  {isExpanded && (
                    <>
                      {/* Status + track — only visible once expanded */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-3 border-t border-b border-neutral-200">
                        <span className="text-xs text-neutral-500">{itemCount} item{itemCount !== 1 ? 's' : ''} in this order</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                            order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            order.status === 'Cancelled' ? 'bg-red-50 text-red-600 border border-red-200' :
                            order.status === 'Out for Delivery' ? 'bg-[#0A1F12] text-white border border-black' :
                            'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              order.status === 'Delivered' ? 'bg-emerald-500' :
                              order.status === 'Cancelled' ? 'bg-red-500' :
                              order.status === 'Out for Delivery' ? 'bg-white animate-pulse' :
                              'bg-emerald-600'
                            }`} />
                            {order.status}
                          </span>
                          <button
                            onClick={() => onSelectOrderForTracking && onSelectOrderForTracking(order)}
                            className="flex items-center gap-1.5 bg-white hover:bg-emerald-50 text-emerald-700 font-bold px-3 py-1.5 rounded-full transition border border-emerald-200"
                          >
                            <Truck className="w-3.5 h-3.5" /> Track Order
                          </button>
                        </div>
                      </div>

                      {/* Items Summary */}
                      <div className="px-6 py-4 space-y-3">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs text-neutral-600">
                            <div className="flex items-center gap-3 min-w-0">
                              <img src={item.product.image} alt={item.product.name} referrerPolicy="no-referrer" className="w-11 h-11 rounded-xl object-cover bg-neutral-100 border border-neutral-100 shrink-0" />
                              <div className="min-w-0">
                                <div className="font-bold text-[#0A1F12] truncate">{item.product.name}</div>
                                <div className="text-[10px] text-neutral-500 mt-0.5">{item.selectedWeight.label} • Qty: {item.quantity}</div>
                              </div>
                            </div>
                            <div className="font-bold text-[#0A1F12] shrink-0 pl-2">₹{item.selectedWeight.price * item.quantity}</div>
                          </div>
                        ))}
                      </div>

                      {/* Footer Controls */}
                      <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="font-bold text-[#0A1F12] text-sm">
                          Total Amount: <span className="text-emerald-700">₹{order.totalAmount}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedOrderForInvoice(order)}
                            className="px-3 py-1.5 rounded-xl border border-neutral-200 bg-white text-neutral-600 hover:text-[#0A1F12] hover:border-emerald-300 transition flex items-center gap-1.5 font-semibold"
                          >
                            <Printer className="w-3.5 h-3.5" /> Print Invoice
                          </button>
                          {order.status === 'Delivered' && (
                            <button
                              onClick={() => setFeedbackOrder(order)}
                              className="px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition flex items-center gap-1.5 font-semibold"
                            >
                              <Star className="w-3.5 h-3.5" /> Rate Your Order
                            </button>
                          )}
                          {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                            <button
                              onClick={() => handleCancelOrder(order.id)}
                              className="px-3 py-1.5 rounded-xl border border-neutral-300 bg-white text-neutral-700 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition font-semibold"
                            >
                              Cancel Order
                            </button>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: INBOX — same notifications the header bell shows, kept as a
          permanent page here instead of a popover, so nothing gets missed
          once the dropdown closes. */}
      {activeTab === 'inbox' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-[#0A1F12]">Inbox</h2>
            {notifications.some((n) => !n.isRead) && (
              <button
                onClick={handleMarkAllInboxRead}
                className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-600 transition cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          {notificationsLoading ? (
            <div className="text-xs text-neutral-400 text-center py-10">Loading your notifications…</div>
          ) : notifications.length === 0 ? (
            <div className="bg-white border border-neutral-200 rounded-3xl p-10 text-center space-y-2">
              <Bell className="w-8 h-8 text-neutral-300 mx-auto" />
              <p className="text-sm font-bold text-[#0A1F12]">No notifications yet</p>
              <p className="text-xs text-neutral-500">Order updates and offers will show up here.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {notifications.map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => handleInboxItemClick(notif)}
                  className={`w-full text-left p-4 rounded-2xl border transition cursor-pointer flex items-start gap-3 relative ${
                    !notif.isRead
                      ? 'bg-emerald-50 border-emerald-200 hover:border-emerald-300'
                      : 'bg-white border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  {!notif.isRead && (
                    <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-emerald-500" />
                  )}
                  <div className="p-2 rounded-lg bg-white border border-neutral-200 shrink-0">
                    {inboxIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="text-sm font-bold text-[#0A1F12]">{notif.title}</div>
                    <p className="text-xs text-neutral-600 mt-1 leading-relaxed">{notif.message}</p>
                    <div className="text-[10px] text-neutral-400 mt-2 font-mono">
                      {new Date(notif.createdAt).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: RECURRING SUBSCRIPTIONS */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-[#0A1F12]">Recurring Gym & Fresh Protein Subscriptions</h2>
            <button onClick={() => onNavigate('/subscriptions')} className="bg-[#0F7B3A] text-white px-4 py-2 rounded-xl text-xs font-bold">
              + Browse Subscription Plans
            </button>
          </div>

          {subsLoading ? (
            <div className="text-xs text-neutral-400 text-center py-10">Loading your subscriptions…</div>
          ) : subscriptions.length === 0 ? (
            <div className="bg-white border border-neutral-200 rounded-3xl p-10 text-center space-y-2">
              <Repeat className="w-8 h-8 text-neutral-300 mx-auto" />
              <p className="text-sm font-bold text-[#0A1F12]">No active subscriptions yet</p>
              <p className="text-xs text-neutral-500">Build a recurring box on the Subscriptions page to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {subscriptions.map((sub) => {
                const busy = subActionBusyId === sub.id;
                const scheduleLabel =
                  sub.scheduleType === 'daily'
                    ? `Every ${sub.interval > 1 ? `${sub.interval} days` : 'day'}`
                    : sub.scheduleType === 'weekly'
                    ? `Every ${sub.interval > 1 ? `${sub.interval} weeks` : 'week'}`
                    : sub.scheduleType === 'monthly'
                    ? `Every ${sub.interval > 1 ? `${sub.interval} months` : 'month'}`
                    : 'Custom weekly days';
                return (
                  <div key={sub.id} className="bg-white border border-neutral-200 rounded-3xl p-6 space-y-4 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            sub.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : sub.status === 'paused'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-neutral-100 text-neutral-500 border border-neutral-200'
                          }`}
                        >
                          {sub.status}
                        </span>
                        <h3 className="font-bold text-[#0A1F12] text-base mt-2">{sub.productName}</h3>
                        <p className="text-xs text-neutral-500 mt-1">
                          Qty {sub.quantity} · {scheduleLabel}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-black text-emerald-700">₹{sub.pricePerDelivery}</div>
                        <div className="text-[10px] text-neutral-500">Per delivery</div>
                      </div>
                    </div>

                    <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-3 text-xs space-y-1">
                      <div className="flex justify-between text-neutral-600">
                        <span>Next Scheduled Dispatch:</span>
                        <strong className="text-emerald-700 font-mono">{sub.nextDelivery || '—'}</strong>
                      </div>
                      <div className="flex justify-between text-neutral-600">
                        <span>Time Slot:</span>
                        <strong className="text-[#0A1F12]">{sub.deliverySlot ?? 'Not set'}</strong>
                      </div>
                    </div>

                    {sub.status !== 'cancelled' && (
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          disabled={busy}
                          onClick={() => handleToggleSub(sub)}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase transition flex items-center justify-center gap-1 disabled:opacity-50 ${
                            sub.status === 'active'
                              ? 'bg-neutral-100 hover:bg-neutral-200 text-[#0A1F12] border border-neutral-200'
                              : 'bg-[#0F7B3A] hover:bg-emerald-500 text-white'
                          }`}
                        >
                          {sub.status === 'active' ? (
                            <>
                              <Pause className="w-3.5 h-3.5" /> Pause
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5" /> Resume
                            </>
                          )}
                        </button>
                        {sub.status === 'active' && (
                          <button
                            disabled={busy}
                            onClick={() => handleSkipSub(sub)}
                            className="flex-1 py-2 rounded-xl text-xs font-bold uppercase transition bg-white border border-neutral-200 hover:border-emerald-400 text-[#0A1F12] disabled:opacity-50"
                          >
                            Skip Next
                          </button>
                        )}
                        <button
                          disabled={busy}
                          onClick={() => handleCancelSub(sub)}
                          className="py-2 px-3 rounded-xl text-xs font-bold uppercase transition bg-white border border-neutral-200 hover:border-red-300 hover:text-red-600 text-neutral-500 disabled:opacity-50"
                          title="Cancel subscription"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: REWARDS & TIER */}
      {activeTab === 'rewards' && (
        <div className="space-y-6">
          <div className="bg-[#0A1F12] rounded-3xl p-8 space-y-4 text-white shadow-lg shadow-emerald-950/20">
            <div className="flex items-center gap-2 text-white text-xs font-bold uppercase tracking-wider">
              <Crown className="w-4 h-4 fill-white" /> IGO{' '}
              {(loyalty?.tierLabel ?? userProfile.membershipTier).toUpperCase()} MEMBER
            </div>
            <h2 className="text-2xl font-black text-white">Your Reward Ledger ({userProfile.rewardPoints} Points)</h2>
            <p className="text-xs text-neutral-300">Earn 10 points for every ₹100 spent. Redeem points directly at checkout for discounts.</p>
          </div>

          {/* Membership Tier Progress — real, automatic, points-based
              (Bronze/Silver/Gold/Platinum at 0/500/1500/3000 pts), matching
              the mobile app's model exactly. This replaces a previous
              "Switch to Gold/Platinum/Elite" picker that showed real prices
              (₹199–499/month) and said "Upgraded!" on click without ever
              charging anything or saving it anywhere real — every tier here
              is earned, never bought, and nothing is written by this page. */}
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#0A1F12] text-sm">Membership Tiers — Earned by Reward Points</h3>
              <span className="text-[10px] text-neutral-400 font-semibold">10 pts per ₹100 spent</span>
            </div>

            {(() => {
              const currentPoints = loyalty?.points ?? userProfile.rewardPoints ?? 0;
              const currentTier = tierForPoints(currentPoints);
              const currentIndex = MEMBERSHIP_TIERS.findIndex((t) => t.key === currentTier.key);
              const nextTier = MEMBERSHIP_TIERS[currentIndex + 1];

              return nextTier ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5">
                  <div className="flex justify-between text-[11px] font-bold text-emerald-800 mb-1.5">
                    <span>{currentPoints} pts</span>
                    <span>{nextTier.requiredPoints - currentPoints} pts to {nextTier.label}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white overflow-hidden">
                    <div
                      className="h-full bg-[#0F7B3A] rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round(
                            ((currentPoints - currentTier.requiredPoints) /
                              (nextTier.requiredPoints - currentTier.requiredPoints)) *
                              100
                          )
                        )}%`
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 text-[11px] font-bold text-emerald-800">
                  You&rsquo;ve reached the top tier — {currentPoints} pts and counting.
                </div>
              );
            })()}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {MEMBERSHIP_TIERS.map((t) => {
                const currentPoints = loyalty?.points ?? userProfile.rewardPoints ?? 0;
                const isUnlocked = currentPoints >= t.requiredPoints;
                const isCurrent = tierForPoints(currentPoints).key === t.key;
                return (
                  <div
                    key={t.key}
                    className={`rounded-2xl border p-3.5 space-y-1.5 ${
                      isCurrent
                        ? 'bg-emerald-50 border-emerald-500 shadow-sm'
                        : isUnlocked
                        ? 'bg-white border-neutral-200'
                        : 'bg-neutral-50 border-neutral-200 text-neutral-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-black text-sm ${isUnlocked ? 'text-[#0A1F12]' : 'text-neutral-400'}`}>{t.label}</span>
                      {isCurrent ? (
                        <span className="bg-[#0F7B3A] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">Current</span>
                      ) : isUnlocked ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-neutral-300" />
                      )}
                    </div>
                    <div className="text-[10px] font-semibold">{t.requiredPoints} pts</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Achievement badges — real catalog from `achievements`, unlocked
              rows joined from `user_achievements`. Locked badges show muted
              rather than being hidden, so customers can see what's next. */}
          {achievements.length > 0 && (
            <div className="bg-white border border-neutral-200 rounded-3xl p-6 space-y-4 shadow-sm">
              <h3 className="font-bold text-[#0A1F12] text-sm">Achievement Badges</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {achievements.map((a) => {
                  const unlocked = !!a.unlockedAt;
                  const IconComp =
                    {
                      shopping_bag: ShoppingBag,
                      local_shipping: Truck,
                      military_tech: Trophy,
                      rate_review: MessageSquareText,
                      star: Star,
                      groups: Users
                    }[a.icon] ?? Award;
                  return (
                    <div
                      key={a.id}
                      title={a.description}
                      className={`rounded-2xl border p-3 flex flex-col items-center text-center gap-1.5 ${
                        unlocked ? 'bg-emerald-50 border-emerald-200' : 'bg-neutral-50 border-neutral-200 opacity-60'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center ${
                          unlocked ? 'bg-[#0F7B3A] text-white' : 'bg-neutral-200 text-neutral-400'
                        }`}
                      >
                        <IconComp className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold text-[#0A1F12] leading-tight">{a.title}</span>
                      {!unlocked && <Lock className="w-3 h-3 text-neutral-300" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-white border border-neutral-200 rounded-3xl p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-[#0A1F12] text-sm">Points Activity History</h3>
            <div className="space-y-2">
              {rewardHistory.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs">
                  <div>
                    <div className="font-bold text-[#0A1F12]">{tx.description}</div>
                    <div className="text-[10px] text-neutral-500 font-mono">{tx.date}</div>
                  </div>
                  <div className={`font-black text-sm ${tx.type === 'Earned' ? 'text-emerald-700' : 'text-[#0A1F12]'}`}>
                    {tx.type === 'Earned' ? '+' : '-'}{tx.points} pts
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: WALLET */}
      {activeTab === 'wallet' && (
        <div className="space-y-6">
          <div className="bg-[#0A1F12] rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-white shadow-lg shadow-emerald-950/20">
            <div>
              <div className="text-xs text-emerald-400 font-bold uppercase">IGO Cash Balance</div>
              <div className="text-4xl font-black text-white mt-1">₹{userProfile.walletBalance}</div>
              <p className="text-xs text-neutral-400 mt-2">Instant checkout refunds & cashback earnings store here.</p>
            </div>
            <button
              onClick={() => setShowAddMoneyModal(true)}
              className="bg-[#0F7B3A] hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-2xl text-xs uppercase tracking-wider cursor-pointer transition"
            >
              + Add Money to Wallet
            </button>
          </div>

          <div className="bg-white border border-neutral-200 rounded-3xl p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-[#0A1F12] text-sm">Wallet Statement</h3>
            <div className="space-y-2">
              {walletHistory.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs">
                  <div>
                    <div className="font-bold text-[#0A1F12]">{tx.description}</div>
                    <div className="text-[10px] text-neutral-500 font-mono">{tx.date}</div>
                  </div>
                  <div className={`font-black text-sm ${tx.type === 'credit' ? 'text-emerald-700' : 'text-[#0A1F12]'}`}>
                    {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Real payment history — from the canonical `payments` table, the
              same one order placement writes to. Distinct from the wallet
              statement above (IGO Cash credits/debits), this shows what was
              actually charged per order and its status. */}
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-[#0A1F12] text-sm">Payment History</h3>
            {paymentsLoading ? (
              <div className="text-xs text-neutral-400 text-center py-6">Loading payment history…</div>
            ) : payments.length === 0 ? (
              <div className="text-xs text-neutral-400 text-center py-6">No payments yet.</div>
            ) : (
              <div className="space-y-2">
                {payments.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs"
                  >
                    <div>
                      <div className="font-bold text-[#0A1F12]">
                        {p.paymentMethod ?? 'Payment'} {p.orderId ? `· Order #${p.orderId.slice(0, 8).toUpperCase()}` : ''}
                      </div>
                      <div className="text-[10px] text-neutral-500 font-mono">
                        {p.createdAt ? new Date(p.createdAt).toLocaleString() : ''}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-sm text-[#0A1F12]">₹{p.amount}</div>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          p.status === 'Success'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : p.status === 'Refunded'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-neutral-100 text-neutral-500 border border-neutral-200'
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: REFERRAL PROGRAM */}
      {activeTab === 'referral' && (
        <div className="bg-white border border-neutral-200 rounded-3xl p-8 max-w-2xl mx-auto space-y-6 text-center shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-[#0F7B3A] flex items-center justify-center mx-auto text-white shadow-xl">
            <Gift className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-[#0A1F12]">Give ₹150, Get ₹150 Protein Coupon</h2>
          <p className="text-xs text-neutral-600 leading-relaxed max-w-md mx-auto">
            Share your unique referral code with gym partners and friends. When they complete their first order, both of you get ₹150 off!
          </p>

          <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 flex items-center justify-between max-w-md mx-auto">
            <span className="font-mono font-black text-emerald-700 text-lg tracking-widest">{userProfile.referralCode}</span>
            <button
              onClick={handleCopyReferral}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 6: COUPONS */}
      {activeTab === 'coupons' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { code: 'FRESH100', desc: 'Flat ₹100 Off on your first organic chicken or mutton order', min: 499 },
            { code: 'GYMPRO', desc: '15% Extra Cashback on boneless chicken & egg packs', min: 799 },
            { code: 'SEAFOOD20', desc: 'Flat 20% Off on Wild Prawns and Atlantic Salmon steaks', min: 999 }
          ].map((c) => (
            <div key={c.code} className="bg-white border border-neutral-200 rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-mono font-black text-[#0A1F12] bg-neutral-50 border border-neutral-200 px-3 py-1 rounded-xl text-sm">
                  {c.code}
                </span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  Min Order ₹{c.min}
                </span>
              </div>
              <p className="text-xs text-neutral-600">{c.desc}</p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(c.code);
                  showToast(`Copied code ${c.code} to clipboard!`);
                }}
                className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold py-2.5 rounded-xl text-xs uppercase cursor-pointer transition"
              >
                Copy Promo Code
              </button>
            </div>
          ))}
        </div>
      )}

      {/* TAB 7: PROFILE & ADDRESSES */}
      {activeTab === 'profile' && (
        <div className="space-y-8">
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-[#0A1F12] text-base">Saved Delivery Addresses</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {userProfile.savedAddresses.map((addr) => (
                <div key={addr.id} className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs space-y-2">
                  <div className="flex items-center justify-between font-bold text-[#0A1F12]">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-emerald-600" /> {addr.label}</span>
                    {addr.isDefault && <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">Default</span>}
                  </div>
                  <p className="text-neutral-600 leading-relaxed">{addr.fullAddress} - {addr.pincode}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowAddAddressModal(true)}
              className="bg-[#0F7B3A] hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs uppercase"
            >
              + Add New Delivery Address
            </button>
          </div>

          {/* Notification Preferences — real profiles.notify_* columns,
              already read/written by auth.ts; this is just the missing UI. */}
          {notifyPrefs && (
            <div className="bg-white border border-neutral-200 rounded-3xl p-6 space-y-4 shadow-sm">
              <h3 className="font-bold text-[#0A1F12] text-base">Notification Preferences</h3>
              <div className="space-y-2">
                {(
                  [
                    { key: 'notifyOrderUpdates', label: 'Order Updates', desc: 'Status changes on your orders (packed, out for delivery, delivered).' },
                    { key: 'notifyPromotions', label: 'Promotions', desc: 'New offers, seasonal sales and combo deals.' },
                    { key: 'notifyOffers', label: 'Coupons & Discounts', desc: 'New coupon codes and personalized discounts.' },
                    { key: 'notifyStockAlerts', label: 'Stock Alerts', desc: 'When a wishlisted or back-ordered item is back in stock.' }
                  ] as const
                ).map((row) => {
                  const enabled = notifyPrefs[row.key];
                  const busy = notifyBusyKey === row.key;
                  return (
                    <div
                      key={row.key}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200"
                    >
                      <div className="pr-4">
                        <div className="text-xs font-bold text-[#0A1F12]">{row.label}</div>
                        <div className="text-[11px] text-neutral-500 mt-0.5">{row.desc}</div>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={enabled}
                        disabled={busy}
                        onClick={() => handleToggleNotifyPref(row.key)}
                        className={`shrink-0 w-11 h-6 rounded-full relative transition disabled:opacity-50 cursor-pointer ${
                          enabled ? 'bg-[#0F7B3A]' : 'bg-neutral-300'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                            enabled ? 'translate-x-[22px]' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Profile Modal — email intentionally read-only here since it's
          tied to the login identity, not something to silently change. */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 rounded-3xl max-w-sm w-full p-6 text-[#0A1F12] space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold">Edit Profile</h3>
            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-600 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-[#0A1F12] focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-neutral-600 mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="e.g. 98765 43210"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-[#0A1F12] focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block font-bold text-neutral-600 mb-1">Email</label>
                <input
                  type="email"
                  value={userProfile.email}
                  disabled
                  title="Email is tied to your login and can't be changed here"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-neutral-400 cursor-not-allowed"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowEditProfileModal(false)} className="px-4 py-2 text-neutral-500 cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="bg-[#0F7B3A] hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl uppercase cursor-pointer transition">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Address Modal */}
      {showAddAddressModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 rounded-3xl max-w-md w-full p-6 text-[#0A1F12] space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold">Add Delivery Address</h3>

            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={isLocating}
              className="w-full flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold py-2.5 rounded-xl text-xs uppercase transition disabled:opacity-60 cursor-pointer"
            >
              <LocateFixed className={`w-3.5 h-3.5 ${isLocating ? 'animate-pulse' : ''}`} />
              {isLocating ? 'Detecting your location…' : 'Use Current Location'}
            </button>
            {locateError && <p className="text-[11px] text-red-600 font-semibold text-center">{locateError}</p>}

            <form onSubmit={handleAddAddressSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-600 mb-1">Address Label</label>
                <div className="flex gap-2">
                  {(['Home', 'Work', 'Other'] as const).map((lbl) => (
                    <button
                      key={lbl}
                      type="button"
                      onClick={() => setNewAddrLabel(lbl)}
                      className={`flex-1 py-2 rounded-xl font-bold border transition ${
                        newAddrLabel === lbl ? 'bg-emerald-50 border-emerald-400 text-emerald-700' : 'bg-white border-neutral-200 text-neutral-500'
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Recipient Name</label>
                  <input
                    type="text"
                    placeholder="Full name"
                    value={newAddrName}
                    onChange={(e) => setNewAddrName(e.target.value)}
                    className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-[#0A1F12] focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="10-digit mobile"
                    value={newAddrPhone}
                    onChange={(e) => setNewAddrPhone(e.target.value)}
                    className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-[#0A1F12] focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-600 mb-1">House / Flat / Street Name</label>
                <input
                  type="text"
                  placeholder="e.g. #402, Green Valley Apartments, 12th Main Rd"
                  value={newAddrStreet}
                  onChange={(e) => setNewAddrStreet(e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-[#0A1F12] focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-600 mb-1">Pincode</label>
                <input
                  type="text"
                  value={newAddrPincode}
                  onChange={(e) => setNewAddrPincode(e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-[#0A1F12] focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddAddressModal(false)} className="px-4 py-2 text-neutral-500">
                  Cancel
                </button>
                <button type="submit" className="bg-[#0F7B3A] hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl uppercase">
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Money to Wallet Modal */}
      {showAddMoneyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 rounded-3xl max-w-sm w-full p-6 text-[#0A1F12] space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold">Add Money to IGO Wallet</h3>
            <p className="text-xs text-neutral-500">Top up instantly via UPI or Card. Funds are usable on any future order.</p>
            <form onSubmit={handleAddMoneySubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-4 gap-2">
                {[200, 500, 1000, 2000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAddMoneyAmount(amt)}
                    className={`py-2 rounded-xl font-bold border transition cursor-pointer ${
                      addMoneyAmount === amt ? 'bg-emerald-50 border-emerald-400 text-emerald-700' : 'bg-white border-neutral-200 text-neutral-500'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
              <div>
                <label className="block font-bold text-neutral-600 mb-1">Custom Amount (₹)</label>
                <input
                  type="number"
                  min={1}
                  value={addMoneyAmount}
                  onChange={(e) => setAddMoneyAmount(Number(e.target.value))}
                  className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-[#0A1F12] focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddMoneyModal(false)} className="px-4 py-2 text-neutral-500 cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="bg-[#0F7B3A] hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl uppercase cursor-pointer transition">
                  Add ₹{addMoneyAmount || 0}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inline Toast Notification (replaces window.alert) */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-5 py-3 rounded-2xl shadow-2xl">
          {toastMsg}
        </div>
      )}

      {/* Print Invoice Modal */}
      {selectedOrderForInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-black rounded-3xl max-w-lg w-full p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedOrderForInvoice(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black font-bold"
            >
              ✕
            </button>
            <div className="border-b pb-4 flex justify-between items-start">
              <div>
                <div className="font-black text-xl text-emerald-800">IGO PROTEIN CUTS</div>
                <div className="text-[10px] text-gray-500 uppercase">Farm Fresh Cold-Chain Express</div>
              </div>
              <div className="text-right text-xs">
                <div className="font-bold">{selectedOrderForInvoice.orderNumber}</div>
                <div className="text-gray-500">{selectedOrderForInvoice.createdAt}</div>
              </div>
            </div>

            <div className="text-xs space-y-2">
              <div className="font-bold">Items:</div>
              {selectedOrderForInvoice.items.map((it, idx) => (
                <div key={idx} className="flex justify-between border-b pb-1">
                  <span>{it.productName} ({it.weightLabel}) x{it.quantity}</span>
                  <span className="font-bold">₹{it.price * it.quantity}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 text-right text-sm font-black">
              Total Amount Paid: ₹{selectedOrderForInvoice.totalAmount}
            </div>

            <button
              onClick={() => {
                window.print();
              }}
              className="w-full bg-emerald-800 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs uppercase"
            >
              Print Official Receipt PDF
            </button>
          </div>
        </div>
      )}

      {/* Post-delivery feedback: product review + delivery experience */}
      {feedbackOrder && (
        // key={feedbackOrder.id} forces a full remount when switching from
        // one order's feedback to another's — without it, React reuses the
        // same component instance and its per-order state (ratings, drafts,
        // "already submitted" banners) can briefly leak from the previous
        // order into the newly-opened one until the fresh fetch resolves.
        <OrderFeedbackModal key={feedbackOrder.id} order={feedbackOrder} onClose={() => setFeedbackOrder(null)} />
      )}
        </div>
      </div>
    </div>
  );
};
