import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Package, Settings, LogOut, MapPin, CreditCard, ChevronRight, Crown, Bell, ArrowLeft, CheckCircle2, Clock, MessageSquare, Inbox } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
  const [user, setUser] = React.useState<any>(null);
  const [activeView, setActiveView] = React.useState<'main' | 'orders' | 'addresses' | 'payments' | 'settings' | 'inbox' | 'help'>('main');
  const [orders, setOrders] = React.useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = React.useState(false);
  const [inboxMessages, setInboxMessages] = React.useState<any[]>([]);
  const [queries, setQueries] = React.useState<any[]>([]);


  useEffect(() => {
    const savedUser = localStorage.getItem('igo_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        if (isOpen) fetchUserOrders(parsedUser.email);
      } catch (e) {
        console.error(e);
      }
    }
  }, [isOpen]);

  const fetchUserOrders = async (email: string) => {
    setIsLoadingOrders(true);
    try {
      const { getOrders } = await import('../services/orderService');
      const data = await getOrders(email);
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch user orders:', err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const fetchInboxAndQueries = async (email: string) => {
    try {
      const { getInboxMessages, getCustomerQueries, markMessageAsRead } = await import('../services/queryService');
      const [messages, userQueries] = await Promise.all([
        getInboxMessages(email),
        getCustomerQueries(email)
      ]);
      setInboxMessages(messages);
      setQueries(userQueries);

      // Auto-mark unread messages as read when opening inbox
      const unread = messages.filter(m => !m.is_read);
      unread.forEach(m => markMessageAsRead(m.id));
    } catch (err) {
      console.error('Failed to fetch inbox/queries:', err);
    }
  };

  useEffect(() => {
    if (user?.email && (activeView === 'inbox' || activeView === 'help')) {
      fetchInboxAndQueries(user.email);
    }
  }, [activeView, user]);


  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleLogout = () => {
    localStorage.removeItem('igo_user');
    window.location.reload(); // Refresh to clear all app state
  };

  const copyReferral = () => {
    navigator.clipboard.writeText('FRESH-IGO-100');
    alert('Referral code copied to clipboard!');
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setActiveView('main');
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const menuItems = [
    { id: 'orders', icon: Package, label: 'Order History', value: orders.length > 0 ? `${orders.length} Orders` : 'No orders yet' },
    { id: 'inbox', icon: Inbox, label: 'Inbox & Notifications', value: inboxMessages.filter(m => !m.is_read).length > 0 ? `${inboxMessages.filter(m => !m.is_read).length} Unread` : null },
    { id: 'help', icon: MessageSquare, label: 'Help & Support', value: 'Contact Admin' },
    { id: 'addresses', icon: MapPin, label: 'Saved Addresses', value: 'Coimbatore, TN' },
    { id: 'payments', icon: CreditCard, label: 'Payment Methods', value: 'Saved Cards' },
    { id: 'settings', icon: Settings, label: 'Account Settings', value: null },
  ];


  const renderMainView = () => (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex flex-col h-full"
    >
    <div className="p-4 flex flex-col gap-2 flex-1">

        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button 
              key={item.id}
              onClick={() => setActiveView(item.id as any)}
              className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-igo-green/20 group-hover:text-igo-green text-white/70 transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-white">{item.label}</h4>
                  {item.value && <p className="text-xs text-white/50 mt-0.5">{item.value}</p>}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-igo-green group-hover:translate-x-1 transition-all" />
            </button>
          );
        })}
      </div>

      <div className="p-6 bg-white/5 border-t border-white/10 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-igo-gold/20 rounded-lg text-igo-gold">
              <Crown className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">IGO Rewards</span>
          </div>
          <span className="text-sm font-bold text-igo-gold">250 pts</span>
        </div>
        
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-white/40 uppercase mb-1">Referral Code</p>
            <p className="text-sm font-mono font-bold text-white">FRESH-IGO-100</p>
          </div>
          <button 
            onClick={copyReferral}
            className="text-[10px] font-bold text-igo-green uppercase hover:underline"
          >
            Copy Code
          </button>
        </div>
      </div>

      <div className="p-6 pt-2 shrink-0">
        <button 
          onClick={handleLogout}
          className="w-full py-4 rounded-xl bg-red-500/10 text-red-400 font-bold flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </motion.div>
  );

  const [selectedOrder, setSelectedOrder] = React.useState<any>(null);

  const renderOrdersView = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-6 h-full flex flex-col"
    >
      <button onClick={() => selectedOrder ? setSelectedOrder(null) : setActiveView('main')} className="flex items-center gap-2 text-white/50 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-bold">{selectedOrder ? 'Back to History' : 'Back to Profile'}</span>
      </button>
      
      <h3 className="text-xl font-display font-bold text-white mb-6">
        {selectedOrder ? `Order #${selectedOrder.id.slice(0, 8)}` : 'Order History'}
      </h3>
      
      <div className="space-y-4 flex-1 pr-2 min-h-[200px]">
        {isLoadingOrders ? (
          <div className="py-20 text-center text-white/30 italic">Loading your fresh history...</div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center text-white/30 italic">No orders found yet. Start shopping!</div>
        ) : selectedOrder ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Status Timeline */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="flex justify-between items-center mb-6">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                  selectedOrder.status === 'Delivered' ? 'bg-green-500/20 text-green-400' : 'bg-igo-gold/20 text-igo-gold'
                }`}>
                  {selectedOrder.status}
                </span>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                  {new Date(selectedOrder.created_at).toLocaleDateString()}
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-igo-green/20 flex items-center justify-center border border-igo-green/30">
                    <CheckCircle2 className="w-3 h-3 text-igo-green" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Order Placed</p>
                    <p className="text-[10px] text-white/40">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                  </div>
                </div>
                {selectedOrder.status === 'Delivered' && (
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-igo-green flex items-center justify-center shadow-lg shadow-igo-green/20">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Delivered Successfully</p>
                      <p className="text-[10px] text-white/40">{selectedOrder.delivered_at ? new Date(selectedOrder.delivered_at).toLocaleString() : 'Just now'}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Details */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Shipping Intelligence</h4>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex items-start gap-3">
                <MapPin className="w-4 h-4 text-igo-gold mt-1" />
                <div>
                  <p className="text-[10px] text-white/40 font-bold uppercase mb-1">Delivered To</p>
                  <p className="text-sm text-white/80 leading-relaxed font-medium">
                    {selectedOrder.delivery_address || 'Default Address'}
                  </p>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Package Contents</h4>
              <div className="bg-white/5 rounded-2xl overflow-hidden border border-white/5">
                {selectedOrder.items?.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-4 border-b border-white/5 last:border-0">
                    <div>
                      <p className="text-sm font-bold text-white">{item.name}</p>
                      <p className="text-[10px] text-white/40">{item.weight} × {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-white">₹{item.price * item.quantity}</p>
                  </div>
                ))}
                <div className="bg-white/10 p-4 flex justify-between items-center">
                  <span className="text-xs font-bold text-white/50">Total Paid</span>
                  <span className="text-lg font-display font-bold text-igo-green">₹{selectedOrder.amount}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          orders.map(order => (
            <button 
              key={order.id} 
              onClick={() => setSelectedOrder(order)}
              className="w-full text-left bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-colors group"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-[10px] font-bold text-igo-green uppercase">#{order.id.slice(0, 8)}</p>
                  <p className="text-xs text-white/40">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                    order.status === 'Delivered' ? 'bg-green-500/20 text-green-400' :
                    order.status === 'Processing' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-orange-500/20 text-orange-400'
                  }`}>
                    {order.status}
                  </span>
                  <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-igo-green group-hover:translate-x-1 transition-all" />
                </div>
              </div>
              <p className="text-sm text-white font-medium mb-2 truncate">
                {order.items?.map((i: any) => i.name).join(', ') || 'Fresh Cuts'}
              </p>
              <div className="flex justify-between items-center border-t border-white/5 pt-2">
                <span className="text-xs text-white/40">Total Amount</span>
                <span className="text-sm font-bold text-white">₹{order.amount}</span>
              </div>
            </button>
          ))
        )}
      </div>
    </motion.div>
  );


  const renderAddressesView = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-6 h-full flex flex-col"
    >
      <button onClick={() => setActiveView('main')} className="flex items-center gap-2 text-white/50 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-bold">Back to Profile</span>
      </button>
      
      <h3 className="text-xl font-display font-bold text-white mb-6">Saved Addresses</h3>
      
      <div className="space-y-4">
        <div className="bg-igo-green/10 border-2 border-igo-green/30 rounded-2xl p-4 relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-igo-green rounded-lg text-white">
              <MapPin className="w-4 h-4" />
            </div>
            <span className="font-bold text-white text-sm">Home</span>
            <span className="text-[10px] bg-igo-green text-white px-2 py-0.5 rounded-full font-bold uppercase ml-auto">Default</span>
          </div>
          <p className="text-xs text-white/70 leading-relaxed">
            123 Fresh Lane, Ramanathapuram,<br/>
            Coimbatore, Tamil Nadu - 641045
          </p>
        </div>

        <button className="w-full border-2 border-dashed border-white/10 rounded-2xl p-4 text-white/40 font-bold text-sm hover:border-igo-green hover:text-igo-green transition-all flex items-center justify-center gap-2">
          <ArrowLeft className="w-4 h-4 rotate-90" />
          Add New Address
        </button>
      </div>
    </motion.div>
  );

  const renderInboxView = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-6 h-full flex flex-col"
    >
      <button onClick={() => setActiveView('main')} className="flex items-center gap-2 text-white/50 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-bold">Back to Profile</span>
      </button>
      
      <h3 className="text-xl font-display font-bold text-white mb-6">Inbox</h3>
      
      <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
        {inboxMessages.length === 0 ? (
          <div className="py-20 text-center text-white/30 italic">No messages yet.</div>
        ) : (
          inboxMessages.map(msg => (
            <div key={msg.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 relative">
              {!msg.is_read && <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-igo-green animate-pulse" />}
              <h4 className="font-bold text-white text-sm mb-1 pr-4">{msg.title}</h4>
              <p className="text-xs text-white/60 mb-2 whitespace-pre-wrap">{msg.message}</p>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{new Date(msg.created_at).toLocaleString()}</p>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );

  const [querySubject, setQuerySubject] = React.useState('');
  const [queryMessage, setQueryMessage] = React.useState('');
  const [isSubmittingQuery, setIsSubmittingQuery] = React.useState(false);

  const submitQuery = async () => {
    if (!querySubject || !queryMessage || !user?.email) return;
    setIsSubmittingQuery(true);
    try {
      const { createQuery } = await import('../services/queryService');
      await createQuery(user.email, querySubject, queryMessage);
      setQuerySubject('');
      setQueryMessage('');
      fetchInboxAndQueries(user.email);
    } catch (err) {
      console.error('Failed to submit query', err);
    } finally {
      setIsSubmittingQuery(false);
    }
  };

  const renderHelpView = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-6 h-full flex flex-col"
    >
      <button onClick={() => setActiveView('main')} className="flex items-center gap-2 text-white/50 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-bold">Back to Profile</span>
      </button>
      
      <h3 className="text-xl font-display font-bold text-white mb-6">Help &amp; Support</h3>
      
      <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <h4 className="font-bold text-white text-sm mb-4">Send us a message</h4>
          <input
            type="text"
            placeholder="Subject"
            value={querySubject}
            onChange={(e) => setQuerySubject(e.target.value)}
            className="w-full bg-neutral-dark border border-white/10 rounded-lg p-3 text-sm text-white focus:border-igo-green focus:outline-none transition-colors mb-3"
          />
          <textarea
            placeholder="How can we help you?"
            value={queryMessage}
            onChange={(e) => setQueryMessage(e.target.value)}
            rows={4}
            className="w-full bg-neutral-dark border border-white/10 rounded-lg p-3 text-sm text-white focus:border-igo-green focus:outline-none transition-colors mb-3 resize-none custom-scrollbar"
          />
          <button 
            onClick={submitQuery}
            disabled={isSubmittingQuery || !querySubject || !queryMessage}
            className="w-full py-3 bg-igo-green text-white font-bold rounded-lg disabled:opacity-50 transition-colors"
          >
            {isSubmittingQuery ? 'Sending...' : 'Send Message'}
          </button>
        </div>

        {queries.length > 0 && (
          <div>
            <h4 className="font-bold text-white text-sm mb-4 border-b border-white/10 pb-2">Previous Queries</h4>
            <div className="space-y-3">
              {queries.map(q => (
                <div key={q.id} className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-white text-sm">{q.subject}</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${q.status === 'resolved' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                      {q.status}
                    </span>
                  </div>
                  <p className="text-xs text-white/60 mb-2 truncate">{q.message}</p>
                  <p className="text-[10px] text-white/30 uppercase">{new Date(q.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md h-auto max-h-[85vh] bg-neutral-dark rounded-[2rem] overflow-hidden shadow-2xl z-[100] flex flex-col"
          >
            {/* Thematic Background */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1607116176195-b81b1f41f536?w=600')] bg-cover bg-center opacity-10 mix-blend-luminosity pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-dark via-neutral-dark/95 to-neutral-dark/80 pointer-events-none" />
            
            <div className="relative z-10 flex flex-col h-full max-h-[85vh]">
              {/* Header - Sticky */}
              <div className="flex justify-between items-start p-6 border-b border-white/10 shrink-0 bg-neutral-dark/80 backdrop-blur-md z-20">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-igo-green flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-igo-green/20 border-4 border-white/20 uppercase overflow-hidden">
                    {user?.avatar_url ? (
                      <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      user?.name ? getInitials(user.name) : 'PC'
                    )}
                  </div>

                  <div>
                    <h2 className="text-xl font-display font-bold text-white">{user?.name || 'Protein Cuts User'}</h2>
                    <p className="text-sm text-igo-gold font-bold flex items-center gap-1 mt-1">
                      <span className="w-2 h-2 rounded-full bg-igo-gold animate-pulse" />
                      IGO Prime Member
                    </p>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 text-white transition-colors border border-white/10 shadow-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Main Viewport - Scrollable */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-1">

                <AnimatePresence mode="wait">
                  {activeView === 'main' && renderMainView()}
                  {activeView === 'orders' && renderOrdersView()}
                  {activeView === 'inbox' && renderInboxView()}
                  {activeView === 'help' && renderHelpView()}
                  {activeView === 'addresses' && renderAddressesView()}
                  {activeView === 'payments' && (
                     <div className="p-8 text-center text-white/40 font-bold italic mt-20">Payment details encrypted &amp; secure.</div>
                  )}
                  {activeView === 'settings' && (
                     <div className="p-8 text-center text-white/40 font-bold italic mt-20">Account settings coming soon in production.</div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProfileModal;
