import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import { ShieldCheck, MapPin, Wind, QrCode } from 'lucide-react';

const BrandNarrative = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Background image scaling and opacity
  const bgScale = useTransform(smoothProgress, [0, 0.4, 0.6, 1], [1, 1.1, 1.1, 1.2]);
  
  // Content fades
  const opacity1 = useTransform(smoothProgress, [0, 0.2, 0.35], [0, 1, 0]);
  const y1 = useTransform(smoothProgress, [0, 0.2, 0.35], [100, 0, -100]);

  const opacity2 = useTransform(smoothProgress, [0.4, 0.55, 0.7], [0, 1, 0]);
  const y2 = useTransform(smoothProgress, [0.4, 0.55, 0.7], [100, 0, -100]);

  const opacity3 = useTransform(smoothProgress, [0.75, 0.9, 1], [0, 1, 0.8]);
  const y3 = useTransform(smoothProgress, [0.75, 0.9, 1], [100, 0, 0]);

  // Image transitions
  const img1Opacity = useTransform(smoothProgress, [0, 0.35, 0.4], [1, 1, 0]);
  const img2Opacity = useTransform(smoothProgress, [0.35, 0.4, 0.7, 0.75], [0, 1, 1, 0]);
  const img3Opacity = useTransform(smoothProgress, [0.7, 0.75, 1], [0, 1, 1]);

  return (
    <section ref={containerRef} className="relative h-[400vh] bg-neutral-dark">
      {/* Sticky Background Container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Farm Image */}
        <motion.div 
          style={{ opacity: img1Opacity, scale: bgScale }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute inset-0 bg-black/40 z-10" />
          <img 
            src="/images/narrative/farm.png" 
            alt="Heritage Tamil Farms" 
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Facility Image */}
        <motion.div 
          style={{ opacity: img2Opacity, scale: bgScale }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute inset-0 bg-black/50 z-10" />
          <img 
            src="/images/narrative/facility.png" 
            alt="Sterile Cold Chain" 
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Packaging Image */}
        <motion.div 
          style={{ opacity: img3Opacity, scale: bgScale }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute inset-0 bg-black/40 z-10" />
          <img 
            src="/images/narrative/packaging.png" 
            alt="Traceable Packaging" 
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2">
            <p className="text-white/30 text-[10px] uppercase tracking-[0.3em] font-bold">Scroll to Discover</p>
            <div className="w-[1px] h-12 bg-gradient-to-b from-igo-green to-transparent" />
        </div>
      </div>

      {/* Content Overlay - Stage 1: Origin */}
      <div className="relative z-20 h-screen flex items-center justify-center pointer-events-none">
        <motion.div 
          style={{ opacity: opacity1, y: y1 }}
          className="max-w-4xl px-6 text-center"
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-igo-green/20 backdrop-blur-xl border border-igo-green/30 flex items-center justify-center">
              <MapPin className="w-8 h-8 text-igo-green" />
            </div>
          </div>
          <h2 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 leading-tight">
            Rooted in <span className="text-igo-green">Heritage.</span>
          </h2>
          <p className="text-xl md:text-2xl text-white/70 leading-relaxed max-w-2xl mx-auto font-light">
            Our proteins begin their journey in the ancient, lush pastures of Tamil Nadu. 
            We partner with heritage farms that have prioritized soil health and animal 
            welfare for generations.
          </p>
        </motion.div>
      </div>

      {/* Content Overlay - Stage 2: Integrity */}
      <div className="relative z-20 h-screen flex items-center justify-center pointer-events-none">
        <motion.div 
          style={{ opacity: opacity2, y: y2 }}
          className="max-w-4xl px-6 text-center"
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-blue-500/20 backdrop-blur-xl border border-blue-500/30 flex items-center justify-center">
              <Wind className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <h2 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 leading-tight">
            Pure <span className="text-blue-400">Cold-Chain.</span>
          </h2>
          <p className="text-xl md:text-2xl text-white/70 leading-relaxed max-w-2xl mx-auto font-light">
            Never frozen, always chilled. Our ISO-certified sterile facilities maintain 
            a strict 0-4°C environment from the moment of processing until it reaches 
            your doorstep. No compromises.
          </p>
        </motion.div>
      </div>

      {/* Content Overlay - Stage 3: Transparency */}
      <div className="relative z-20 h-screen flex items-center justify-center pointer-events-none">
        <motion.div 
          style={{ opacity: opacity3, y: y3 }}
          className="max-w-4xl px-6 text-center"
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-igo-gold/20 backdrop-blur-xl border border-igo-gold/30 flex items-center justify-center">
              <QrCode className="w-8 h-8 text-igo-gold" />
            </div>
          </div>
          <h2 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 leading-tight">
            Total <span className="text-igo-gold">Traceability.</span>
          </h2>
          <p className="text-xl md:text-2xl text-white/70 leading-relaxed max-w-2xl mx-auto font-light mb-12">
            Every cut comes with a story. Scan the QR code on your package to see the 
            exact farm origin, processing timestamp, and lab-verified quality metrics. 
            Transparency isn't just a feature—it's our promise.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 pointer-events-auto">
            <button className="px-10 py-5 bg-igo-green text-white rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-2xl shadow-igo-green/20">
                Experience the Quality
            </button>
            <div className="flex items-center gap-3 px-6 py-4 glass-dark rounded-full border border-white/10">
                <ShieldCheck className="w-6 h-6 text-igo-green" />
                <span className="text-white font-medium">100% Certified Safe</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BrandNarrative;
