import React from 'react';
import { ArrowRight } from 'lucide-react';
import { brandsData } from '../data/brandsData';

const BrandsMarquee = () => {
  return (
    <section className="py-24 bg-background overflow-hidden border-t border-b border-black/5">
      <div className="container-pro">
        <div className="text-center mb-20 relative">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            <img src="/images/igo-group-map.png" alt="IGO Background" className="max-w-[700px] w-full opacity-[0.25] object-contain mix-blend-multiply" />
          </div>
          
          <div className="relative z-10">
            <div className="flex justify-center items-center gap-4 mb-6">
              <div className="h-px w-16 bg-secondary/40"></div>
              <span className="text-secondary font-black uppercase tracking-[0.3em] text-[10px]">THE SOVEREIGN ECOSYSTEM</span>
              <div className="h-px w-16 bg-secondary/40"></div>
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-primary mb-6">
              The <span className="text-secondary italic font-serif">26 Verticals</span> of IGO.
            </h2>
            <p className="text-text-muted text-lg max-w-2xl mx-auto font-light leading-relaxed mb-10">
              A sovereign agricultural ecosystem covering Engineering, Production, Trade, and Consumer Lifestyle.
            </p>
            <div className="flex justify-center items-center gap-6">
              <button className="w-12 h-12 rounded-full border border-black/10 flex items-center justify-center hover:bg-primary hover:text-white transition-colors cursor-pointer text-text-muted">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">EXPLORE ALL 26 VERTICALS</span>
              <button className="w-12 h-12 rounded-full border border-black/10 flex items-center justify-center hover:bg-primary hover:text-white transition-colors cursor-pointer text-text-muted">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative w-full pb-10">
        {/* Gradient fades for edges */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"></div>

        {/* Marquee Container */}
        <div className="flex w-max animate-marquee hover:animation-play-state-paused group">
          {/* First set of items */}
          <div className="flex">
            {brandsData.map((brand, i) => (
              <div key={`brand-1-${i}`} className="w-[350px] bg-white rounded-[32px] border border-black/5 p-8 flex flex-col justify-between h-[420px] shadow-sm hover:shadow-xl hover:border-secondary/30 transition-all group/card shrink-0 mx-4 cursor-pointer relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-bl-full -z-10 group-hover/card:bg-secondary/10 transition-colors"></div>
                <div>
                  <div className="h-32 flex items-center justify-center mb-6 bg-black/[0.02] rounded-2xl group-hover/card:bg-white group-hover/card:shadow-lg transition-all p-2 border border-transparent group-hover/card:border-black/5">
                    <img src={brand.logo} alt={brand.title} className="max-h-[100px] max-w-full object-contain mix-blend-multiply scale-110" />
                  </div>
                  <span className="text-secondary font-black uppercase tracking-[0.2em] text-[10px] block mb-3">{brand.category}</span>
                  <h3 className="text-xl font-black text-primary mb-3">{brand.title}</h3>
                  <p className="text-text-muted text-sm leading-relaxed font-light line-clamp-3">{brand.description}</p>
                </div>
                <div className="flex items-center justify-between pt-6 border-t border-black/5 mt-6 relative z-10 bg-white group-hover/card:border-secondary/20 transition-colors">
                  <span className="text-primary font-black uppercase tracking-widest text-[10px] group-hover/card:text-secondary transition-colors">Active Division</span>
                  <ArrowRight className="w-4 h-4 text-secondary group-hover/card:translate-x-2 transition-transform" />
                </div>
              </div>
            ))}
          </div>
          {/* Second set of items for seamless loop */}
          <div className="flex">
            {brandsData.map((brand, i) => (
              <div key={`brand-2-${i}`} className="w-[350px] bg-white rounded-[32px] border border-black/5 p-8 flex flex-col justify-between h-[420px] shadow-sm hover:shadow-xl hover:border-secondary/30 transition-all group/card shrink-0 mx-4 cursor-pointer relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-bl-full -z-10 group-hover/card:bg-secondary/10 transition-colors"></div>
                <div>
                  <div className="h-32 flex items-center justify-center mb-6 bg-black/[0.02] rounded-2xl group-hover/card:bg-white group-hover/card:shadow-lg transition-all p-2 border border-transparent group-hover/card:border-black/5">
                    <img src={brand.logo} alt={brand.title} className="max-h-[100px] max-w-full object-contain mix-blend-multiply scale-110" />
                  </div>
                  <span className="text-secondary font-black uppercase tracking-[0.2em] text-[10px] block mb-3">{brand.category}</span>
                  <h3 className="text-xl font-black text-primary mb-3">{brand.title}</h3>
                  <p className="text-text-muted text-sm leading-relaxed font-light line-clamp-3">{brand.description}</p>
                </div>
                <div className="flex items-center justify-between pt-6 border-t border-black/5 mt-6 relative z-10 bg-white group-hover/card:border-secondary/20 transition-colors">
                  <span className="text-primary font-black uppercase tracking-widest text-[10px] group-hover/card:text-secondary transition-colors">Active Division</span>
                  <ArrowRight className="w-4 h-4 text-secondary group-hover/card:translate-x-2 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandsMarquee;
