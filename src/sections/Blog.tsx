import React from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, ChevronRight, ArrowRight } from 'lucide-react';

const posts = [
  {
    title: 'The Art of Cold Chain: Maintaining 0-4°C from Farm to Door',
    category: 'Logistics',
    date: 'May 12, 2026',
    readTime: '6 min read',
    image: '/images/blog-cold-chain.png'
  },
  {
    title: 'Why Fresh (Never Frozen) Poultry Retains Better Nutrients',
    category: 'Nutrition',
    date: 'May 08, 2026',
    readTime: '8 min read',
    image: '/images/blog-fresh-poultry.png'
  },
  {
    title: 'Traceability API: Transforming B2B Restaurant Supply Chains',
    category: 'Business',
    date: 'May 05, 2026',
    readTime: '4 min read',
    image: '/images/blog-b2b-supply.png'
  }
];

const Blog = () => {
  return (
    <section id="blog" className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-end mb-12">
          <div>
            <span className="text-igo-green font-bold text-sm uppercase tracking-widest">Insights</span>
            <h2 className="text-4xl font-display font-bold mt-4 text-neutral-dark">The Cutting Edge</h2>
          </div>
          <button className="hidden md:flex items-center gap-2 text-igo-gold font-bold hover:text-igo-green transition-colors group">
            View All Stories
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 sm:gap-10">
          {posts.map((post, i) => (
            <motion.article
              key={post.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="group cursor-pointer"
            >
              <div className="rounded-[2rem] overflow-hidden mb-6 aspect-[4/3] relative bg-neutral-100">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1586528116311-ad86d34b3e64?auto=format&fit=crop&q=80&w=800';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-igo-green">
                  {post.category}
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-neutral-400 mb-4 font-medium">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {post.date}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {post.readTime}
                </div>
              </div>

              <h3 className="text-xl font-bold text-neutral-dark group-hover:text-igo-green transition-colors leading-snug mb-4">
                {post.title}
              </h3>

              <div className="flex items-center gap-2 text-igo-gold font-bold text-sm opacity-0 group-hover:opacity-100 translate-x-[-8px] group-hover:translate-x-0 transition-all duration-300">
                <span>Read Article</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Blog;
