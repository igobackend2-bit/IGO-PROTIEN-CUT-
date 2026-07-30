import React from 'react';
import { ShieldCheck, Award, Globe, Sprout } from 'lucide-react';

const journey = [
  {
    label: 'Heritage Farms',
    caption: 'Nilgiris range, Tamil Nadu',
    image: 'https://igo-protien-cut.vercel.app/images/narrative/farm.webp'
  },
  {
    label: 'Sterile Processing',
    caption: 'ISO 22000 dark stores, 0-4°C',
    image: 'https://igo-protien-cut.vercel.app/images/narrative/facility.webp'
  },
  {
    label: 'Batch-Tracked Packaging',
    caption: 'Scannable farm-to-door QR code',
    image: 'https://igo-protien-cut.vercel.app/images/narrative/packaging.webp'
  }
];

const certs = [
  { name: 'ISO 22000', icon: ShieldCheck },
  { name: 'HACCP', icon: Award },
  { name: 'FSSAI Licensed', icon: Globe },
  { name: '100% Halal', icon: Sprout }
];

// "Our Farms" — real photography from the three-stage narrative sequence
// already used elsewhere on the site (farm → facility → packaging), plus
// the same certifications already listed on the About page. No new claims.
export const OurFarmsSection: React.FC = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Transparency Builds Trust</span>
        <h2 className="text-2xl sm:text-3xl font-black text-[#08120B] tracking-tight">Our Farms</h2>
        <p className="text-xs sm:text-sm text-neutral-600">
          From heritage pastures to your kitchen — every stage of the journey, shown honestly.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {journey.map((step) => (
          <div key={step.label} className="relative rounded-2xl overflow-hidden aspect-4/3 group">
            <img
              src={step.image}
              alt={step.label}
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#08120B]/90 via-[#08120B]/20 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3">
              <h3 className="text-white font-black text-sm">{step.label}</h3>
              <p className="text-white/70 text-[11px]">{step.caption}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {certs.map((cert) => {
          const Icon = cert.icon;
          return (
            <div
              key={cert.name}
              className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3 justify-center"
            >
              <Icon className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-xs font-black text-[#08120B]">{cert.name}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
};
