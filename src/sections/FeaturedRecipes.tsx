import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Users, Play, ChevronRight, X } from 'lucide-react';
import { cn } from '../lib/utils';

const recipes = [
  {
    title: 'Garlic Butter Salmon with Herbs',
    time: '20 mins',
    serves: '2 People',
    image: '/images/products/salmon.png',
    tags: ['Quick', 'Healthy'],
    color: 'from-orange-400 to-pink-500'
  },
  {
    title: 'Heritage Mutton Biryani',
    time: '45 mins',
    serves: '4 People',
    image: '/images/products/mutton-curry.png',
    tags: ['Heritage', 'Authentic'],
    color: 'from-amber-500 to-red-600'
  },
  {
    title: 'Spicy Tiger Prawn Roast',
    time: '15 mins',
    serves: '3 People',
    image: '/images/products/tiger-prawns.png',
    tags: ['Easy', 'Sea Food'],
    color: 'from-teal-400 to-blue-600'
  }
];

const FeaturedRecipes = () => {
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  return (
    <section className="py-16 sm:py-24 bg-neutral-dark text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div>
            <span className="text-igo-gold font-bold text-sm uppercase tracking-widest">Master Your Kitchen</span>
            <h2 className="text-4xl md:text-5xl font-display font-bold mt-4">Cook Like a Chef <br /><span className="text-white/40 text-3xl md:text-4xl">With IGO Premium Cuts</span></h2>
          </div>
          <button className="flex items-center gap-2 text-igo-gold font-bold hover:gap-3 transition-all group">
            View All Recipes <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {recipes.map((recipe, i) => (
            <motion.div
              key={recipe.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="group cursor-pointer"
              onClick={() => setPlayingVideo(recipe.title)}
            >
              <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden mb-6">
                <div className={`absolute inset-0 bg-gradient-to-br ${recipe.color} opacity-20 group-hover:opacity-40 transition-opacity z-10`} />
                <img 
                  src={recipe.image} 
                  alt={recipe.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-dark/90 via-transparent to-transparent z-20" />
                
                <div className="absolute bottom-6 left-6 right-6 z-30">
                  <div className="flex gap-2 mb-3">
                    {recipe.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-xl font-bold mb-4 leading-tight group-hover:text-igo-gold transition-colors">{recipe.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-white/60">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> {recipe.time}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" /> {recipe.serves}
                    </div>
                  </div>
                </div>

                <div className="absolute top-6 right-6 z-30">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 group-hover:bg-igo-gold group-hover:border-igo-gold transition-all">
                    <Play className="w-5 h-5 fill-white" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {playingVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 backdrop-blur-md"
            onClick={() => setPlayingVideo(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-5xl aspect-video bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10" 
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setPlayingVideo(null)}
                className="absolute top-6 right-6 z-20 w-12 h-12 bg-black/50 hover:bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center transition-colors text-white"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className={cn(
                "absolute inset-0 flex flex-col items-center justify-center z-10 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-500",
                playingVideo ? "opacity-100" : "opacity-0"
              )}>
                 <div className="w-20 h-20 bg-igo-gold/20 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm animate-pulse">
                   <Play className="w-8 h-8 text-igo-gold fill-igo-gold ml-1" />
                 </div>
                 <h3 className="text-3xl font-display font-bold text-white mb-3 drop-shadow-lg text-center px-6">{playingVideo}</h3>
                 <p className="text-white/80 font-medium tracking-wide uppercase text-sm">Chef Masterclass Loading...</p>
              </div>

              {/* Video Player */}
              <video 
                autoPlay 
                controls
                playsInline
                loop
                muted
                onPlay={(e) => {
                  const overlay = e.currentTarget.previousElementSibling;
                  if (overlay) (overlay as HTMLElement).style.opacity = '0';
                }}
                className="absolute inset-0 w-full h-full object-cover z-20"
                src="https://player.vimeo.com/external/370331493.sd.mp4?s=7b0373d6932403613970be9078652427a1496a75&profile_id=164&oauth2_token_id=57447761"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default FeaturedRecipes;
