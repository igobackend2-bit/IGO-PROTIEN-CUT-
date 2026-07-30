import React from 'react';
import { Thermometer, ShieldCheck, Leaf } from 'lucide-react';

// Standalone dark "Production Quality Monitoring" banner — real cold-chain
// facility photo, real certifications already established elsewhere on the
// site (ISO 22000, antibiotic-free, 0-4°C monitoring). No new claims.
export const QualityBanner: React.FC = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-[#08120B] rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-2 items-center shadow-xl shadow-black/20">
        <div className="p-8 sm:p-12 space-y-5">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Quality Assurance</span>
          <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
            Production Quality
            <br />
            <span className="text-emerald-400">Monitoring</span>
          </h2>
          <p className="text-white/60 text-sm max-w-md">
            Every dark store is held to the same strict standard — from farm intake to final pack, we track temperature, hygiene, and handling at every step so what reaches your door is exactly what we promise.
          </p>
          <div className="grid grid-cols-3 gap-4 pt-2">
            {[
              { icon: Thermometer, label: 'Temperature Monitored' },
              { icon: ShieldCheck, label: 'ISO 22000 Certified' },
              { icon: Leaf, label: '100% Antibiotic-Free' }
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center text-center gap-2">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-[10px] font-bold text-white/70 uppercase tracking-wide leading-tight">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative h-64 md:h-full min-h-[280px]">
          <img
            src="/Images/Meat Images/Beef/Ribeye Steak.jpg"
            alt="Premium quality-checked ribeye steak"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#08120B]/50 via-transparent to-transparent md:bg-gradient-to-r md:from-[#08120B]/30 md:via-transparent md:to-transparent" />
        </div>
      </div>
    </section>
  );
};
