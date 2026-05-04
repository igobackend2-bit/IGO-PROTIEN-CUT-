import React from 'react';
import { motion } from 'motion/react';
import { User, Building2, ChevronRight, Briefcase, ShoppingCart } from 'lucide-react';

const DualCTA = () => {
  return (
    <section id="b2b" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-8">
          {/* For Consumers */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="group relative bg-igo-green text-white p-12 lg:p-16 rounded-[40px] overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-8">
                  <User className="w-8 h-8" />
                </div>
                <h3 className="text-3xl lg:text-4xl font-display font-bold mb-6">For Home Cooks <br />& Families</h3>
                <ul className="space-y-4 mb-12">
                  {['Same-day delivery from farm', 'Money-back freshness guarantee', 'Subscription early access'].map(feat => (
                    <li key={feat} className="flex items-center gap-3 text-white/80">
                      <div className="w-1.5 h-1.5 rounded-full bg-igo-gold" />
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
              
              <button className="bg-white text-igo-green px-8 py-4 rounded-xl font-bold flex items-center gap-3 w-fit group-hover:bg-igo-gold group-hover:text-white transition-all shadow-lg active:scale-95">
                Shop Fresh Now
                <ShoppingCart className="w-5 h-5" />
              </button>
            </div>
          </motion.div>

          {/* For Businesses */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="group relative bg-neutral-dark text-white p-12 lg:p-16 rounded-[40px] overflow-hidden border-2 border-transparent hover:border-igo-gold/30 transition-all"
          >
            <div className="absolute -bottom-10 -right-10 w-80 h-80 bg-igo-gold/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="w-16 h-16 bg-igo-gold/10 rounded-2xl flex items-center justify-center mb-8 text-igo-gold">
                  <Building2 className="w-8 h-8" />
                </div>
                <h3 className="text-3xl lg:text-4xl font-display font-bold mb-6 text-white">For Restaurants <br />& Businesses</h3>
                <ul className="space-y-4 mb-12">
                  {['Bulk pricing & supply chains', 'Custom labeling & branding', 'Traceability API integration'].map(feat => (
                    <li key={feat} className="flex items-center gap-3 text-white/60">
                      <div className="w-1.5 h-1.5 rounded-full bg-igo-gold opacity-50" />
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
              
              <button className="bg-igo-gold text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 w-fit hover:bg-igo-gold/80 transition-all shadow-lg shadow-igo-gold/20 active:scale-95">
                Request Quote
                <Briefcase className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default DualCTA;
