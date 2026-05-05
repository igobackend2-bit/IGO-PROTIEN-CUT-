import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Package, Settings, LogOut, MapPin, CreditCard, ChevronRight, Crown, Bell, ArrowLeft, CheckCircle2, Clock } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
  const [user, setUser] = React.useState<any>(null);
  const [activeView, setActiveView] = React.useState<'main' | 'orders' | 'addresses' | 'payments' | 'settings'>('main');

  useEffect(() => {
    const savedUser = localStorage.getItem('igo_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error(e);
      }
    }
  }, [isOpen]);

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
    { id: 'orders', icon: Package, label: 'Order History', value: '3 Orders' },
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
      <div className="p-4 flex flex-col gap-2 overflow-y-auto flex-1 custom-scrollbar">
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

  const renderOrdersView = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-6 h-full flex flex-col"
    >
      <button onClick={() => setActiveView('main')} className="flex items-center gap-2 text-white/50 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-bold">Back to Profile</span>
      </button>
      
      <h3 className="text-xl font-display font-bold text-white mb-6">Recent Orders</h3>
      
      <div className="space-y-4 overflow-y-auto flex-1 custom-scrollbar pr-2">
        {[
          { id: '#IGO-8821', date: 'Today, 2:30 PM', status: 'Delivered', items: 'Chicken Breast, Mutton Chops', total: '₹842' },
          { id: '#IGO-8712', date: '24 May, 2026', status: 'Delivered', items: 'Tiger Prawns, Vanjaram', total: '₹1,240' },
          { id: '#IGO-8645', date: '18 May, 2026', status: 'Delivered', items: 'Farm Eggs (12pcs)', total: '₹120' },
        ].map(order => (
          <div key={order.id} className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-[10px] font-bold text-igo-green uppercase">{order.id}</p>
                <p className="text-xs text-white/40">{order.date}</p>
              </div>
              <span className="px-2 py-1 bg-igo-green/20 text-igo-green text-[10px] font-bold rounded-lg uppercase">
                {order.status}
              </span>
            </div>
            <p className="text-sm text-white font-medium mb-2">{order.items}</p>
            <div className="flex justify-between items-center border-t border-white/5 pt-2">
              <span className="text-xs text-white/40">Total Amount</span>
              <span className="text-sm font-bold text-white">{order.total}</span>
            </div>
          </div>
        ))}
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
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md h-[600px] max-h-[90vh] bg-neutral-dark rounded-[2rem] overflow-hidden shadow-2xl z-[100] flex flex-col"
          >
            {/* Thematic Background */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1607116176195-b81b1f41f536?w=600')] bg-cover bg-center opacity-10 mix-blend-luminosity pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-dark via-neutral-dark/95 to-neutral-dark/80 pointer-events-none" />
            
            <div className="relative z-10 flex flex-col h-full">
              {/* Header */}
              <div className="flex justify-between items-start p-6 border-b border-white/10 shrink-0 bg-neutral-dark/80 backdrop-blur-md">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-igo-green flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-igo-green/20 border-2 border-white/20 uppercase">
                    {user?.name ? getInitials(user.name) : 'PC'}
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

              {/* Main Viewport */}
              <div className="flex-1 overflow-hidden">
                <AnimatePresence mode="wait">
                  {activeView === 'main' && renderMainView()}
                  {activeView === 'orders' && renderOrdersView()}
                  {activeView === 'addresses' && renderAddressesView()}
                  {activeView === 'payments' && (
                     <div className="p-8 text-center text-white/40 font-bold italic mt-20">Payment details encrypted & secure.</div>
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
