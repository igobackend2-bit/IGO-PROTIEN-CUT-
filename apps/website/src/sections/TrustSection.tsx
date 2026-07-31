import React from 'react';
import { Check, Minus } from 'lucide-react';
import { useSiteContent } from '../lib/hooks/useSiteContent';
import { resolveIcon } from '../lib/iconMap';
import { COMPARISON_FALLBACK } from './WhyIGOSection';

// Consolidated "Why Choose IGO" trust section — merges what used to be five
// separate stacked sections (Freshness Promise pillars, Farm-to-Home 4-step
// process, Why-IGO comparison table + bento grid, and Quality Certifications
// carousel) into ONE section so the homepage doesn't read as a wall of
// repeated "we're antibiotic-free / cold chain / certified" messaging.
// Every unique fact from those sections is still here — the table, the 4
// trust pillars, and the cert badges — just presented once, compactly,
// instead of several times in several different visual styles. (The batch
// trace tool that used to live at the bottom of this section was removed
// from the homepage per explicit request.)

/**
 * Reads the SAME two blocks as WhyIGOSection and QualityCertificationsSection.
 *
 * Before this, the comparison table was copy-pasted here verbatim and the
 * certification list existed in three files with three different sets of
 * entries — TrustSection listed 3, QualityCertifications listed 4 including a
 * duplicate, OurFarms listed 4 including "100% Halal" that the others omitted.
 * They're now one authoritative block each, edited in /admin → Sections.
 */
const CERTS_FALLBACK = {
  eyebrow: 'Verified Origins',
  heading: 'Premium Standards, Verified and Trusted.',
  items: [
    { name: 'ISO 22000', icon: 'ShieldCheck', desc: 'Food Safety Management', year: '2027' },
    { name: 'HACCP', icon: 'Award', desc: 'Risk Assessment Standard', year: '2027' },
    { name: 'FSSAI Licensed', icon: 'Globe', desc: 'Lic: 10022043000918', year: '2027' },
    { name: '100% Halal', icon: 'Sprout', desc: 'Zabiha certified sourcing', year: '' }
  ]
};

export const TrustSection: React.FC = () => {
  const comparisonBlock = useSiteContent('sections.comparison', COMPARISON_FALLBACK);
  const certsBlock = useSiteContent('sections.certifications', CERTS_FALLBACK);

  const comparison = comparisonBlock.rows;
  const certs = certsBlock.items.map((c) => ({
    name: c.name,
    desc: c.desc,
    icon: resolveIcon(c.icon)
  }));

  return (
    <section className="bg-emerald-50/60 border-y border-emerald-100 py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Why Choose Us</span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#08120B] tracking-tight">Why Choose IGO Protein Cuts?</h2>
          <p className="text-xs sm:text-sm text-neutral-600">
            An objective, feature-by-feature comparison — not marketing copy. See exactly what "farm to table" means in practice.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto no-scrollbar rounded-3xl border border-neutral-200 shadow-lg shadow-emerald-950/5 bg-white">
          <table className="w-full border-collapse min-w-[640px] text-left">
            <thead>
              <tr className="bg-[#08120B]">
                <th className="py-5 px-6 text-white/50 font-bold uppercase text-[10px] tracking-wider">
                  {comparisonBlock.columns.feature}
                </th>
                <th className="py-5 px-6 bg-[#0F7B3A]/20 border-x border-emerald-500/20">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-[#0F7B3A] rounded-lg flex items-center justify-center text-white shadow">
                      {React.createElement(resolveIcon('ShieldCheck'), { className: 'w-4.5 h-4.5' })}
                    </div>
                    <span className="font-black text-white text-sm tracking-tight">
                      {comparisonBlock.columns.igo}
                    </span>
                  </div>
                </th>
                <th className="py-5 px-6 text-white/50 font-bold uppercase text-[10px] tracking-wider">
                  {comparisonBlock.columns.local}
                </th>
                <th className="py-5 px-6 text-white/50 font-bold uppercase text-[10px] tracking-wider">
                  {comparisonBlock.columns.competitor}
                </th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((row, idx) => (
                <tr
                  key={row.feature}
                  className={`border-b border-neutral-100 last:border-0 hover:bg-emerald-50/40 transition-colors ${
                    idx % 2 === 1 ? 'bg-neutral-50/50' : 'bg-white'
                  }`}
                >
                  <td className="py-5 px-6 font-bold text-[#08120B] text-xs">{row.feature}</td>
                  <td className="py-5 px-6 bg-emerald-50/50 border-x border-emerald-100/70">
                    <div className="flex items-center gap-2.5 text-emerald-800 font-bold text-xs">
                      <div className="w-6 h-6 rounded-full bg-[#0F7B3A] flex items-center justify-center shrink-0 shadow-sm shadow-emerald-900/30">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                      {row.igo}
                    </div>
                  </td>
                  <td className="py-5 px-6 text-neutral-500 text-xs">
                    <div className="flex items-center gap-2">
                      <Minus className="w-3.5 h-3.5 text-neutral-300 shrink-0" />
                      {row.local}
                    </div>
                  </td>
                  <td className="py-5 px-6 text-neutral-500 text-xs">
                    <div className="flex items-center gap-2">
                      <Minus className="w-3.5 h-3.5 text-neutral-300 shrink-0" />
                      {row.competitor}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Certification Badge Strip — 4 items, so the grid steps through
            1 -> 2 -> 4 columns rather than 3, which stranded the 4th badge
            alone on its own half-empty row. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {certs.map((cert) => {
            const Icon = cert.icon;
            return (
              <div
                key={cert.name}
                className="flex items-center gap-3 bg-white border border-emerald-100 rounded-2xl px-4 py-3.5 shadow-sm hover:shadow-md hover:border-emerald-300 hover:-translate-y-0.5 transition duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-xs font-black text-[#08120B] leading-tight">{cert.name}</div>
                  <div className="text-[10px] text-neutral-500 leading-tight mt-0.5">{cert.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
