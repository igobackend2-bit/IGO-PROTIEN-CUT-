import React from 'react';
import { motion } from 'motion/react';
import { Tag, ShoppingBag, Package, Zap, Gift } from 'lucide-react';

const offers = [
  {
    tag: 'First Order',
    icon: Gift,
    title: '15% Off Your First Order',
    desc: 'New to IGO? Welcome! Use code IGOFRESH15 at checkout.',
    code: 'IGOFRESH15',
    color: 'from-igo-green to-emerald-500',
    textColor: 'text-white',
    codeColor: 'bg-white/20 text-white',
  },
  {
    tag: 'Bundle Deal',
    icon: Package,
    title: 'Protein Pack Bundle',
    desc: 'Chicken 1kg + Mutton 500g + Fish 500g — Save ₹250',
    code: 'IGOPACK',
    color: 'from-igo-gold to-amber-500',
    textColor: 'text-white',
    codeColor: 'bg-white/20 text-white',
  },
  {
    tag: 'B2B Special',
    icon: ShoppingBag,
    title: '20% Off Bulk Orders',
    desc: 'For restaurants & businesses. Orders above ₹5,000 qualify.',
    code: 'IGOB2B20',
    color: 'from-neutral-800 to-neutral-900',
    textColor: 'text-white',
    codeColor: 'bg-white/10 text-white',
  },
];

const OffersSection = () => {
  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-12 flex-wrap gap-4">
          <div>
            <span className="text-igo-gold font-bold text-sm uppercase tracking-widest">Limited Time</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold mt-2 text-neutral-dark">
              Deals & Offers
            </h2>
          </div>
          <div className="flex items-center gap-2 text-igo-green">
            <Zap className="w-5 h-5 fill-igo-green" />
            <span className="text-sm font-bold">Offers valid today only</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {offers.map((offer, i) => {
            const Icon = offer.icon;
            return (
              <motion.div
                key={offer.tag}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02, y: -4 }}
                className={`relative bg-gradient-to-br ${offer.color} rounded-[28px] p-8 overflow-hidden cursor-pointer`}
              >
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />

                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-white/70">{offer.tag}</span>
                  </div>

                  <h3 className={`text-xl font-display font-bold mb-3 ${offer.textColor}`}>{offer.title}</h3>
                  <p className={`text-sm leading-relaxed mb-6 ${offer.textColor} opacity-80`}>{offer.desc}</p>

                  <div className="flex items-center gap-3">
                    <div className={`flex-1 px-4 py-2.5 rounded-xl ${offer.codeColor} flex items-center gap-2`}>
                      <Tag className="w-4 h-4 opacity-70" />
                      <span className="font-display font-bold tracking-widest text-sm">{offer.code}</span>
                    </div>
                    <button
                      onClick={() => copyCode(offer.code)}
                      className="px-4 py-2.5 bg-white text-neutral-dark text-xs font-bold rounded-xl hover:bg-neutral-100 transition-colors active:scale-95"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default OffersSection;
