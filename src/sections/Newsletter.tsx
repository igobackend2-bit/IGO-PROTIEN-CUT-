import React from 'react';
import { motion } from 'motion/react';
import { Send } from 'lucide-react';

const Newsletter = () => {
  return (
    <section className="py-24 bg-igo-green relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full" style={{ 
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px' 
        }} />
      </div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-12 lg:p-20 rounded-[50px] text-center max-w-4xl mx-auto">
          <span className="text-igo-gold font-bold text-sm uppercase tracking-widest mb-6 block">Stay Connected</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-8">
            Get Farm-Fresh Insights <br />
            <span className="text-igo-gold">Delivered To Your Inbox.</span>
          </h2>
          <p className="text-white/70 text-lg mb-12 max-w-lg mx-auto leading-relaxed">
            Join our mailing list to receive exclusive offers, traceability updates, 
            and seasonal cut alerts once a week.
          </p>
          
          <form className="max-w-md mx-auto relative group">
            <input 
              type="email" 
              placeholder="Enter your email address"
              className="w-full bg-white text-neutral-dark px-10 py-5 rounded-2xl font-medium focus:ring-4 focus:ring-white/20 outline-none placeholder:text-neutral-400"
            />
            <button 
              type="submit"
              className="absolute right-2 top-2 bottom-2 bg-igo-green text-white px-8 rounded-xl font-bold flex items-center gap-2 hover:bg-neutral-dark transition-all"
            >
              <span className="hidden sm:inline">Subscribe</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
          
          <p className="mt-8 text-white/40 text-xs font-medium uppercase tracking-[0.2em]">
            No spam. No fluff. Just pure excellence.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
