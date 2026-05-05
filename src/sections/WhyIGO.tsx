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

        {/* Trust Badges */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { icon: ShieldCheck, title: 'Sterile Process', desc: 'Surgical hygiene levels' },
            { icon: Zap, title: 'No Freezing', desc: 'Farm to door chilled' },
            { icon: Truck, title: 'Express Delivery', desc: 'Averaging 72 mins' },
            { icon: Award, title: 'Heritage Sourced', desc: 'Selected local farms' },
          ].map((item, i) => (
            <div key={item.title} className="text-center p-6 bg-neutral-light rounded-3xl border border-neutral-200">
              <item.icon className="w-10 h-10 text-igo-green mx-auto mb-4" />
              <h4 className="font-bold text-neutral-dark mb-1">{item.title}</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyIGO;
