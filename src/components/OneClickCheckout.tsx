import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Fingerprint, CheckCircle2, X, Zap, Smartphone, CreditCard, ChevronRight } from 'lucide-react';

import { useCart } from '../context/CartContext';

interface OneClickCheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
}

const OneClickCheckout: React.FC<OneClickCheckoutProps> = ({ isOpen, onClose, total }) => {
  const [step, setStep] = useState<'auth' | 'processing' | 'success'>('auth');
  const { clearCart } = useCart();

  useEffect(() => {
    if (!isOpen) {
      setStep('auth');
    }
  }, [isOpen]);

  const handleAuth = () => {
    setStep('processing');
    setTimeout(() => {
      setStep('success');
      clearCart();
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-neutral-dark/80 backdrop-blur-md z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] md:w-[400px] glass-dark rounded-[3rem] p-8 z-[110] shadow-2xl border border-white/10"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 text-white/30 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {step === 'auth' && (
              <motion.div 
                key="auth"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-igo-gold/20 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                  <Fingerprint className="w-10 h-10 text-igo-gold" />
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 border-2 border-igo-gold rounded-full"
                  />
                </div>
                <h3 className="text-2xl font-display font-bold text-white mb-2">Fast Lane Pay</h3>
                <p className="text-neutral-400 text-sm mb-8">Confirm your order of <span className="text-igo-gold font-bold">₹{total}</span> using Biometric Auth</p>
                
                <div className="bg-white/5 rounded-2xl p-4 mb-8 text-left space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-500">Delivery To:</span>
                    <span className="text-white font-medium flex items-center gap-1">
                      <Smartphone className="w-3 h-3 text-igo-gold" />
                      Home (Default)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-500">Payment:</span>
                    <span className="text-white font-medium flex items-center gap-1">
                      <CreditCard className="w-3 h-3 text-igo-gold" />
                      •••• 8821
                    </span>
                  </div>
                </div>

                <button 
                  onClick={handleAuth}
                  className="w-full bg-igo-gold text-neutral-dark py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-igo-gold/20"
                >
                  Pay with One-Click
                  <Zap className="w-4 h-4 fill-neutral-dark" />
                </button>
                <p className="mt-4 text-[10px] text-neutral-500 uppercase tracking-widest font-bold">
                  Powered by IGO Secure Pay
                </p>
              </motion.div>
            )}

            {step === 'processing' && (
              <motion.div 
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-10"
              >
                <div className="relative w-20 h-20 mx-auto mb-8">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="absolute inset-0 border-4 border-igo-gold/20 border-t-igo-gold rounded-full"
                  />
                  <Zap className="absolute inset-0 m-auto w-8 h-8 text-igo-gold animate-pulse" />
                </div>
                <h3 className="text-xl font-display font-bold text-white mb-2">Processing...</h3>
                <p className="text-neutral-400 text-sm">Securing your fresh cuts from the farm.</p>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-igo-green rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-display font-bold text-white mb-2">Order Confirmed!</h3>
                <p className="text-neutral-400 text-sm mb-8">Batch <span className="text-igo-green font-bold">#IGO-7729V</span> is now being packed.</p>
                
                <div className="bg-igo-green/10 border border-igo-green/20 rounded-2xl p-6 mb-8">
                  <p className="text-igo-green text-xs font-bold uppercase tracking-widest mb-1">Estimated Arrival</p>
                  <p className="text-2xl font-display font-bold text-white">22 Minutes</p>
                </div>

                <button 
                  onClick={() => {
                    onClose();
                    // Dispatch a custom event for other components to listen to
                    window.dispatchEvent(new CustomEvent('trackOrder', { detail: 'IGO-7729V' }));
                  }}
                  className="w-full bg-white text-neutral-dark py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-neutral-100 transition-all"
                >
                  Track My Order
                  <ChevronRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default OneClickCheckout;
