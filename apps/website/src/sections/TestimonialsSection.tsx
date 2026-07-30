import React from 'react';
import { Truck, ShieldCheck, RefreshCw } from 'lucide-react';

// NOTE: real customer testimonials aren't live yet — the plan is a proper
// review pipeline (customer submits a review -> admin approves it in the
// admin dashboard -> approved reviews surface here) once the site is in
// production. Until that exists, this section states real, already-
// established site facts (30-min delivery, freshness grading, subscription
// support are genuine features documented elsewhere on this site) rather
// than inventing fake named customers/quotes and labeling them "Verified" —
// that would be a false-advertising risk. Swap this array for
// admin-approved reviews once the moderation pipeline is built.
const valueProps = [
  {
    icon: Truck,
    title: 'Fast, ice-cold delivery',
    body: 'Cuts are packed in insulated, ice-lined boxes and delivered within your promised morning slot — every order, every time.'
  },
  {
    icon: ShieldCheck,
    title: 'Hygiene-first sourcing',
    body: 'Every cut carries a freshness grade and is antibiotic-free, cleaned and portioned exactly to the spec you order.'
  },
  {
    icon: RefreshCw,
    title: 'Real subscription support',
    body: 'Pause, reschedule, or change your plan anytime — backed by a support team that actually picks up the phone.'
  }
];

export const TestimonialsSection: React.FC = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Why Households Choose Us</span>
        <h2 className="text-2xl sm:text-3xl font-black text-[#08120B] tracking-tight">Built Around Trust, Not Just Delivery</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {valueProps.map((v) => {
          const Icon = v.icon;
          return (
            <div key={v.title} className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm hover:shadow-lg transition">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-4">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-[#08120B] mb-2">{v.title}</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">{v.body}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
