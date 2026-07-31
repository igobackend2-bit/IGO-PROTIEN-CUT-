import React from 'react';
import { useSiteContent } from '../lib/hooks/useSiteContent';
import { resolveIcon } from '../lib/iconMap';

/**
 * Editable from /admin → Sections → How It Works.
 * The object below is the fallback if the content block is missing.
 */
const FALLBACK = {
  eyebrow: 'SIMPLE PROCESS',
  heading: 'Fresh to Your Door in 3 Steps',
  items: [
    {
      icon: 'ShoppingCart',
      title: 'Place Your Order',
      text: 'Browse fresh categories, select your cuts, and checkout in under 2 minutes.'
    },
    {
      icon: 'PackageCheck',
      title: 'Process & Pack Fresh',
      text: 'Cuts are processed the same morning in sterile, temperature-controlled dark stores.'
    },
    {
      icon: 'Truck',
      title: 'Delivered Fresh',
      text: 'Arrives at your door at peak freshness (0-4°C) with end-to-end cold chain.'
    }
  ]
};

export const HowItWorksSection: React.FC = () => {
  const block = useSiteContent('sections.how_it_works', FALLBACK);
  const steps = block.items.map((item, index) => ({
    id: index + 1,
    title: item.title,
    desc: item.text,
    icon: resolveIcon(item.icon)
  }));

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">{block.eyebrow}</span>
        <h2 className="text-2xl sm:text-3xl font-black text-[#08120B] tracking-tight">{block.heading}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        <div className="absolute top-10 left-[15%] right-[15%] h-px bg-emerald-100 hidden md:block" />

        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div key={step.id} className="relative text-center">
              <div className="w-20 h-20 bg-emerald-50 border-4 border-white rounded-full flex items-center justify-center mx-auto mb-6 relative z-10 shadow-md">
                <Icon className="w-8 h-8 text-emerald-600" />
                <div className="absolute -top-1.5 -right-1.5 w-7 h-7 bg-[#0F7B3A] text-white text-[11px] font-black flex items-center justify-center rounded-full border-2 border-white">
                  0{step.id}
                </div>
              </div>
              <h3 className="text-base font-bold text-[#08120B] mb-2">{step.title}</h3>
              <p className="text-xs text-neutral-600 leading-relaxed max-w-xs mx-auto">{step.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
