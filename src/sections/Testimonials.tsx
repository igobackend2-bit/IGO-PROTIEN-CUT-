import React from 'react';
import { motion } from 'motion/react';
import { Star, Quote, TrendingUp } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Priya Iyer',
    role: 'Home Cook · Chennai',
    content: "The freshest fish I've ever bought online. Being able to scan the QR code and see exactly which farm it came from is a game-changer. My family won't accept anything else now!",
    rating: 5,
    initials: 'PI',
    color: 'from-igo-green to-emerald-400',
    verified: true,
  },
  {
    id: 2,
    name: 'Sanjay Kapoor',
    role: 'Restaurant Owner · Coimbatore',
    content: "IGO supplies our restaurant with consistent, premium mutton. Their traceability system reduced our compliance audits by 40%. Absolute game-changer for our B2B supply chain.",
    rating: 5,
    initials: 'SK',
    color: 'from-igo-gold to-amber-400',
    verified: true,
  },
  {
    id: 3,
    name: 'Anjali Sharma',
    role: 'Fitness Coach · Bangalore',
    content: "I only trust IGO for my protein needs. Their lean chicken cuts are perfectly processed and delivered at the right temperature every time. My clients love the traceability feature.",
    rating: 5,
    initials: 'AS',
    color: 'from-purple-500 to-violet-400',
    verified: true,
  }
];

import Marquee from '../components/Marquee';

const Testimonials = () => {
  const [allTestimonials, setAllTestimonials] = React.useState(testimonials);

  React.useEffect(() => {
    const loadReviews = () => {
      const liveReviews = JSON.parse(localStorage.getItem('igo_reviews') || '[]');
      const formattedLive = liveReviews.map((r: any) => ({
        id: r.id,
        name: r.customerName,
        role: 'Verified Customer',
        content: r.comment,
        rating: r.rating,
        initials: r.customerName.split(' ').map((n: any) => n[0]).join(''),
        color: 'from-igo-green to-igo-gold',
        verified: true
      }));
      setAllTestimonials([...formattedLive, ...testimonials]);
    };

    loadReviews();
    window.addEventListener('storage', loadReviews);
    return () => window.removeEventListener('storage', loadReviews);
  }, []);

  return (
    <section className="py-24 bg-white overflow-hidden relative">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-igo-green/5 blur-[120px] -z-0" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-igo-green/10 border border-igo-green/20 px-4 py-2 rounded-full mb-6">
              <TrendingUp className="w-4 h-4 text-igo-green" />
              <span className="text-xs font-bold text-igo-green uppercase tracking-widest font-sans">12k+ Global Reviews</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-neutral-dark">
              Loved by Home <span className="text-igo-green">Chefs</span> & <br />
              <span className="text-igo-gold">Pros</span> Alike.
            </h2>
          </div>
          <p className="text-neutral-500 max-w-sm text-sm leading-relaxed">
            From heritage kitchens to premium restaurants, IGO is the gold standard 
            for traceable, farm-fresh protein in South India.
          </p>
        </div>

        <div className="relative -mx-6">
          <Marquee speed={60} pauseOnHover={true}>
            {allTestimonials.map((t, i) => (
              <div
                key={`${t.name}-${i}`}
                className="min-w-[320px] sm:min-w-[380px] bg-neutral-light/50 backdrop-blur-sm p-8 rounded-[3rem] border border-neutral-100 flex flex-col group/card hover:bg-white hover:shadow-2xl transition-all duration-500 mx-4 my-4"
              >
                <div className="flex justify-between items-start mb-6">
                  <Quote className="w-10 h-10 text-igo-green/20" />
                  <div className="flex gap-0.5">
                    {[...Array(t.rating)].map((_, j) => (
                      <Star key={j} className="w-3.5 h-3.5 fill-igo-gold text-igo-gold" />
                    ))}
                  </div>
                </div>

                <p className="text-neutral-600 leading-relaxed mb-10 flex-1 text-sm font-medium italic">
                  "{t.content}"
                </p>

                <div className="flex items-center gap-4 border-t border-neutral-100 pt-6">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-display font-bold text-lg flex-shrink-0 shadow-lg group-hover/card:scale-110 transition-transform`}>
                    {t.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-neutral-dark flex items-center gap-2">
                      {t.name}
                      {t.verified && (
                        <div className="w-4 h-4 bg-igo-green rounded-full flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </Marquee>

          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent pointer-events-none z-10" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent pointer-events-none z-10" />
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
