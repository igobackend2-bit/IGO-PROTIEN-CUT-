import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronRight, ChevronLeft, ShieldCheck, Truck, Star,
  Users, Package, MapPin, CheckCircle2, Flame, QrCode
} from 'lucide-react';

/* ─── Serviceable Pincodes ─────────────────────────────────────────── */
const SERVICEABLE_PINCODES = [
  '641001','641002','641003','641004','641005','641006','641007','641008',
  '641009','641010','641011','641012','641013','641014','641015','641016',
  '641017','641018','641019','641020','600001','600002','600003','560001','560002',
];

/* ─── Pincode Checker ───────────────────────────────────────────────── */
const PincodeChecker = () => {
  const [pincode, setPincode] = useState('');
  const [result, setResult] = useState<'available' | 'unavailable' | null>(null);

  const check = () => {
    if (pincode.length === 6) {
      setResult(SERVICEABLE_PINCODES.includes(pincode) ? 'available' : 'unavailable');
    }
  };

  return (
    <div className="mb-6">
      <div className="flex gap-2 max-w-xs">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            maxLength={6}
            placeholder="Enter pincode"
            value={pincode}
            onChange={e => { setPincode(e.target.value.replace(/\D/g, '')); setResult(null); }}
            onKeyDown={e => e.key === 'Enter' && check()}
            className="w-full pl-9 pr-4 py-2.5 border-2 border-neutral-200 rounded-xl text-sm font-medium focus:border-igo-green focus:outline-none transition-colors bg-white"
          />
        </div>
        <button
          onClick={check}
          disabled={pincode.length !== 6}
          className="px-4 py-2.5 bg-igo-green text-white text-sm font-bold rounded-xl hover:bg-igo-green/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
        >
          Check
        </button>
      </div>
      <AnimatePresence>
        {result && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mt-2 text-xs font-bold flex items-center gap-1.5 ${result === 'available' ? 'text-igo-green' : 'text-red-500'}`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {result === 'available'
              ? `✓ ${pincode} — Delivery available in 60–90 mins!`
              : `✗ Sorry, ${pincode} is not in our delivery zone yet.`}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── Animated stat counter ────────────────────────────────────────── */
const stats = [
  { value: 10000, label: 'Happy Customers', suffix: '+', icon: Users },
  { value: 44,    label: 'Farm Products',   suffix: '',  icon: Package },
  { value: 100,   label: 'Cold Chain',      suffix: '%', icon: Truck },
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
    <div className="flex items-center gap-2.5">
      <div className="w-9 h-9 rounded-xl bg-igo-green/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4.5 h-4.5 text-igo-green" />
      </div>
      <div>
        <div className="font-display font-bold text-lg leading-none text-neutral-dark">
          {count.toLocaleString()}{suffix}
        </div>
        <div className="text-[11px] text-neutral-500 font-medium mt-0.5">{label}</div>
      </div>
    </div>
  );
};

/* ─── Flash Sale Countdown ──────────────────────────────────────────── */
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
    <div className="flex items-center gap-2.5 bg-red-500 text-white px-3.5 py-2 rounded-xl shadow-lg shadow-red-500/25 mb-5 w-fit">
      <Flame className="w-4 h-4 fill-white flex-shrink-0" />
      <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Flash Sale Ends In:</span>
      <div className="flex gap-1 font-display font-bold text-sm">
        <span>{timeLeft.h.toString().padStart(2, '0')}h</span>
        <span className="opacity-50">:</span>
        <span>{timeLeft.m.toString().padStart(2, '0')}m</span>
        <span className="opacity-50">:</span>
        <span>{timeLeft.s.toString().padStart(2, '0')}s</span>
      </div>
    </div>
  );
};

/* ─── Slides data ───────────────────────────────────────────────────── */
const slides = [
  {
    id: 1,
    image: '/images/narrative/farm.png',
    tag: 'Heritage Tamil Farms',
    title: (
      <>Farm-Fresh <br />
        <span className="text-igo-green">Proteins, Traced</span> <br />
        Every Step.
      </>
    ),
    desc: 'Never Frozen. Always Fresh. Always Traced. Same-day delivery from heritage Tamil farms with 100% cold-chain integrity.',
    badgeIcon: ShieldCheck,
    badgeColor: 'text-igo-green',
    badgeBg: 'bg-igo-green/10',
    badgeLabel: 'Verified Origin',
    badgeTitle: 'High Meadows Farm',
    badgeDesc: 'Certified heritage pastures in the Nilgiris range.',
  },
  {
    id: 2,
    image: '/images/narrative/facility.png',
    tag: 'Cold-Chain Integrity',
    title: (
      <>Pure <br />
        <span className="text-blue-500">Cold-Chain</span>.
      </>
    ),
    desc: 'Never frozen, always chilled. 0–4°C integrity from farm to fork. Absolute freshness, guaranteed.',
    badgeIcon: Truck,
    badgeColor: 'text-blue-500',
    badgeBg: 'bg-blue-500/10',
    badgeLabel: 'Cold Chain Log',
    badgeTitle: 'Locked at 2.4°C',
    badgeDesc: 'Real-time GPS tracking with temperature sensors.',
  },
  {
    id: 3,
    image: '/images/narrative/packaging.png',
    tag: 'Total Traceability',
    title: (
      <>Total <br />
        <span className="text-igo-gold">Traceability</span>.
      </>
    ),
    desc: 'Scan the QR code on your pack to see the exact journey of your meat and its quality metrics.',
    badgeIcon: QrCode,
    badgeColor: 'text-igo-gold',
    badgeBg: 'bg-igo-gold/10',
    badgeLabel: 'Scan & Trace',
    badgeTitle: 'Batch #IGO-9421',
    badgeDesc: 'Scan your pack to see the complete journey log.',
  },
];

/* ─── Hero ──────────────────────────────────────────────────────────── */
const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [statsStarted, setStatsStarted] = useState(false);
  const [direction, setDirection] = useState(0);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentSlide(prev => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    const t = setInterval(nextSlide, 5000);
    return () => clearInterval(t);
  }, [nextSlide]);

  useEffect(() => {
    const t = setTimeout(() => setStatsStarted(true), 800);
    return () => clearTimeout(t);
  }, []);

  const slide = slides[currentSlide];
  const BadgeIcon = slide.badgeIcon;

  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden bg-white">

      {/* ── Background slideshow ── */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence>
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <img
              src={slide.image}
              alt={slide.tag}
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            {/* Full-width mobile gradient; right-half fade on desktop */}
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/10 lg:from-white/98 lg:via-white/80 lg:to-white/10" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Main grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 w-full grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">

        {/* ── LEFT: Content ── */}
        <div>
          {/* Delivery badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-4"
          >
            <div className="inline-flex items-center gap-2 bg-igo-green/10 border border-igo-green/20 px-3.5 py-1.5 rounded-full mb-4">
              <div className="w-2 h-2 rounded-full bg-igo-green animate-pulse" />
              <span className="text-[10px] sm:text-xs font-bold text-igo-green uppercase tracking-wider">
                Delivering in 60–90 mins · Free above ₹499
              </span>
            </div>
            <FlashSaleCountdown />
          </motion.div>

          {/* Slide content */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentSlide}
              custom={direction}
              initial={{ opacity: 0, x: direction >= 0 ? 40 : -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction >= 0 ? -40 : 40 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
            >
              {/* Tag */}
              <div className="flex items-center gap-2 mb-3">
                <span className="h-px w-8 bg-igo-gold" />
                <span className="text-igo-gold font-bold text-[10px] uppercase tracking-[0.2em]">
                  {slide.tag}
                </span>
              </div>

              {/* Heading */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-extrabold text-neutral-dark leading-[1.05] mb-4 tracking-tighter">
                {slide.title}
              </h1>

              {/* Description */}
              <p className="text-neutral-600 text-sm sm:text-base max-w-lg mb-5 leading-relaxed font-medium">
                {slide.desc}
              </p>

              {/* Slide-1 extras */}
              {currentSlide === 0 && (
                <>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-igo-gold text-igo-gold" />
                      ))}
                    </div>
                    <span className="font-bold text-neutral-dark text-sm">4.9</span>
                    <span className="text-neutral-400 text-xs">from 12,000+ verified reviews</span>
                  </div>
                  <PincodeChecker />
                  <div className="flex flex-wrap gap-4 pt-4 border-t border-neutral-100">
                    {stats.map(stat => (
                      <StatCard key={stat.label} {...stat} started={statsStarted} />
                    ))}
                  </div>
                </>
              )}

              {/* Slide 2 & 3 trust badges */}
              {currentSlide > 0 && (
                <div className="flex flex-wrap gap-3 mt-2">
                  {['Never Frozen', '0–4°C Guaranteed', 'FSSAI Certified'].map(tag => (
                    <span key={tag} className="text-xs font-bold bg-igo-green/10 text-igo-green px-3 py-1.5 rounded-full border border-igo-green/20">
                      ✓ {tag}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* CTA Buttons — always visible */}
          <div className="flex flex-wrap gap-3 mt-8">
            <a href="/#products">
              <button className="group bg-igo-green text-white px-6 py-3.5 rounded-2xl font-bold flex items-center gap-2 hover:bg-igo-green/90 transition-all shadow-xl shadow-igo-green/20 active:scale-95 text-sm">
                Shop Fresh Now
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </a>
            <a href="#b2b">
              <button className="bg-white/80 backdrop-blur-sm text-neutral-dark border-2 border-neutral-200 px-6 py-3.5 rounded-2xl font-bold hover:border-igo-gold hover:text-igo-gold transition-all active:scale-95 text-sm">
                B2B Bulk Orders
              </button>
            </a>
          </div>
        </div>

        {/* ── RIGHT: Slide image card ── */}
        <div className="hidden lg:flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -20 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="relative w-full max-w-[520px]"
            >
              {/* Main image card */}
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl aspect-[4/3]">
                <img
                  src={slide.image}
                  alt={slide.tag}
                  className="w-full h-full object-cover"
                />
                {/* Bottom gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                {/* Bottom label */}
                <div className="absolute bottom-5 left-5 right-5">
                  <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{slide.tag}</span>
                  <p className="text-white font-display font-bold text-lg mt-0.5 leading-tight">{slide.badgeTitle}</p>
                </div>
              </div>

              {/* Floating info badge — top right */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="absolute -top-4 -right-4 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/60 max-w-[200px]"
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <div className={`p-2 ${slide.badgeBg} rounded-xl`}>
                    <BadgeIcon className={`w-4 h-4 ${slide.badgeColor}`} />
                  </div>
                  <span className="font-bold text-[10px] uppercase tracking-widest text-neutral-400">{slide.badgeLabel}</span>
                </div>
                <div className="font-display font-bold text-sm text-neutral-dark">{slide.badgeTitle}</div>
                <div className="text-[11px] text-neutral-400 mt-1 leading-snug">{slide.badgeDesc}</div>
              </motion.div>

              {/* Floating delivery badge — bottom left */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="absolute -bottom-4 -left-4 bg-igo-green text-white px-4 py-3 rounded-2xl shadow-lg shadow-igo-green/30 flex items-center gap-2.5"
              >
                <Truck className="w-4 h-4" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Delivery Time</p>
                  <p className="font-display font-bold text-sm">60–90 Minutes</p>
                </div>
              </motion.div>

              {/* Slide indicator dots on image */}
              <div className="absolute bottom-[-2rem] left-1/2 -translate-x-1/2 flex gap-1.5">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setDirection(i > currentSlide ? 1 : -1); setCurrentSlide(i); }}
                    className={`h-1.5 rounded-full transition-all duration-500 ${i === currentSlide ? 'w-6 bg-igo-green' : 'w-1.5 bg-neutral-300 hover:bg-neutral-400'}`}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Bottom slide navigation (mobile) ── */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex items-center gap-6 lg:hidden">
        <button
          onClick={prevSlide}
          className="p-2.5 rounded-full border border-neutral-200 hover:bg-igo-green hover:text-white hover:border-igo-green transition-all active:scale-90 bg-white/70 backdrop-blur-sm"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => { setDirection(i > currentSlide ? 1 : -1); setCurrentSlide(i); }}
              className={`h-2 rounded-full transition-all duration-500 ${i === currentSlide ? 'w-7 bg-igo-green' : 'w-2 bg-neutral-300'}`}
            />
          ))}
        </div>
        <button
          onClick={nextSlide}
          className="p-2.5 rounded-full border border-neutral-200 hover:bg-igo-green hover:text-white hover:border-igo-green transition-all active:scale-90 bg-white/70 backdrop-blur-sm"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
};

export default Hero;
