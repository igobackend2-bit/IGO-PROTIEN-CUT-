import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Calendar, User, ArrowRight, Tag, Search, TrendingUp, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../sections/Footer';

const blogPosts = [
  {
    id: 1,
    title: "The Science of Freshness: Why 'Never Frozen' Matters",
    excerpt: "Discover how IGO maintains the farm-to-fork chain without ever freezing your protein, ensuring peak nutrient density and flavor.",
    author: "Chef K. Ramesh",
    date: "May 15, 2026",
    category: "Food Science",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800",
    readTime: "6 min read"
  },
  {
    id: 2,
    title: "5 Authentic Chettinad Recipes for Your Next Sunday Lunch",
    excerpt: "Master the art of spices with these heritage recipes featuring our signature Naattu Kozhi and Mutton cuts.",
    author: "Meenakshi Amma",
    date: "May 12, 2026",
    category: "Recipes",
    image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800",
    readTime: "8 min read"
  },
  {
    id: 3,
    title: "The Ultimate Guide to Choosing the Right Fish Cut",
    excerpt: "From Vanjaram steaks to Salmon fillets, learn which cut works best for frying, steaming, or curries.",
    author: "Expert Fisherman",
    date: "May 10, 2026",
    category: "Guides",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800",
    readTime: "5 min read"
  },
  {
    id: 4,
    title: "Protein for Fitness: Beyond the Chicken Breast",
    excerpt: "Explore high-protein seafood and mutton options that will help you reach your macro goals without getting bored.",
    author: "Rahul Fitness",
    date: "May 08, 2026",
    category: "Health",
    image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800",
    readTime: "7 min read"
  }
];

const BlogPage = () => {
  useEffect(() => {
    document.title = 'Blog — Fresh Meat Tips, Recipes & Food Science | IGO Protein Cuts';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', 'Explore IGO Protein Cuts blog for expert recipes, food science, freshness guides, and healthy protein tips. Farm-fresh insights from Coimbatore.');
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', 'https://igoproteincuts.com/blog');
    return () => {
      document.title = 'IGO Protein Cuts — Farm-Fresh Meat Delivery in Coimbatore | Never Frozen';
      if (metaDesc) metaDesc.setAttribute('content', 'Order fresh chicken, mutton, fish & seafood online in Coimbatore. Farm-to-table, never frozen, delivered in 60–90 minutes from heritage Tamil farms. 100% cold chain integrity.');
      if (canonical) canonical.setAttribute('href', 'https://igoproteincuts.com/');
    };
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-neutral-dark pt-32 pb-20 px-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-igo-green/20 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col items-center text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-igo-green/20 text-igo-green px-4 py-2 rounded-full mb-8"
            >
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">IGO Culinary Hub</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-display font-bold text-white mb-6 leading-tight"
            >
              Stories Behind <br />
              <span className="text-igo-green">Every Cut.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-neutral-400 max-w-2xl text-lg mb-12"
            >
              Explore recipes, farm stories, and the science of fresh protein directly from our culinary experts.
            </motion.p>

            <div className="w-full max-w-xl relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input 
                type="text" 
                placeholder="Search articles, recipes, tips..."
                className="w-full pl-14 pr-6 py-5 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-igo-green/40 text-white transition-all"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Bar */}
      <div className="bg-white border-b border-neutral-100 sticky top-[72px] z-30">
        <div className="max-w-7xl mx-auto px-6 overflow-x-auto no-scrollbar flex items-center gap-8 py-4">
          {['All Stories', 'Recipes', 'Food Science', 'Health', 'Farm Stories', 'Guides'].map((cat, i) => (
            <button 
              key={cat}
              className={`text-sm font-bold whitespace-nowrap transition-colors ${i === 0 ? 'text-igo-green' : 'text-neutral-400 hover:text-neutral-600'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {/* Featured Post (Full Width) */}
          <div className="lg:col-span-3">
            <motion.div 
              whileHover={{ y: -5 }}
              className="group relative bg-white rounded-[3rem] overflow-hidden shadow-xl shadow-neutral-200/50 border border-neutral-100 flex flex-col md:flex-row h-full md:h-[450px]"
            >
              <div className="w-full md:w-1/2 h-64 md:h-full overflow-hidden">
                <img 
                  src={blogPosts[0].image} 
                  alt={blogPosts[0].title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="flex-1 p-10 md:p-16 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-6">
                  <span className="bg-igo-green/10 text-igo-green text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                    {blogPosts[0].category}
                  </span>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                    {blogPosts[0].readTime}
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-neutral-dark mb-6 leading-tight">
                  {blogPosts[0].title}
                </h2>
                <p className="text-neutral-500 mb-10 text-lg leading-relaxed line-clamp-3">
                  {blogPosts[0].excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center font-bold text-neutral-400">
                      {blogPosts[0].author[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-neutral-dark">{blogPosts[0].author}</p>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{blogPosts[0].date}</p>
                    </div>
                  </div>
                  <button className="w-12 h-12 bg-igo-green text-white rounded-2xl flex items-center justify-center hover:scale-110 transition-transform">
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Regular Posts */}
          {blogPosts.slice(1).map((post, i) => (
            <motion.div 
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="group bg-white rounded-[2.5rem] overflow-hidden shadow-xl shadow-neutral-200/40 border border-neutral-100 flex flex-col"
            >
              <div className="h-60 overflow-hidden relative">
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-neutral-dark text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                  {post.category}
                </div>
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-4 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                  <Calendar className="w-3.5 h-3.5" />
                  {post.date}
                  <span className="w-1 h-1 bg-neutral-200 rounded-full" />
                  {post.readTime}
                </div>
                <h3 className="text-xl font-bold text-neutral-dark mb-4 leading-tight group-hover:text-igo-green transition-colors">
                  {post.title}
                </h3>
                <p className="text-neutral-500 text-sm mb-8 line-clamp-3 leading-relaxed flex-1">
                  {post.excerpt}
                </p>
                <div className="pt-6 border-t border-neutral-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-neutral-400" />
                    <span className="text-[11px] font-bold text-neutral-600">{post.author}</span>
                  </div>
                  <button className="text-igo-green font-bold text-xs flex items-center gap-1 group-hover:gap-2 transition-all">
                    Read More <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Newsletter In-feed */}
        <div className="mt-20 bg-igo-green rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <Sparkles className="w-12 h-12 text-igo-gold mx-auto mb-6" />
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">Want more meat-loving tips?</h2>
            <p className="text-white/70 max-w-xl mx-auto mb-10">Join 12,000+ home chefs who receive our weekly "Freshness Bulletin" with exclusive recipes and early-bird offers.</p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input 
                type="email" 
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 rounded-2xl bg-white/20 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button className="bg-white text-igo-green px-8 py-4 rounded-2xl font-bold hover:bg-igo-gold hover:text-white transition-all shadow-xl">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPage;
