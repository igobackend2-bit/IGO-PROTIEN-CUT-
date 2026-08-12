import React from 'react';
import { ShieldCheck, Award, Clock, CheckCircle2, Truck } from 'lucide-react';
import { useSiteContent } from '../lib/hooks/useSiteContent';
import { FadeImage } from '../components/FadeImage';
import { TraceabilitySection } from '../sections/TraceabilitySection';

export const AboutPage: React.FC = () => {
  // Only the hero title/intro are admin-editable here (via /admin → Pages &
  // SEO → About page). The sections below (Trust, Founder Message,
  // Certifications) are bespoke layouts, not a generic heading/body list, so
  // they stay hardcoded rather than being forced into a shape that doesn't
  // fit them.
  const content = useSiteContent('pages.about', {
    title: 'The Protein Cuts Story',
    intro:
      'Protein Cuts was born out of a single obsession: to eradicate chemical preservatives, antibiotics, and stale frozen meats from Indian households. As part of the prestigious IGO Groups ecosystem, we leverage technology, farm partnerships, and cold-chain logistics to deliver pure, fresh protein in 30-90 minutes.'
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Hero */}
      <div className="bg-[#0A1F12] rounded-3xl p-8 sm:p-12 text-center max-w-4xl mx-auto space-y-4 shadow-lg shadow-emerald-950/20 text-white">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">IGO ECOSYSTEM BRAND</span>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight">{content.title}</h1>
        <p className="text-xs sm:text-base text-neutral-300 leading-relaxed">{content.intro}</p>
      </div>

      {/* What We Sell — customer feedback pointed out that everything above
          this point is guarantees/brand-story copy (antibiotic-free, cold
          chain, certifications) without ever plainly stating what's actually
          for sale. A new visitor reading only the hero had no quick way to
          tell this is a fresh-meat-and-seafood delivery service rather than,
          say, a supplement or grocery brand. This section says it directly. */}
      <div className="bg-white border border-neutral-200 rounded-3xl p-8 space-y-6 shadow-sm">
        <div className="max-w-2xl">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">What We Sell</span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0A1F12] tracking-tight mt-2">
            Fresh chicken, mutton, fish, seafood and eggs — cut to order and delivered in 30-90 minutes.
          </h2>
          <p className="text-sm text-neutral-600 leading-relaxed mt-3">
            Protein Cuts is an online butcher: you pick the cut and weight, our butchers dress it fresh after you
            order, and it reaches your door chilled at 0-4°C. Beyond individual cuts, we also sell ready-to-cook
            marinated items, frozen snacks, combo packs for families or gym-goers, and recurring meat subscriptions.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {[
            'Fresh Chicken',
            'Mutton & Beef',
            'Fish & Seafood',
            'Farm Eggs',
            'Ready-to-Cook',
            'Frozen Snacks',
            'Combo Packs',
            'Meat Subscriptions'
          ].map((item) => (
            <div
              key={item}
              className="bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2.5 font-bold text-[#0A1F12] text-center"
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Trust / Traceability — real facility photo, real facts already
          established elsewhere on the site (batch ID traceability, 0-4°C
          cold chain, heritage Nilgiris farms) rather than a fabricated
          phone/QR-code composite image. */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
        <div className="space-y-5">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Trust Your Protein</span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            <span className="text-[#0A1F12]">Know Your Source.</span>
            <br />
            <span className="text-[#D4AF37]">Trust Your Cut.</span>
          </h2>
          <p className="text-sm text-neutral-600 leading-relaxed max-w-md">
            Our technology-driven traceability system provides complete farm-to-table transparency. Every pack carries a unique batch ID and QR code that reveals the journey of your meat — from the specific farm to the temperature logs of its delivery.
          </p>

          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <div className="font-bold text-[#0A1F12] text-sm">Verified Origins</div>
                <p className="text-xs text-neutral-500">Traced back to heritage farms in the Nilgiris range, Tamil Nadu.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <div className="font-bold text-[#0A1F12] text-sm">Cold Chain Transparency</div>
                <p className="text-xs text-neutral-500">Every batch stays tracked within a 0-4°C window, farm to door.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative rounded-3xl overflow-hidden shadow-xl shadow-black/20 min-h-[320px]">
          {/* Was pointed at igo-protien-cut.vercel.app, an old, unrelated
              Vercel project that's since been redeployed with a different
              site — the URL now 404s. Recovered the original photo from an
              old deployment of that same project and re-hosted it locally. */}
          <FadeImage
            src="/Images/narrative/facility.jpg"
            alt="IGO cold-chain facility — batch-tracked processing"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A1F12]/85 via-[#0A1F12]/10 to-transparent" />

          <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-[9px] font-bold text-white/60 uppercase tracking-widest">Interactive Journey</div>
              <div className="text-sm font-black text-white">0-4°C Supply Chain Integrity</div>
            </div>
            <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4.5 h-4.5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Real batch lookup — was built but never wired into any page, so the
          "scan your pack" claim above had no actual tool behind it. Backed by
          igo_batch_trace (see supabase/migrations/0019_batch_traceability.sql). */}
      <TraceabilitySection />

      {/* Leadership & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <span className="text-xs font-bold text-emerald-700 uppercase">QUALITY HYGIENE MANIFESTO</span>
          <h2 className="text-2xl font-black text-[#0A1F12]">Founder & CEO Message</h2>
          <p className="text-xs text-neutral-600 leading-relaxed">
            "Meat shouldn't sit on open counters exposed to dirt and flies, nor should it be injected with water or steroids. At Protein Cuts, every single cut is dressed under temperature-controlled dark stores, subjected to 150+ lab checkpoints, and delivered in sealed thermal bags."
          </p>
          <div className="font-bold text-[#0A1F12] text-sm pt-2">
            — IGO Executive Board & Master Butchery Team
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-3xl p-6 space-y-4 shadow-sm">
          <h3 className="font-bold text-[#0A1F12] text-base">Key IGO Certifications</h3>
          <div className="space-y-3 text-xs text-neutral-600">
            <div className="flex items-center gap-3 bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
              <Award className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <strong className="text-[#0A1F12] block">FSSAI Certified Unit</strong>
                <span>License No. 10020042001928</span>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <strong className="text-[#0A1F12] block">100% Halal & Antibiotic-Free</strong>
                <span>Strict ritual compliance and zero chemical residue guarantees</span>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
              <Clock className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <strong className="text-[#0A1F12] block">ISO 22000 Food Safety Standard</strong>
                <span>HACCP temperature monitoring from 0°C to 4°C throughout transport</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
