import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Crown, Zap, Truck, ShieldCheck, ChevronRight, Star } from 'lucide-react';

const benefits = [
  { icon: Truck,      title: 'Zero Delivery Fees', desc: 'Unlimited free delivery on all orders above ₹199.' },
  { icon: Zap,        title: 'Priority Slots',      desc: 'Get your protein in under 30 mins with dedicated Prime riders.' },
  { icon: ShieldCheck,title: 'Prime Only Cuts',     desc: 'Exclusive access to Heritage Farm batches and dry-aged steaks.' },
  { icon: Star,       title: 'Cashback Rewards',    desc: 'Flat 5% cashback on every purchase, credited instantly.' },
];

const IGOPrime = () => {
  const handleJoinPrime = () => {
    const user = localStorage.getItem('igo_user');
    if (!user) {
      alert('Please sign in first to join IGO Prime.');
      return;
    }
    alert('IGO Prime subscription is coming soon! You will be notified at launch with an exclusive founder discount.');
  };

  return (
    <section id="prime" className="py-24 relative overflow-hidden bg-neutral-dark">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-igo-gold/10 rounded-full blur-[120px] -z-0" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-igo-green/10 rounded-full blur-[120px] -z-0" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-igo-gold/10 border border-igo-gold/20 mb-8">
              <Crown className="w-4 h-4 text-igo-gold fill-igo-gold" />
              <span className="text-igo-gold font-bold text-xs uppercase tracking-widest">The Gold Standard</span>
            </div>

            <h2 className="text-5xl md:text-6xl font-display font-bold text-white leading-tight">
              Join the <span className="text-gradient-gold">Elite.</span> <br />
              Become IGO <span className="text-igo-gold">Prime.</span>
            </h2>

            <p className="mt-8 text-neutral-400 text-lg leading-relaxed max-w-lg">
              Unlock the ultimate meat-buying experience. Faster delivery,
              exclusive cuts, and zero fees. It's more than a membership—it's a commitment to quality.
            </p>

            <div className="mt-12 flex flex-col sm:flex-row gap-6">
              <button
                onClick={handleJoinPrime}
                className="px-10 py-5 bg-igo-gold text-neutral-dark font-bold rounded-2xl hover:scale-105 transition-all shadow-2xl shadow-igo-gold/20 flex items-center justify-center gap-3 group"
              >
                Join Now at &#8377;499/year
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <a
                href="#prime"
                className="px-10 py-5 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-all backdrop-blur-md text-center"
              >
                View All Benefits
              </a>
            </div>

            <p className="mt-6 text-sm text-neutral-500">*Cancel anytime. 30-day money back guarantee.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-10 lg:mt-0">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="glass-dark p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] group hover:border-igo-gold/30 transition-all duration-500"
                >
                  <div className="w-14 h-14 rounded-2xl bg-igo-gold/10 flex items-center justify-center text-igo-gold mb-6 group-hover:scale-110 transition-transform">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{benefit.title}</h3>
                  <p className="text-neutral-500 text-sm leading-relaxed">{benefit.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default IGOPrime;
