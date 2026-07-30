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
  Mail
} from 'lucide-react';
import { StoreService } from '../lib/storage';
import { SupabaseService } from '../lib/supabaseClient';
import { signOut, fetchLoyalty, getCurrentUser } from '../lib/api/auth';
import { Order, UserSubscription, RewardTransaction, WalletTransaction, SavedAddress } from '../types';

interface UserAccountPageProps {
  onNavigate: (path: string) => void;
  onSelectOrderForTracking?: (order: Order) => void;
}

export const UserAccountPage: React.FC<UserAccountPageProps> = ({
  onNavigate,
  onSelectOrderForTracking
}) => {
  const [activeTab, setActiveTab] = useState<
    'orders' | 'profile' | 'rewards' | 'wallet' | 'referral' | 'coupons' | 'subscriptions'
  >('orders');

  const [userProfile, setUserProfile] = useState(() => StoreService.getUserProfile());
  const [orders, setOrders] = useState<Order[]>(() => StoreService.getOrders());
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>(() => SupabaseService.getSubscriptions());
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

  // Addresses
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [newAddrLabel, setNewAddrLabel] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [newAddrName, setNewAddrName] = useState(userProfile.name);
  const [newAddrPhone, setNewAddrPhone] = useState(userProfile.phone);
  const [newAddrStreet, setNewAddrStreet] = useState('');
  const [newAddrPincode, setNewAddrPincode] = useState('560038');
  const [newAddrCity, setNewAddrCity] = useState('Bengaluru');

  // Copied alert
  const [copiedCode, setCopiedCode] = useState(false);

  // Selected Order for Modal Detail / Print Invoice
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(userProfile.referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleToggleSub = (subId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Active' ? 'Paused' : 'Active';
    const updated = SupabaseService.updateSubscriptionStatus(subId, nextStatus);
    setSubscriptions(updated);
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
      {/* Account Top Summary Card */}
      <div className="bg-[#08120B] border border-black rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0F7B3A] to-emerald-800 border-2 border-emerald-400 flex items-center justify-center font-black text-white text-2xl shadow-xl">
            {userProfile.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black">{userProfile.name}</h1>
              <span className="bg-[#0F7B3A] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1">
                <Crown className="w-3 h-3 fill-white" /> {userProfile.membershipTier} Member
              </span>
            </div>
            <div className="text-xs text-neutral-300 mt-1 flex items-center gap-3">
              <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-emerald-400" /> {userProfile.email}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-emerald-400" /> {userProfile.phone}</span>
            </div>
          </div>
        </div>

        {/* Quick Stats & Logout */}
        <div className="flex items-center gap-4 bg-white/10 border border-white/20 p-4 rounded-2xl">
          <div className="text-center px-2">
            {/* Points are summed from `reward_transactions` — the same ledger
                the app reads — falling back to the cached profile value. */}
            <div className="text-xs text-neutral-400 font-bold uppercase">Reward Points</div>
            <div className="text-lg font-black text-white">
              {loyalty?.points ?? userProfile.rewardPoints} pts
            </div>
          </div>
          <div className="h-8 w-px bg-white/20" />
          <div className="text-center px-2">
            <div className="text-xs text-neutral-400 font-bold uppercase">Wallet Balance</div>
            <div className="text-lg font-black text-emerald-400">₹{userProfile.walletBalance}</div>
          </div>
          {loyalty && (
            <>
              <div className="h-8 w-px bg-white/20" />
              <div className="text-center px-2">
                {/* Tier ladder mirrors the app's Bronze/Silver/Gold/Platinum
                    (lib/models/membership_tier.dart) so a customer sees the
                    same status in the app and on the website. */}
                <div className="text-xs text-neutral-400 font-bold uppercase">Membership</div>
                <div className="text-lg font-black text-amber-400">{loyalty.tierLabel}</div>
              </div>
            </>
          )}
          <div className="h-8 w-px bg-white/20" />
          <button
            onClick={async () => {
              await signOut();
              StoreService.setLoggedIn(false);
              onNavigate('/');
            }}
            className="text-xs text-neutral-400 hover:text-white font-bold px-2 py-1 transition cursor-pointer"
            title="Log Out"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-neutral-200 pb-2 text-xs font-bold">
        {[
          { id: 'orders', label: 'My Orders', icon: ShoppingBag },
          { id: 'subscriptions', label: 'Recurring Subscriptions', icon: Repeat },
          { id: 'rewards', label: 'Rewards & Tier', icon: Crown },
          { id: 'wallet', label: 'IGO Wallet', icon: Wallet },
          { id: 'referral', label: 'Refer & Earn', icon: Gift },
          { id: 'coupons', label: 'Coupons & Vouchers', icon: Tag },
          { id: 'profile', label: 'Profile & Addresses', icon: User }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-full transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                isActive ? 'bg-[#0F7B3A] text-white shadow-lg' : 'bg-white border border-neutral-200 text-neutral-500 hover:text-[#08120B]'
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: MY ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-[#08120B]">Order History & Live Status</h2>
            <span className="text-xs text-neutral-500">{orders.length} total orders</span>
          </div>

          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white border border-neutral-200 rounded-3xl p-6 space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-neutral-200 text-xs">
                  <div>
                    <span className="font-bold text-[#08120B] text-sm">{order.orderNumber}</span>
                    <span className="text-neutral-500 ml-3">Ordered on {order.createdAt}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full font-bold ${
                      order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      order.status === 'Out for Delivery' ? 'bg-[#08120B] text-white border border-black' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {order.status}
                    </span>
                    <button
                      onClick={() => onSelectOrderForTracking && onSelectOrderForTracking(order)}
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold px-3 py-1 rounded-full transition border border-emerald-200"
                    >
                      Track Order
                    </button>
                  </div>
                </div>

                {/* Items Summary */}
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs text-neutral-600">
                      <div className="flex items-center gap-3">
                        <img src={item.productImage} alt={item.productName} referrerPolicy="no-referrer" className="w-10 h-10 rounded-xl object-cover bg-neutral-100" />
                        <div>
                          <div className="font-bold text-[#08120B]">{item.productName}</div>
                          <div className="text-[10px] text-neutral-500">{item.weightLabel} • Qty: {item.quantity}</div>
                        </div>
                      </div>
                      <div className="font-bold text-[#08120B]">₹{item.price * item.quantity}</div>
                    </div>
                  ))}
                </div>

                {/* Footer Controls */}
                <div className="pt-4 border-t border-neutral-200 flex items-center justify-between text-xs">
                  <div className="font-bold text-[#08120B] text-sm">
                    Total Amount: <span className="text-emerald-700">₹{order.totalAmount}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedOrderForInvoice(order)}
                      className="px-3 py-1.5 rounded-xl border border-neutral-200 text-neutral-600 hover:text-[#08120B] hover:border-emerald-300 transition flex items-center gap-1"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print Invoice
                    </button>
                    {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        className="px-3 py-1.5 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: RECURRING SUBSCRIPTIONS */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-[#08120B]">Recurring Gym & Fresh Protein Subscriptions</h2>
            <button onClick={() => onNavigate('/subscriptions')} className="bg-[#0F7B3A] text-white px-4 py-2 rounded-xl text-xs font-bold">
              + Browse Subscription Plans
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {subscriptions.map((sub) => (
              <div key={sub.id} className="bg-white border border-neutral-200 rounded-3xl p-6 space-y-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      sub.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-[#08120B] text-white border border-black'
                    }`}>
                      {sub.status}
                    </span>
                    <h3 className="font-bold text-[#08120B] text-base mt-2">{sub.planTitle}</h3>
                    <p className="text-xs text-neutral-500 mt-1">{sub.itemsSummary}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-emerald-700">₹{sub.pricePerDelivery}</div>
                    <div className="text-[10px] text-neutral-500">Per {sub.frequency} delivery</div>
                  </div>
                </div>

                <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-3 text-xs space-y-1">
                  <div className="flex justify-between text-neutral-600">
                    <span>Next Scheduled Dispatch:</span>
                    <strong className="text-emerald-700 font-mono">{sub.nextDeliveryDate}</strong>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Time Slot:</span>
                    <strong className="text-[#08120B]">{sub.deliverySlot}</strong>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Deliveries Completed:</span>
                    <strong className="text-[#08120B]">{sub.deliveriesCompleted} cycles</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => handleToggleSub(sub.id, sub.status)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase transition flex items-center justify-center gap-1 ${
                      sub.status === 'Active'
                        ? 'bg-neutral-100 hover:bg-neutral-200 text-[#08120B] border border-neutral-200'
                        : 'bg-[#0F7B3A] hover:bg-emerald-500 text-white'
                    }`}
                  >
                    {sub.status === 'Active' ? <><Pause className="w-3.5 h-3.5" /> Pause Plan</> : <><Play className="w-3.5 h-3.5" /> Resume Plan</>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: REWARDS & TIER */}
      {activeTab === 'rewards' && (
        <div className="space-y-6">
          <div className="bg-[#08120B] border border-black rounded-3xl p-8 space-y-4 text-white shadow-2xl">
            <div className="flex items-center gap-2 text-white text-xs font-bold uppercase tracking-wider">
              <Crown className="w-4 h-4 fill-white" /> IGO {userProfile.membershipTier.toUpperCase()} MEMBER
            </div>
            <h2 className="text-2xl font-black text-white">Your Reward Ledger ({userProfile.rewardPoints} Points)</h2>
            <p className="text-xs text-neutral-300">Earn 10 points for every ₹100 spent. Redeem points directly at checkout for discounts.</p>
          </div>

          {/* Membership Tier Comparison & Upgrade */}
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-[#08120B] text-sm">Membership Tiers — Upgrade for Real Checkout Perks</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  tier: 'Gold' as const,
                  price: 'Free',
                  perks: ['Free delivery above ₹499', 'Standard delivery slots', '10 pts / ₹100 spent']
                },
                {
                  tier: 'Platinum' as const,
                  price: '₹199/month',
                  perks: ['FREE delivery on every order', 'Priority express slots', '15 pts / ₹100 spent']
                },
                {
                  tier: 'Elite' as const,
                  price: '₹499/month',
                  perks: ['FREE delivery on every order', 'Priority express slots', '20 pts / ₹100 spent', 'Dedicated IGO Butler Concierge']
                }
              ].map((t) => {
                const isCurrent = userProfile.membershipTier === t.tier;
                return (
                  <div
                    key={t.tier}
                    className={`rounded-2xl border p-4 space-y-3 flex flex-col justify-between ${
                      isCurrent ? 'bg-emerald-50 border-emerald-500 shadow-sm' : 'bg-neutral-50 border-neutral-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-black text-[#08120B] text-sm">{t.tier}</span>
                        {isCurrent && (
                          <span className="bg-[#0F7B3A] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">Current</span>
                        )}
                      </div>
                      <div className="text-xs font-bold text-emerald-700 mt-0.5">{t.price}</div>
                      <ul className="space-y-1.5 mt-3">
                        {t.perks.map((perk) => (
                          <li key={perk} className="flex items-start gap-1.5 text-[11px] text-neutral-600">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" /> {perk}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {!isCurrent && (
                      <button
                        onClick={() => {
                          const updated = { ...userProfile, membershipTier: t.tier };
                          setUserProfile(updated);
                          StoreService.saveUserProfile(updated);
                          showToast(`Upgraded to IGO ${t.tier}! Your new perks apply from your next cart.`);
                        }}
                        className="w-full bg-white hover:bg-[#0F7B3A] hover:text-white border border-emerald-300 text-emerald-700 font-bold py-2 rounded-xl text-[11px] uppercase tracking-wider transition cursor-pointer"
                      >
                        Switch to {t.tier}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-3xl p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-[#08120B] text-sm">Points Activity History</h3>
            <div className="space-y-2">
              {rewardHistory.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs">
                  <div>
                    <div className="font-bold text-[#08120B]">{tx.description}</div>
                    <div className="text-[10px] text-neutral-500 font-mono">{tx.date}</div>
                  </div>
                  <div className={`font-black text-sm ${tx.type === 'Earned' ? 'text-emerald-700' : 'text-[#08120B]'}`}>
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
          <div className="bg-[#08120B] border border-black rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-white shadow-2xl">
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
            <h3 className="font-bold text-[#08120B] text-sm">Wallet Statement</h3>
            <div className="space-y-2">
              {walletHistory.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs">
                  <div>
                    <div className="font-bold text-[#08120B]">{tx.description}</div>
                    <div className="text-[10px] text-neutral-500 font-mono">{tx.date}</div>
                  </div>
                  <div className={`font-black text-sm ${tx.type === 'credit' ? 'text-emerald-700' : 'text-[#08120B]'}`}>
                    {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: REFERRAL PROGRAM */}
      {activeTab === 'referral' && (
        <div className="bg-white border border-neutral-200 rounded-3xl p-8 max-w-2xl mx-auto space-y-6 text-center shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-[#0F7B3A] flex items-center justify-center mx-auto text-white shadow-xl">
            <Gift className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-[#08120B]">Give ₹150, Get ₹150 Protein Coupon</h2>
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
                <span className="font-mono font-black text-[#08120B] bg-neutral-50 border border-neutral-200 px-3 py-1 rounded-xl text-sm">
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
            <h3 className="font-bold text-[#08120B] text-base">Saved Delivery Addresses</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {userProfile.savedAddresses.map((addr) => (
                <div key={addr.id} className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs space-y-2">
                  <div className="flex items-center justify-between font-bold text-[#08120B]">
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
        </div>
      )}

      {/* Add Address Modal */}
      {showAddAddressModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 rounded-3xl max-w-md w-full p-6 text-[#08120B] space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold">Add Delivery Address</h3>
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
                    className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-[#08120B] focus:outline-none focus:border-emerald-500"
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
                    className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-[#08120B] focus:outline-none focus:border-emerald-500"
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
                  className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-[#08120B] focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-600 mb-1">Pincode</label>
                <input
                  type="text"
                  value={newAddrPincode}
                  onChange={(e) => setNewAddrPincode(e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-[#08120B] focus:outline-none focus:border-emerald-500"
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
          <div className="bg-white border border-neutral-200 rounded-3xl max-w-sm w-full p-6 text-[#08120B] space-y-4 shadow-2xl">
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
                  className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-[#08120B] focus:outline-none focus:border-emerald-500"
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
    </div>
  );
};
