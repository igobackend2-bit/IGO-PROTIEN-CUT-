import React from 'react';
import { motion } from 'motion/react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Priya Iyer',
    role: 'Home Cook',
    content: "The freshest fish I've ever bought online. Being able to scan the QR code and see exactly which farm it came from is a game-changer.",
    rating: 5,
    avatar: 'https://i.pravatar.cc/150?u=priya'
  },
  {
    id: 2,
    name: 'Sanjay Kapoor',
    role: 'Restaurant Owner',
    content: "IGO supplies our restaurant with consistent, premium mutton. Their traceability system reduced our compliance audits by 40%.",
    rating: 5,
    avatar: 'https://i.pravatar.cc/150?u=sanjay'
  },
  {
    id: 3,
    name: 'Anjali Sharma',
    role: 'Fitness Enthusiast',
    content: "I only trust IGO for my protein needs. Their lean chicken cuts are perfectly processed and delivered at the right temperature every time.",
    rating: 5,
    avatar: 'https://i.pravatar.cc/150?u=anjali'
  }
];

const Testimonials = () => {
  return (
    <section className="py-24 bg-neutral-light overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <Quote className="w-12 h-12 text-igo-green/20 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-display font-bold text-neutral-dark">
            Trusted by Connoisseurs & Partners
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-10 rounded-[32px] shadow-sm hover:shadow-xl transition-all duration-500 border border-neutral-100 flex flex-col justify-between"
            >
              <div>
                <div className="flex gap-1 mb-6 text-igo-gold">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-igo-gold" />
                  ))}
                </div>
                <p className="text-neutral-600 text-lg leading-relaxed mb-10 italic">
                  "{t.content}"
                </p>
              </div>
              
              <div className="flex items-center gap-4 border-t border-neutral-50 pt-8 mt-auto">
                <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <div className="font-bold text-neutral-dark">{t.name}</div>
                  <div className="text-xs text-neutral-400 uppercase tracking-widest">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
