import React from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, ChevronRight } from 'lucide-react';

const posts = [
  {
    title: 'The Art of Cold Chain: Maintaining 0-4°C from Farm to Door',
    category: 'Logistics',
    date: 'May 12, 2026',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1586528116311-ad86d34b3e64?auto=format&fit=crop&q=80&w=800'
  },
  {
    title: 'Why Fresh (Never Frozen) Poultry Retains Better Nutrients',
    category: 'Nutrition',
    date: 'May 08, 2026',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800'
  },
  {
    title: 'Traceability API: Transforming B2B Restaurant Supply Chains',
    category: 'Business',
    date: 'May 05, 2026',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800'
  }
];

const Blog = () => {
  return (
    <section id="blog" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-end mb-12">
          <div>
            <span className="text-igo-green font-bold text-sm uppercase tracking-widest">Insights</span>
            <h2 className="text-4xl font-display font-bold mt-4 text-neutral-dark">The Cutting Edge</h2>
          </div>
          <button className="hidden md:flex items-center gap-2 text-igo-gold font-bold hover:text-igo-green transition-colors">
            View All Stories
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {posts.map((post, i) => (
            <motion.article
              key={post.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group cursor-pointer"
            >
              <div className="rounded-[2rem] overflow-hidden mb-6 aspect-[4/3] relative">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  referrerPolicy="no-referrer"
                />
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
              
              <h3 className="text-xl font-bold text-neutral-dark group-hover:text-igo-green transition-colors leading-snug">
                {post.title}
              </h3>
              
              <div className="mt-6 flex items-center gap-2 text-igo-gold group-hover:gap-4 transition-all overflow-hidden w-0 group-hover:w-full opacity-0 group-hover:opacity-100">
                <span className="text-sm font-bold whitespace-nowrap">Read Article</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Blog;
