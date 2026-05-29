import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, ShieldCheck, Truck, Star, Users, Package, MapPin, CheckCircle2, Flame, QrCode, Loader2 } from 'lucide-react';



const SERVICEABLE_PINCODES = ['641001', '641002', '641003', '641004', '641005', '641006', '641007', '641008', '641009', '641010', '641011', '641012', '641013', '641014', '641015', '641016', '641017', '641018', '641019', '641020', '600001', '600002', '600003', '560001', '560002'];

const PincodeChecker = () => {
  const [pincode, setPincode] = useState('');
  const [result, setResult] = useState<'available' | 'unavailable' | null>(null);

  const check = () => {
    if (pincode.length === 6) {
      setResult(SERVICEABLE_PINCODES.includes(pincode) ? 'available' : 'unavailable');
    }
  };

  return (
    <div className="mb-8">
      <div className="flex gap-2 max-w-sm">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            maxLength={6}
            placeholder="Enter pincode"
            value={pincode}
            onChange={(e) => { setPincode(e.target.value.replace(/\D/, '')); setResult(null); }}
            onKeyDown={(e) => e.key === 'Enter' && check()}
            className="w-full pl-9 pr-4 py-3 border-2 border-neutral-200 rounded-xl text-sm font-medium focus:border-igo-green focus:outline-none transition-colors"
          />
        </div>
        <button
          onClick={check}
          disabled={pincode.length !== 6}
          className="px-5 py-3 bg-igo-green text-white text-sm font-bold rounded-xl hover:bg-igo-green/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
        >
          Check
        </button>
      </div>
      <AnimatePresence>
        {result && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mt-2 text-xs font-bold flex items-center gap-1.5 ${result === 'available' ? 'text-igo-green' : 'text-red-500'}`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {result === 'available'
              ? `✓ ${pincode} — Delivery available in 60-90 mins!`
              : `✗ Sorry, ${pincode} is not in our delivery zone yet.`}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

const stats = [
  { value: 10000, label: 'Happy Customers', suffix: '+', icon: Users },
  { value: 44, label: 'Farm Products', suffix: '', icon: Package },
  { value: 100, label: 'Cold Chain', suffix: '%', icon: Truck },
];

const useCountUp = (target: number, duration = 2000, start = false) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
};

const StatCard = ({ value, label, suffix, icon: Icon, started }: any) => {
  const count = useCountUp(value, 2000, started);
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-igo-green/10 flex items-center justify-center">
        <Icon className="w-5 h-5 text-igo-green" />
      </div>
      <div>
        <div className="font-display font-bold text-xl text-neutral-dark">
          {count.toLocaleString()}{suffix}
        </div>
        <div className="text-xs text-neutral-500 font-medium">{label}</div>
      </div>
    </div>
  );
};

const FlashSaleCountdown = () => {
  const [timeLeft, setTimeLeft] = useState({ h: 2, m: 45, s: 12 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.s > 0) return { ...prev, s: prev.s - 1 };
        if (prev.m > 0) return { h: prev.h, m: prev.m - 1, s: 59 };
        if (prev.h > 0) return { h: prev.h - 1, m: 59, s: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-3 bg-red-500 text-white px-4 py-2 rounded-xl shadow-lg shadow-red-500/20 mb-6 w-fit animate-pulse">
      <Flame className="w-4 h-4 fill-white" />
      <span className="text-[10px] font-bold uppercase tracking-widest">Flash Sale Ends In:</span>
      <div className="flex gap-1.5 font-display font-bold text-sm">
        <span>{timeLeft.h.toString().padStart(2, '0')}h</span>
        <span className="opacity-50">:</span>
        <span>{timeLeft.m.toString().padStart(2, '0')}m</span>
        <span className="opacity-50">:</span>
        <span>{timeLeft.s.toString().padStart(2, '0')}s</span>
      </div>
    </div>
  );
};

const slides = [
  {
    id: 1,
    image: '/images/narrative/farm.png',
    tag: 'Heritage Tamil Farms',
    title: <>Farm-Fresh <br /><span className="text-igo-green">Proteins, Traced</span> <br />Every Step.</>,
    desc: 'Never Frozen. Always Fresh. Always Traced. Same-day delivery from heritage Tamil farms with 100% cold-chain integrity.',
    icon: MapPin,
    accent: 'text-igo-green'
  },
  {
    id: 2,
    image: '/images/narrative/facility.png',
    tag: 'Cold-Chain Integrity',
    title: <>Pure <br /><span className="text-blue-500">Cold-Chain</span>.</>,
    desc: 'Never frozen, always chilled. 0-4°C integrity from farm to fork. Absolute freshness, guaranteed.',
    icon: Truck,
    accent: 'text-blue-500'
  },
  {
    id: 3,
    image: '/images/narrative/packaging.png',
    tag: 'Total Traceability',
    title: <>Total <br /><span className="text-igo-gold">Traceability</span>.</>,
    desc: 'Scan the QR code to see the exact journey of your meat and its quality metrics.',
    icon: QrCode,
    accent: 'text-igo-gold'
  }
];

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [statsStarted, setStatsStarted] = useState(false);
  const [direction, setDirection] = useState(0);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  useEffect(() => {
    const timer = setTimeout(() => setStatsStarted(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const slide = slides[currentSlide];

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-white">
      {/* Background Slideshow */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence>
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <img 
              src={slide.image} 
              alt="Background" 
              className="absolute inset-0 w-full h-full object-cover lg:object-right-top z-0"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/60 to-transparent z-10 lg:w-2/3" />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 w-full grid lg:grid-cols-2 gap-12 items-center py-16 sm:py-20">
        {/* Left Content */}
        <div className="relative">
          {/* Persistent Elements (Don't reset on slide change) */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 bg-igo-green/10 border border-igo-green/20 px-4 py-2 rounded-full mb-4">
              <div className="w-2 h-2 rounded-full bg-igo-green animate-pulse" />
              <span className="text-[10px] sm:text-xs font-bold text-igo-green uppercase tracking-wider">
                🚚 Delivering in 60-90 mins · Free above ₹499
              </span>
            </div>
            <FlashSaleCountdown />
          </div>

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentSlide}
              custom={direction}
              initial={{ opacity: 0, x: direction > 0 ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction > 0 ? -50 : 50 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="h-px w-8 bg-igo-gold" />
                <span className="text-igo-gold font-bold text-[10px] uppercase tracking-[0.2em]">
                  {slide.tag}
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-extrabold text-neutral-dark leading-[1.05] mb-6 tracking-tighter">
                {slide.title}
              </h1>

              <p className="text-neutral-500 text-base sm:text-lg md:text-xl max-w-lg mb-8 leading-relaxed font-medium">
                {slide.desc}
              </p>

              {/* Rating bar (Only on Slide 1 for relevance) */}
              {currentSlide === 0 && (
                <div className="flex items-center gap-3 mb-8">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-igo-gold text-igo-gold" />
                    ))}
                  </div>
                  <span className="font-bold text-neutral-dark">4.9</span>
                  <span className="text-neutral-400 text-xs sm:text-sm">from 12,000+ verified reviews</span>
                </div>
              )}

              {/* Pincode Checker (Only on Slide 1) */}
              {currentSlide === 0 && <PincodeChecker />}

              {/* Stats (Only on Slide 1) */}
              {currentSlide === 0 && (
                <div className="flex flex-wrap gap-6 pt-6 border-t border-neutral-100">
                  {stats.map(stat => (
                    <StatCard key={stat.label} {...stat} started={statsStarted} />
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Persistent Action Buttons */}
          <div className="flex flex-wrap gap-4 mt-8">
            <a href="/#products">
              <button className="group bg-igo-green text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-igo-green/90 transition-all shadow-xl shadow-igo-green/20 active:scale-95 text-sm sm:text-base">
                Shop Fresh Now
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </a>

            <a href="#b2b">
              <button className="bg-white text-neutral-dark border-2 border-neutral-200 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold hover:border-igo-gold hover:text-igo-gold transition-all active:scale-95 text-sm sm:text-base">
                B2B Bulk Orders
              </button>
            </a>
          </div>
             {/* Right: 3D Visualization */}
        <div className="relative hidden lg:flex justify-end items-center h-[600px]">
           <React.Suspense fallback={
             <div className="w-full h-full flex items-center justify-center">
               <Loader2 className="w-12 h-12 text-igo-green animate-spin opacity-20" />
             </div>
           }>
             <div className="w-full h-full relative">

                
                {/* Overlay Contextual Cards */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                   <AnimatePresence mode="wait">
                      <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -20 }}
                        transition={{ duration: 0.8 }}
                        className="relative z-20 pointer-events-auto"
                      >
                        {/* Badge based on slide */}
                        {currentSlide === 0 && (
                          <div className="bg-white/80 backdrop-blur-md p-6 rounded-[2rem] shadow-2xl border border-white/50 max-w-[280px]">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-3 bg-igo-green/10 rounded-xl">
                                <ShieldCheck className="text-igo-green w-6 h-6" />
                              </div>
                              <span className="font-bold text-xs uppercase tracking-widest text-neutral-400">Verified Origin</span>
                            </div>
                            <div className="font-display font-bold text-xl text-neutral-dark">High Meadows Farm</div>
                            <div className="text-sm text-neutral-400 mt-2">Certified heritage pastures in the Nilgiris range.</div>
                          </div>
                        )}

                        {currentSlide === 1 && (
                          <div className="bg-white/80 backdrop-blur-md p-6 rounded-[2rem] shadow-2xl border border-white/50 max-w-[280px]">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-3 bg-blue-500/10 rounded-xl">
                                <Truck className="text-blue-500 w-6 h-6" />
                              </div>
                              <span className="font-bold text-xs uppercase tracking-widest text-neutral-400">Cold Chain Log</span>
                            </div>
                            <div className="font-display font-bold text-xl text-neutral-dark">Locked at 2.4°C</div>
                            <div className="text-sm text-neutral-400 mt-2">Real-time GPS tracking with temperature sensors.</div>
                          </div>
                        )}

                        {currentSlide === 2 && (
                          <div className="bg-white/80 backdrop-blur-md p-6 rounded-[2rem] shadow-2xl border border-white/50 max-w-[280px]">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-3 bg-igo-gold/10 rounded-xl">
                                <QrCode className="text-igo-gold w-6 h-6" />
                              </div>
                              <span className="font-bold text-xs uppercase tracking-widest text-neutral-400">Scan & Trace</span>
                            </div>
                            <div className="font-display font-bold text-xl text-neutral-dark">Batch #IGO-9421</div>
                            <div className="text-sm text-neutral-400 mt-2">Scan your pack to see the complete journey log.</div>
                          </div>
                        )}
                      </motion.div>
                   </AnimatePresence>
                </div>
             </div>
           </React.Suspense>
        </div>        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-center gap-8">
        <button 
          onClick={prevSlide}
          className="p-3 rounded-full border border-neutral-200 hover:bg-igo-green hover:text-white hover:border-igo-green transition-all active:scale-90"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex gap-3">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > currentSlide ? 1 : -1);
                setCurrentSlide(i);
              }}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
                i === currentSlide ? 'w-8 bg-igo-green' : 'bg-neutral-200 hover:bg-neutral-300'
              }`}
            />
          ))}
        </div>

        <button 
          onClick={nextSlide}
          className="p-3 rounded-full border border-neutral-200 hover:bg-igo-green hover:text-white hover:border-igo-green transition-all active:scale-90"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
};

export default Hero;

