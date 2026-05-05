import React from 'react';
import { motion } from 'motion/react';
import { Thermometer, Package, Scissors, Ban } from 'lucide-react';

const pillars = [
  {
    icon: Thermometer,
    title: '0–4°C Cold Chain',
    desc: 'Temperature maintained from farm to your door',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
  },
  {
    icon: Package,
    title: 'Vacuum Sealed',
    desc: 'Hygienic air-tight packaging locks in freshness',
    color: 'text-igo-gold',
    bg: 'bg-igo-gold/10',
  },
  {
    icon: Scissors,
    title: 'Expert Butchers',
    desc: 'Cuts by certified professionals, every order',
    color: 'text-igo-green',
    bg: 'bg-igo-green/10',
  },
  {
    icon: Ban,
    title: 'No Preservatives',
    desc: 'Zero hormones, antibiotics, or additives ever',
    color: 'text-red-400',
    bg: 'bg-red-400/10',
  },
];

const FreshnessStrip = () => {
  return (
    <section className="py-16 bg-neutral-dark overflow-hidden relative">
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
        backgroundSize: '40px 40px'
      }} />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-igo-gold font-bold text-xs uppercase tracking-[0.2em]">Our Freshness Promise</span>
          <h2 className="text-3xl font-display font-bold text-white mt-3">
            Pure. Natural. <span className="text-igo-green">Guaranteed.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group flex flex-col items-center text-center p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
              >
                <div className={`w-14 h-14 rounded-2xl ${pillar.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-7 h-7 ${pillar.color}`} />
                </div>
                <h3 className="font-bold text-white mb-2">{pillar.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{pillar.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FreshnessStrip;
