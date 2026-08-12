import React, { useState, useEffect } from 'react';
import { Home, Search, ShoppingBag, User, Mic } from 'lucide-react';
import { StoreService } from '../lib/storage';

interface MobileTabBarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenVoiceSearch: () => void;
}

// Fixed bottom tab bar on mobile — standard pattern across Blinkit, Zepto,
// and Swiggy Instamart. Desktop keeps the full header nav; this is mobile-only.
export const MobileTabBar: React.FC<MobileTabBarProps> = ({ currentPath, onNavigate, onOpenVoiceSearch }) => {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      const cart = StoreService.getCart();
      setCartCount(cart.reduce((acc, item) => acc + item.quantity, 0));
    };
    updateCount();
    window.addEventListener('protein_cuts_cart_updated', updateCount);
    return () => window.removeEventListener('protein_cuts_cart_updated', updateCount);
  }, []);

  const tabs = [
    { id: 'home', label: 'Home', path: '/', icon: Home },
    { id: 'search', label: 'Search', path: '/search', icon: Search },
    { id: 'voice', label: 'Voice', action: onOpenVoiceSearch, icon: Mic },
    { id: 'cart', label: 'Cart', path: '/cart', icon: ShoppingBag, badge: cartCount },
    { id: 'account', label: 'Account', path: '/account', icon: User }
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-neutral-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] flex items-center justify-around px-1 py-1.5">
      {tabs.map((tab) => {
        const isActive = tab.path ? currentPath === tab.path : false;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => (tab.action ? tab.action() : onNavigate(tab.path!))}
            className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition cursor-pointer ${
              isActive ? 'text-emerald-600' : 'text-neutral-400 hover:text-[#0A1F12]'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-wide">{tab.label}</span>
            {!!tab.badge && (
              <span className="absolute top-0 right-1 w-3.5 h-3.5 rounded-full bg-[#0F7B3A] text-white text-[8px] font-bold flex items-center justify-center">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
