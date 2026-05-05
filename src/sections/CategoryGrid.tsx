import React from 'react';
import { motion } from 'motion/react';
import { Building2 } from 'lucide-react';

const categories = [
  { name: 'Chicken', image: '/images/products/chicken-whole.png', color: 'bg-orange-50 hover:bg-orange-100', borderColor: 'border-orange-200', filter: 'Chicken' },
  { name: 'Mutton', image: '/images/products/mutton-curry.png', color: 'bg-red-50 hover:bg-red-100', borderColor: 'border-red-200', filter: 'Mutton' },
  { name: 'Fish', image: '/images/products/seer-fish.png', color: 'bg-blue-50 hover:bg-blue-100', borderColor: 'border-blue-200', filter: 'Fish' },
  { name: 'Seafood', image: '/images/products/tiger-prawns.png', color: 'bg-teal-50 hover:bg-teal-100', borderColor: 'border-teal-200', filter: 'Seafood' },
  { name: 'Eggs', image: '/images/products/eggs.png', color: 'bg-amber-50 hover:bg-amber-100', borderColor: 'border-amber-200', filter: 'Eggs' },
  { name: 'Exotic', image: '/images/products/quail.png', color: 'bg-purple-50 hover:bg-purple-100', borderColor: 'border-purple-200', filter: 'Exotic' },
  { name: 'B2B', icon: Building2, color: 'bg-neutral-100 hover:bg-neutral-200', borderColor: 'border-neutral-300', filter: 'B2B' },
];

const CategoryGrid = () => {
  const scrollToProducts = (filter: string) => {
    if (filter === 'B2B') {
      const el = document.getElementById('b2b');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    const el = document.getElementById('products');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      window.dispatchEvent(new CustomEvent('categoryFilter', { detail: filter }));
    }
  };

  return (
    <section className="py-12 bg-white border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-center gap-6 sm:gap-10 flex-wrap">
          {categories.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <motion.button
                key={cat.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => scrollToProducts(cat.filter)}
                className="flex flex-col items-center gap-3 group"
              >
                <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center shadow-md group-hover:shadow-xl transition-all duration-300 border-2 ${cat.borderColor} ${cat.color} overflow-hidden`}>
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-14 h-14 sm:w-16 sm:h-16 object-cover group-hover:scale-110 transition-transform duration-500 drop-shadow-md" />
                  ) : Icon ? (
                    <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-neutral-500 group-hover:text-neutral-700 transition-colors" />
                  ) : null}
                </div>
                <span className="text-sm font-bold text-neutral-600 group-hover:text-igo-green transition-colors">
                  {cat.name}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
