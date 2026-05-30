import React from 'react';
import { motion } from 'motion/react';
import { User, Building2, Briefcase, ShoppingCart } from 'lucide-react';

const DualCTA = () => {
  return (
    <section id="b2b" className="py-16 sm:py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8">

          {/* For Consumers */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="group relative bg-igo-green text-white p-6 sm:p-10 lg:p-16 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl"
          >
            <div className="absolute inset-0 opacity-20 mix-blend-overlay">
              <img src="/images/products/chicken-whole.png" alt="" className="w-full h-full object-cover grayscale brightness-50" />
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
            <div className="relative z-10 h-full flex flex-col justify-between gap-8">
              <div>
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-5 sm:mb-8">
                  <User className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold mb-4 sm:mb-6">
                  For Home Cooks <br />&amp; Families
                </h3>
                <ul className="space-y-3 sm:space-y-4">
                  {['Same-day delivery from farm', 'Money-back freshness guarantee', 'Subscription early access'].map(feat => (
                    <li key={feat} className="flex items-center gap-3 text-white/80 text-sm sm:text-base">
                      <div className="w-1.5 h-1.5 rounded-full bg-igo-gold flex-shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => {
                  const el = document.getElementById('products');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  else window.location.hash = 'products';
                }}
                className="bg-white text-igo-green px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold flex items-center gap-3 w-fit group-hover:bg-igo-gold group-hover:text-white transition-all shadow-lg active:scale-95 text-sm sm:text-base"
              >
                Shop Fresh Now
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </motion.div>

          {/* For Businesses */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="group relative bg-neutral-dark text-white p-6 sm:p-10 lg:p-16 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden border-2 border-transparent hover:border-igo-gold/30 transition-all shadow-2xl"
          >
            <div className="absolute inset-0 opacity-40">
              <img src="/images/b2b-supply.png" alt="" className="w-full h-full object-cover grayscale brightness-50" />
              <div className="absolute inset-0 bg-gradient-to-r from-neutral-dark via-neutral-dark/80 to-transparent" />
            </div>
            <div className="absolute -bottom-10 -right-10 w-80 h-80 bg-igo-gold/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 h-full flex flex-col justify-between gap-8">
              <div>
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-igo-gold/10 rounded-2xl flex items-center justify-center mb-5 sm:mb-8 text-igo-gold">
                  <Building2 className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold mb-4 sm:mb-6 text-white">
                  For Restaurants <br />&amp; Businesses
                </h3>
                <ul className="space-y-3 sm:space-y-4">
                  {['Bulk pricing &amp; supply chains', 'Custom labeling &amp; branding', 'Traceability API integration'].map(feat => (
                    <li key={feat} className="flex items-center gap-3 text-white/60 text-sm sm:text-base">
                      <div className="w-1.5 h-1.5 rounded-full bg-igo-gold opacity-50 flex-shrink-0" />
                      <span dangerouslySetInnerHTML={{ __html: feat }} />
                    </li>
                  ))}
                </ul>
              </div>
              <a
                href="mailto:b2b@igoproteincuts.com?subject=B2B Inquiry"
                className="bg-igo-gold text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold flex items-center gap-3 w-fit hover:bg-igo-gold/80 transition-all shadow-lg shadow-igo-gold/20 active:scale-95 text-sm sm:text-base"
              >
                Request Quote
                <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default DualCTA;
