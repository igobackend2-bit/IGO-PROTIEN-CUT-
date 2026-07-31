import React from 'react';
import { Check, X, ShieldCheck, Zap, Truck, Award } from 'lucide-react';
import { useSiteContent } from '../lib/hooks/useSiteContent';

/**
 * Editable from /admin → Sections → Comparison.
 *
 * This table used to be duplicated verbatim in TrustSection.tsx. Both now read
 * the same `sections.comparison` block, so editing it once updates both places.
 */
export const COMPARISON_FALLBACK = {
  eyebrow: 'Competitive Edge',
  heading: 'Why Choose IGO Protein Cuts?',
  subheading:
    "We've set a new benchmark for quality in the meat industry. Compare us with the local market and see the difference transparency makes.",
  columns: { feature: 'FEATURE', igo: 'IGO Standard', local: 'LOCAL MARKET', competitor: 'COMPETITORS' },
  rows: [
    { feature: 'Traceability', igo: 'Full Farm-to-Table (QR Scan)', local: 'None / Word of mouth', competitor: 'Limited batch info' },
    { feature: 'Freshness', igo: 'Never Frozen (0-4°C Always)', local: 'Room temp / Variable', competitor: 'Frozen for storage' },
    { feature: 'Processing', igo: 'ISO 22000 Sterile Facility', local: 'Open air market', competitor: 'Standard warehouse' },
    { feature: 'Delivery', igo: '30-90 Min Cold-Chain', local: 'No delivery', competitor: '3-4 hours / Dry bag' },
    { feature: 'Antibiotics', igo: '100% Antibiotic-Free', local: 'Unknown', competitor: 'Selective' }
  ]
};

export const WhyIGOSection: React.FC = () => {
  const block = useSiteContent('sections.comparison', COMPARISON_FALLBACK);
  const comparison = block.rows;
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">{block.eyebrow}</span>
        <h2 className="text-2xl sm:text-3xl font-black text-[#08120B] tracking-tight">{block.heading}</h2>
        <p className="text-xs sm:text-sm text-neutral-600">
          {block.subheading}
        </p>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto no-scrollbar rounded-2xl border border-neutral-200 shadow-sm">
        <table className="w-full border-collapse min-w-[640px] text-left">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200">
              <th className="py-4 px-4 text-neutral-500 font-bold uppercase text-[10px] tracking-wider">Feature</th>
              <th className="py-4 px-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-[#0F7B3A] rounded-lg flex items-center justify-center text-white">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="font-black text-emerald-600 text-sm">IGO Standard</span>
                </div>
              </th>
              <th className="py-4 px-4 text-neutral-500 font-bold text-xs">Local Market</th>
              <th className="py-4 px-4 text-neutral-500 font-bold text-xs">Competitors</th>
            </tr>
          </thead>
          <tbody>
            {comparison.map((row) => (
              <tr key={row.feature} className="border-b border-neutral-100 last:border-0 bg-white">
                <td className="py-4 px-4 font-bold text-[#08120B] text-xs">{row.feature}</td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3" />
                    </div>
                    {row.igo}
                  </div>
                </td>
                <td className="py-4 px-4 text-neutral-500 text-xs">
                  <div className="flex items-center gap-2">
                    <X className="w-3.5 h-3.5 text-neutral-300 shrink-0" />
                    {row.local}
                  </div>
                </td>
                <td className="py-4 px-4 text-neutral-500 text-xs">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-neutral-300 shrink-0" />
                    {row.competitor}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Trust Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 md:row-span-2 bg-emerald-50 border border-emerald-100 rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-14 h-14 bg-[#0F7B3A] rounded-2xl flex items-center justify-center text-white mb-5 shadow-lg shadow-emerald-900/20">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-[#08120B] mb-3">Sterile Process</h3>
            <p className="text-neutral-600 text-sm max-w-sm">Surgical hygiene levels maintained in our ISO 22000 certified dark stores.</p>
          </div>
          <div className="absolute -right-16 -bottom-16 w-56 h-56 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />
        </div>

        <div className="bg-white border border-neutral-200 rounded-3xl p-6 flex flex-col justify-center text-center shadow-sm">
          <Zap className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
          <h4 className="font-bold text-[#08120B] text-sm mb-1">No Freezing</h4>
          <p className="text-[11px] text-neutral-500">Farm to door chilled, never frozen.</p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-3xl p-6 flex flex-col justify-center text-center shadow-sm">
          <Truck className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
          <h4 className="font-bold text-[#08120B] text-sm mb-1">Express</h4>
          <p className="text-[11px] text-neutral-500">Averaging 30-90 mins across zones.</p>
        </div>

        <div className="md:col-span-2 bg-[#08120B] border border-black rounded-3xl p-6 flex flex-row items-center gap-6">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center shrink-0">
            <Award className="w-8 h-8 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-white text-base mb-1">Heritage Sourced</h4>
            <p className="text-xs text-neutral-400">Hand-selected local farms from heritage belts.</p>
          </div>
        </div>
      </div>
    </section>
  );
};
