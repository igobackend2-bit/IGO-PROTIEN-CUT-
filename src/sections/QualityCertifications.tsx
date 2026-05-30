import React from 'react';
import { motion } from 'motion/react';
import { Award, ShieldCheck, Globe, Zap } from 'lucide-react';

const certs = [
  { name: 'ISO 22000', year: '2025', logo: ShieldCheck, desc: 'Food Safety Management' },
  { name: 'HACCP', year: '2025', logo: Award, desc: 'Risk Assessment Standard' },
  { name: 'Global G.A.P', year: '2024', logo: Globe, desc: 'Agricultural Excellence' },
  { name: 'Organic Certified', year: '2025', logo: Zap, desc: 'Quality Verification' },
];

import Marquee from '../components/Marquee';

const QualityCertifications = () => {
  return (
    <section className="py-16 sm:py-24 bg-white border-y border-neutral-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-16">
        <div className="max-w-2xl">
          <span className="text-igo-green font-bold text-sm uppercase tracking-widest">Verified Origins</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold mt-4 text-neutral-dark leading-tight">
            Premium Standards, <br />
            <span className="text-igo-gold">Verified and Trusted.</span>
          </h2>
          <p className="mt-8 text-neutral-500 text-lg leading-relaxed">
            We don't just claim quality—we prove it. Every IGO facility is 
            subject to rigorous international audits, ensuring that every cut 
            meets the highest hygiene and safety standards in the world.
          </p>
        </div>
      </div>

      <Marquee speed={40} className="py-4">
        {certs.map((cert, i) => {
          const Icon = cert.logo;
          return (
            <div
              key={cert.name}
              className="bg-neutral-light p-8 rounded-3xl group mx-4 w-[280px] shrink-0"
            >
              <Icon className="w-10 h-10 text-neutral-300 group-hover:text-igo-gold transition-colors mb-6" />
              <h3 className="font-display font-bold text-lg text-neutral-dark mb-1">{cert.name}</h3>
              <p className="text-xs text-neutral-400 mb-4">{cert.desc}</p>
              <div className="text-[10px] bg-white border border-neutral-200 inline-block px-2 py-1 rounded-md font-bold uppercase tracking-widest text-neutral-300">
                Valid Until {cert.year}
              </div>
            </div>
          )
        })}
      </Marquee>

      <div className="max-w-7xl mx-auto px-6 mt-16">
        <div className="inline-flex items-center gap-4 px-6 py-4 bg-neutral-light border border-neutral-200 rounded-2xl">
          <div className="w-12 h-12 rounded-full bg-igo-green/10 flex items-center justify-center text-igo-green">
             <ShieldCheck />
          </div>
          <div>
            <div className="font-bold text-neutral-dark">99.9% Compliance</div>
            <div className="text-xs text-neutral-400">Quarterly Audit Score</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QualityCertifications;
