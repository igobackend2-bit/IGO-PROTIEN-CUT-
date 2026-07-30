import React from 'react';
import { Thermometer, Package, Scissors, Ban } from 'lucide-react';

const pillars = [
  {
    icon: Thermometer,
    title: '0–4°C Cold Chain',
    desc: 'Temperature maintained from farm to your door'
  },
  {
    icon: Package,
    title: 'Vacuum Sealed',
    desc: 'Hygienic air-tight packaging locks in freshness'
  },
  {
    icon: Scissors,
    title: 'Expert Butchers',
    desc: 'Cuts by certified professionals, every order'
  },
  {
    icon: Ban,
    title: 'No Preservatives',
    desc: 'Zero hormones, antibiotics, or additives ever'
  }
];

export const FreshnessPromiseSection: React.FC = () => {
  return (
    <section className="bg-black border-y border-emerald-900/60 py-14 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
        backgroundSize: '40px 40px'
      }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-white uppercase tracking-[0.2em]">Our Freshness Promise</span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Pure. Natural. <span className="text-emerald-400">Guaranteed.</span>
          </h2>
        </div>

        <div className="flex items-stretch gap-4 overflow-x-auto no-scrollbar pb-2">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="shrink-0 w-[220px] flex flex-col items-center text-center p-6 rounded-2xl bg-emerald-950/40 border border-emerald-900 hover:border-emerald-600 transition"
              >
                <div className="w-14 h-14 rounded-2xl bg-black border border-emerald-800 flex items-center justify-center mb-4">
                  <Icon className="w-7 h-7 text-emerald-400" />
                </div>
                <h3 className="font-bold text-white mb-1.5 text-sm">{pillar.title}</h3>
                <p className="text-neutral-400 text-xs leading-relaxed">{pillar.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
