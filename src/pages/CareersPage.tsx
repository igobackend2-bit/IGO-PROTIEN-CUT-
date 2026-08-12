import React from 'react';
import { Briefcase, ArrowRight } from 'lucide-react';
import { useSiteContent } from '../lib/hooks/useSiteContent';

export const CareersPage: React.FC = () => {
  // Only the hero title/intro are admin-editable (via /admin → Pages & SEO →
  // Careers page). The job list below stays hardcoded.
  const content = useSiteContent('pages.careers', {
    title: 'Careers at IGO Protein Cuts',
    intro: 'Join the team reinventing fresh food logistics across India.'
  });

  const jobs = [
    { title: 'Master Butchery Specialist', location: 'Bengaluru / Hyderabad', type: 'Full-time' },
    { title: 'Cold Chain Logistics Manager', location: 'Chennai / Mumbai', type: 'Full-time' },
    { title: 'Growth & E-Commerce Lead', location: 'Bengaluru Head Office', type: 'Full-time' },
    { title: 'Customer Experience Concierge', location: 'Remote / Hybrid', type: 'Full-time' }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="bg-[#0A1F12] rounded-3xl p-8 text-center space-y-2 text-white shadow-lg shadow-emerald-950/20">
        <Briefcase className="w-10 h-10 text-emerald-400 mx-auto" />
        <h1 className="text-3xl font-black">{content.title}</h1>
        <p className="text-xs text-neutral-300">{content.intro}</p>
      </div>

      <div className="space-y-3">
        {jobs.map((j, idx) => (
          <div key={idx} className="bg-white border border-neutral-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div>
              <h3 className="font-bold text-[#0A1F12] text-sm">{j.title}</h3>
              <div className="text-xs text-neutral-500">{j.location} • {j.type}</div>
            </div>
            <button className="bg-[#0F7B3A] hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1 transition cursor-pointer">
              Apply Now <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
