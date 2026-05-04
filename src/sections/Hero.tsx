import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight, ShieldCheck, Truck } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-white">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-neutral-light -skew-x-12 translate-x-1/4 hidden lg:block" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-igo-green/5 rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full grid lg:grid-cols-2 gap-12 items-center py-20">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 mb-6"
          >
            <span className="h-px w-8 bg-igo-gold" />
            <span className="text-igo-gold font-bold text-xs uppercase tracking-[0.2em]">
              Established Excellence
            </span>
          </motion.div>
          
          <h1 className="text-5xl md:text-8xl font-display font-extrabold text-neutral-dark leading-[1] mb-6 tracking-tighter">
            Farm-Fresh <br />
            <span className="text-igo-green">Proteins, Traced</span> <br />
            Every Step.
          </h1>
          
          <p className="text-neutral-500 text-lg md:text-xl max-w-lg mb-10 leading-relaxed font-medium">
            Never Frozen. Always Fresh. <span className="text-igo-gold">Always Traced.</span> <br />
            Same-day delivery from heritage Tamil farms to your table with 100% cold-chain integrity.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <button className="group bg-igo-green text-white px-10 py-5 rounded-2xl font-bold flex items-center gap-2 hover:bg-igo-green/90 transition-all shadow-xl shadow-igo-green/20 active:scale-95">
              Shop Fresh Now
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="bg-white text-neutral-dark border-2 border-neutral-100 px-10 py-5 rounded-2xl font-bold hover:border-igo-gold hover:text-igo-gold transition-all active:scale-95">
              B2B Bulk Orders
            </button>
          </div>

          <div className="mt-12 flex flex-wrap gap-8 items-center pt-8 border-t border-neutral-100">
            <div className="flex items-center gap-3 text-sm font-medium text-neutral-600">
              <ShieldCheck className="text-igo-green w-5 h-5" />
              100% Certified
            </div>
            <div className="flex items-center gap-3 text-sm font-medium text-neutral-600">
              <Truck className="text-igo-green w-5 h-5" />
              Cold-Chain Delivery
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative"
        >
          <div className="relative rounded-3xl overflow-hidden shadow-2xl z-20 group">
            <div className="absolute inset-0 bg-igo-green/5 mix-blend-multiply pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-full border-[1px] border-white/20 z-30 pointer-events-none" style={{ backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(0deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            <img 
              src="https://images.unsplash.com/photo-1607623814075-e512199b4472?auto=format&fit=crop&q=80&w=1200" 
              alt="Premium Raw Meat Cuts" 
              className="w-full h-full object-cover aspect-[4/3] group-hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            {/* Live Trace Badge Overlay */}
            <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-xl border border-white/50 shadow-xl z-40">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-igo-green font-bold uppercase tracking-widest leading-none mb-1">Live Trace Data</p>
                  <p className="text-sm font-display font-bold text-neutral-dark">Batch #IGO-7729V | Origin: Tiruppur</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-igo-green animate-pulse" />
                  <span className="text-[10px] font-bold text-igo-green uppercase">Fresh</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Floating Badge */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-8 -left-8 bg-white p-6 rounded-2xl shadow-xl z-30 max-w-[200px]"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-igo-green/10 rounded-lg">
                <ShieldCheck className="text-igo-green w-6 h-6" />
              </div>
              <span className="font-bold text-xs uppercase tracking-wider text-neutral-400">Verified Batch</span>
            </div>
            <div className="font-display font-bold text-lg text-neutral-dark">Batch #IGO-9421</div>
            <div className="text-[10px] text-neutral-400 mt-1">Traced to: High Meadows Farm</div>
          </motion.div>

          {/* Decorative Elements */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-igo-gold/10 rounded-full blur-2xl z-10" />
          <div className="absolute -bottom-20 -right-20 w-64 h-64 border-[1px] border-igo-green/10 rounded-full z-10" />
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
