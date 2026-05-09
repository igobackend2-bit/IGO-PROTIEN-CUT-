import React from 'react';
import { motion } from 'motion/react';
import { Check, X, ShieldCheck, Zap, Truck, Award } from 'lucide-react';

const comparison = [
  { feature: 'Traceability', igo: 'Full Farm-to-Table (QR Scan)', local: 'None / Word of mouth', competitor: 'Limited batch info' },
  { feature: 'Freshness', igo: 'Never Frozen (0-4°C Always)', local: 'Room temp / Variable', competitor: 'Frozen for storage' },
  { feature: 'Processing', igo: 'ISO 22000 Sterile Facility', local: 'Open air market', competitor: 'Standard warehouse' },
  { feature: 'Delivery', igo: '60-90 Mins Cold-Chain', local: 'No delivery', competitor: '3-4 hours / Dry bag' },
  { feature: 'Antibiotics', igo: '100% Antibiotic-Free', local: 'Unknown', competitor: 'Selective' },
];

const WhyIGO = () => {
  return (
    <section id="about" className="py-24 bg-white overflow-hidden scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-igo-green font-bold text-sm uppercase tracking-widest">Competitive Edge</span>
          <h2 className="text-4xl font-display font-bold mt-4 text-neutral-dark">Why Choose IGO Protein Cuts?</h2>
          <p className="mt-4 text-neutral-500 max-w-2xl mx-auto">
            We've set a new benchmark for quality in the meat industry. Compare us with 
            the local market and see the difference transparency makes.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-neutral-100">
                <th className="py-6 px-4 text-left text-neutral-400 font-bold uppercase text-xs tracking-wider">Feature</th>
                <th className="py-6 px-4 text-left">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-igo-green rounded-lg flex items-center justify-center text-white">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <span className="font-display font-bold text-igo-green text-lg">IGO Standard</span>
                  </div>
                </th>
                <th className="py-6 px-4 text-left text-neutral-500 font-bold">Local Market</th>
                <th className="py-6 px-4 text-left text-neutral-500 font-bold">Competitors</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((row, i) => (
                <motion.tr 
                  key={row.feature}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="border-b border-neutral-50 group hover:bg-neutral-light/50 transition-colors"
                >
                  <td className="py-6 px-4 font-bold text-neutral-dark">{row.feature}</td>
                  <td className="py-6 px-4">
                    <div className="flex items-center gap-3 text-igo-green font-bold">
                      <div className="w-5 h-5 rounded-full bg-igo-green/10 flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </div>
                      {row.igo}
                    </div>
                  </td>
                  <td className="py-6 px-4 text-neutral-400 text-sm">
                    <div className="flex items-center gap-3">
                      <X className="w-4 h-4 text-red-300" />
                      {row.local}
                    </div>
                  </td>
                  <td className="py-6 px-4 text-neutral-400 text-sm">
                    <div className="flex items-center gap-3">
                      <Zap className="w-4 h-4 text-igo-gold/50" />
                      {row.competitor}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Trust Badges - Bento Grid Layout */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-4 gap-6 h-auto md:h-[400px]">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2 md:row-span-2 bg-igo-green/5 rounded-[2.5rem] p-10 border border-igo-green/10 flex flex-col justify-between group overflow-hidden relative"
          >
             <div className="relative z-10">
               <div className="w-16 h-16 bg-igo-green rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl shadow-igo-green/20 group-hover:scale-110 transition-transform duration-500">
                 <ShieldCheck className="w-8 h-8" />
               </div>
               <h3 className="text-3xl font-display font-bold text-neutral-dark mb-4">Sterile Process</h3>
               <p className="text-neutral-500 text-lg max-w-sm">Surgical hygiene levels maintained in our ISO 22000 certified facilities.</p>
             </div>
             <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-igo-green/10 rounded-full blur-3xl" />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="md:col-span-1 bg-neutral-light rounded-[2.5rem] p-8 border border-neutral-200 flex flex-col justify-center text-center group"
          >
             <Zap className="w-10 h-10 text-igo-gold mx-auto mb-4 group-hover:scale-110 transition-transform" />
             <h4 className="font-bold text-neutral-dark text-xl mb-2">No Freezing</h4>
             <p className="text-sm text-neutral-400">Farm to door chilled, never frozen.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="md:col-span-1 bg-neutral-light rounded-[2.5rem] p-8 border border-neutral-200 flex flex-col justify-center text-center group"
          >
             <Truck className="w-10 h-10 text-igo-green mx-auto mb-4 group-hover:scale-110 transition-transform" />
             <h4 className="font-bold text-neutral-dark text-xl mb-2">Express</h4>
             <p className="text-sm text-neutral-400">Averaging 72 mins across cities.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
            className="md:col-span-2 bg-neutral-dark rounded-[2.5rem] p-8 border border-white/5 flex flex-row items-center gap-8 group"
          >
             <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center flex-shrink-0">
               <Award className="w-10 h-10 text-igo-gold" />
             </div>
             <div>
               <h4 className="font-bold text-white text-xl mb-1">Heritage Sourced</h4>
               <p className="text-sm text-white/40">Hand-selected local farms from heritage belts.</p>
             </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WhyIGO;
