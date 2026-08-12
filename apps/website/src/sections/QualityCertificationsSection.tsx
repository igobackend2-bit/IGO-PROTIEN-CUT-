import React from 'react';
import { useSiteContent } from '../lib/hooks/useSiteContent';
import { resolveIcon } from '../lib/iconMap';

/**
 * Reads the shared `sections.certifications` block.
 *
 * The previous hardcoded list here contained a duplicate — both "ISO 22000" and
 * "ISO 22000 Certified" — and omitted the Halal entry that OurFarmsSection
 * showed. One block now feeds all three sections.
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

export const QualityCertificationsSection: React.FC = () => {
  const block = useSiteContent('sections.certifications', CERTS_FALLBACK);
  const certs = block.items.map((c) => ({
    name: c.name,
    year: c.year,
    desc: c.desc,
    icon: resolveIcon(c.icon)
  }));

  return (
    <section className="bg-emerald-50/60 border-y border-emerald-100 py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="max-w-2xl space-y-3">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Verified Origins</span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0A1F12] tracking-tight leading-tight">
            Premium Standards, <br />
            <span className="text-[#0A1F12]">Verified and Trusted.</span>
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
            We don't just claim quality — we prove it. Every IGO dark store is subject to rigorous
            audits, ensuring every cut meets the highest hygiene and safety standards.
          </p>
        </div>

        <div className="flex items-stretch gap-4 overflow-x-auto no-scrollbar pb-2">
          {certs.map((cert) => {
            const Icon = cert.icon;
            return (
              <div key={cert.name} className="shrink-0 w-[260px] bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm">
                <Icon className="w-8 h-8 text-emerald-600 mb-5" />
                <h3 className="font-black text-base text-[#0A1F12] mb-1">{cert.name}</h3>
                <p className="text-[11px] text-neutral-500 mb-4">{cert.desc}</p>
                <div className="text-[10px] bg-emerald-50 border border-emerald-200 inline-block px-2 py-1 rounded-md font-bold uppercase tracking-widest text-emerald-700">
                  Valid Until {cert.year}
                </div>
              </div>
            );
          })}
        </div>

        <div className="inline-flex items-center gap-4 px-5 py-3.5 bg-white border border-emerald-100 rounded-2xl shadow-sm">
          <div className="w-11 h-11 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
            {React.createElement(resolveIcon('ShieldCheck'), { className: 'w-5 h-5' })}
          </div>
          <div>
            <div className="font-bold text-[#0A1F12] text-sm">99.9% Compliance</div>
            <div className="text-[11px] text-neutral-500">Quarterly Audit Score</div>
          </div>
        </div>
      </div>
    </section>
  );
};
