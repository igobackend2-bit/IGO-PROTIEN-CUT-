import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, CheckCircle2, Loader2 } from 'lucide-react';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setStatus('loading');
    await new Promise(res => setTimeout(res, 1200));
    setStatus('success');
    setEmail('');
    setTimeout(() => setStatus('idle'), 5000);
  };

  return (
    <section className="py-16 sm:py-24 bg-igo-green relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-6 sm:p-10 lg:p-16 rounded-[2rem] sm:rounded-[40px] text-center max-w-4xl mx-auto">
          <span className="text-igo-gold font-bold text-sm uppercase tracking-widest mb-4 block">Stay Connected</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white mb-6">
            Get Farm-Fresh Insights <br />
            <span className="text-igo-gold">Delivered To Your Inbox.</span>
          </h2>
          <p className="text-white/70 text-base md:text-lg mb-10 max-w-lg mx-auto leading-relaxed">
            Join our mailing list for exclusive offers, traceability updates, and seasonal cut alerts once a week.
          </p>
          <AnimatePresence mode="wait">
            {status === 'success' ? (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-igo-gold" />
                </div>
                <p className="text-white font-bold text-lg">You are on the list!</p>
                <p className="text-white/60 text-sm">Welcome to the IGO family. Freshness incoming.</p>
              </motion.div>
            ) : (
              <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleSubmit} className="max-w-md mx-auto flex gap-2 flex-col sm:flex-row">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="flex-1 bg-white text-neutral-dark px-5 py-4 rounded-2xl font-medium focus:ring-4 focus:ring-white/20 outline-none placeholder:text-neutral-400 text-sm"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="bg-neutral-dark text-white px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-igo-gold hover:text-neutral-dark transition-all disabled:opacity-60 text-sm whitespace-nowrap"
                >
                  {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Subscribe</>}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
          <p className="mt-6 text-white/40 text-xs font-medium uppercase tracking-[0.2em]">No spam. Unsubscribe anytime.</p>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
