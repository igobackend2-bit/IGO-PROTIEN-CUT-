import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ShoppingBag, Menu, X, User, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { useCart } from '../context/CartContext';

const BrandLogo = ({ light = false }) => (
  <div className="flex items-center gap-3 group">
    <div className={cn(
      "relative w-12 h-12 rounded-full flex items-center justify-center border-[1.5px] transition-transform group-hover:rotate-[360deg] duration-1000",
      light ? "border-white/20" : "border-igo-green/20"
    )}>
      {/* Small spinning ring text could go here with SVG, but for simplicity let's use a solid design */}
      <div className={cn(
        "w-9 h-9 rounded-full flex items-center justify-center font-display font-extrabold text-sm",
        light ? "bg-white text-neutral-dark" : "bg-igo-green text-white"
      )}>
        IGO
      </div>
      <div className="absolute -inset-1 border border-igo-gold/30 rounded-full animate-pulse" />
    </div>
    <div className="flex flex-col">
      <span className={cn("font-display font-bold text-lg tracking-tight leading-none", light ? "text-white" : "text-neutral-dark")}>
        PROTEIN <span className="text-igo-green">CUTS</span>
      </span>
      <span className={cn("text-[8px] font-bold uppercase tracking-[0.2em] mt-1", light ? "text-white/40" : "text-neutral-400")}>
        Unit of IGO Group
      </span>
    </div>
  </div>
);

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cartCount } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Products', href: '#products' },
    { name: 'Traceability', href: '#traceability' },
    { name: 'About', href: '#about' },
    { name: 'B2B', href: '#b2b' },
    { name: 'Insights', href: '#blog' },
  ];

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300 border-b',
        isScrolled 
          ? 'bg-white/80 backdrop-blur-md py-3 border-neutral-200' 
          : 'bg-transparent py-5 border-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <BrandLogo />

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-neutral-600 hover:text-igo-green transition-colors"
            >
              {link.name}
            </a>
          ))}
          <div className="h-4 w-px bg-neutral-200 mx-2" />
          <div className="flex items-center gap-5 text-neutral-600">
            <button className="hover:text-igo-green transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button className="hover:text-igo-green transition-colors">
              <User className="w-5 h-5" />
            </button>
            <button className="hover:text-igo-green transition-colors relative group">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  key={cartCount}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-igo-gold text-white text-[10px] flex items-center justify-center rounded-full font-bold"
                >
                  {cartCount}
                </motion.span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-neutral-dark"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-white border-b border-neutral-200 p-6 md:hidden shadow-xl"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-lg font-medium text-neutral-dark hover:text-igo-green"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <hr className="border-neutral-100" />
              <div className="flex justify-between items-center py-2">
                <div className="flex gap-4 items-center">
                  <User className="w-6 h-6 text-neutral-600" />
                  <div className="relative">
                    <ShoppingBag className="w-6 h-6 text-neutral-600" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-igo-gold text-white text-[10px] flex items-center justify-center rounded-full font-bold">
                        {cartCount}
                      </span>
                    )}
                  </div>
                </div>
                <button className="bg-igo-green text-white px-4 py-2 rounded-lg text-sm font-medium">
                  Login / Signup
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
