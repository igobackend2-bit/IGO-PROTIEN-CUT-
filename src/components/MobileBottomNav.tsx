import React from 'react';
import { motion } from 'motion/react';
import { Home, ShoppingBag, Search, User, Crown, Mic } from 'lucide-react';

import { useCart } from '../context/CartContext';

const MobileBottomNav = () => {
  const { cartCount, setIsCartOpen, wishlist } = useCart();

  const tabs = [
    { icon: Home, label: 'Home', href: '#' },
    { icon: Mic, label: 'Voice', action: () => window.dispatchEvent(new CustomEvent('startVoiceSearch')) },
    { icon: Search, label: 'Search', href: '#products' },
    { icon: ShoppingBag, label: 'Cart', action: () => setIsCartOpen(true), badge: cartCount },
    { icon: User, label: 'Account', action: () => window.dispatchEvent(new CustomEvent('openProfile')) },
  ];


  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-100 z-50 md:hidden safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map(({ icon: Icon, label, href, action, badge }) => (
          <motion.button
            key={label}
            whileTap={{ scale: 0.9 }}
            onClick={action || (href ? () => { window.location.hash = href.replace('#', ''); } : undefined)}
            className="flex flex-col items-center gap-1 py-1 px-3 relative group"
          >
            <div className="relative">
              <Icon className="w-6 h-6 text-neutral-400 group-hover:text-igo-green transition-colors" />
              {badge !== undefined && badge > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  key={badge}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-igo-green text-white text-[9px] flex items-center justify-center rounded-full font-bold"
                >
                  {badge > 9 ? '9+' : badge}
                </motion.span>
              )}
            </div>
            <span className="text-[10px] text-neutral-400 group-hover:text-igo-green transition-colors font-medium">{label}</span>
          </motion.button>
        ))}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
