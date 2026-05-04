import React from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, PackageCheck, Truck } from 'lucide-react';

const steps = [
  {
    id: 1,
    title: 'Place Your Order',
    desc: 'Browse our fresh categories, select your cuts, and checkout in under 2 minutes.',
    icon: ShoppingCart,
    color: 'bg-igo-green/10 text-igo-green'
  },
  {
    id: 2,
    title: 'Process & Pack Fresh',
    desc: 'Cuts are processed the same morning in sterile, temperature-controlled conditions.',
    icon: PackageCheck,
    color: 'bg-igo-gold/10 text-igo-gold'
  },
  {
    id: 3,
    title: 'Delivered Fresh',
    desc: 'Arrives at your door at peak freshness (0-4°C) with end-to-end cold chain.',
    icon: Truck,
    color: 'bg-indigo-500/10 text-indigo-500'
  }
];

const HowItWorks = () => {
  return (
    <section id="about" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-igo-green font-bold text-sm uppercase tracking-[0.2em]">Efficiency Meets Quality</span>
          <h2 className="text-4xl font-display font-bold mt-4 text-neutral-dark">Fresh to Your Door in 3 Steps</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting Lines */}
          <div className="absolute top-[40px] left-[15%] right-[15%] h-0.5 bg-neutral-100 hidden md:block" />
          
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                viewport={{ once: true }}
                className="relative text-center group"
              >
                <div className={`w-20 h-20 ${step.color} rounded-full flex items-center justify-center mx-auto mb-8 relative z-10 border-4 border-white shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-8 h-8" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-neutral-dark text-white text-xs font-bold flex items-center justify-center rounded-full border-2 border-white">
                    0{step.id}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-4 text-neutral-dark">{step.title}</h3>
                <p className="text-neutral-500 leading-relaxed max-w-xs mx-auto">
                  {step.desc}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
