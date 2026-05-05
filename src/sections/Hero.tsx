import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ShieldCheck, Truck, Star, Users, Package, MapPin, CheckCircle2, Flame } from 'lucide-react';

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

const Hero = () => {
  const [statsStarted, setStatsStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStatsStarted(true), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-[88vh] flex items-center overflow-hidden bg-white">
      {/* Background */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-neutral-light -skew-x-12 translate-x-1/4 hidden lg:block" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-igo-green/5 rounded-full blur-3xl" />
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-igo-gold/5 rounded-full blur-3xl hidden lg:block" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 w-full grid lg:grid-cols-2 gap-12 items-center py-16 sm:py-20">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Delivery Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 bg-igo-green/10 border border-igo-green/20 px-4 py-2 rounded-full mb-6"
          >
            <div className="w-2 h-2 rounded-full bg-igo-green animate-pulse" />
            <span className="text-xs font-bold text-igo-green uppercase tracking-wider">
              🚚 Delivering in 60-90 mins · Free above ₹499
            </span>
          </motion.div>

          <FlashSaleCountdown />

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 mb-5"
          >
            <span className="h-px w-8 bg-igo-gold" />
            <span className="text-igo-gold font-bold text-xs uppercase tracking-[0.2em]">
              Established Excellence
            </span>
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-display font-extrabold text-neutral-dark leading-[1.05] mb-6 tracking-tighter">
            Farm-Fresh <br />
            <span className="text-igo-green">Proteins, Traced</span> <br />
            Every Step.
          </h1>

          <p className="text-neutral-500 text-lg md:text-xl max-w-lg mb-8 leading-relaxed font-medium">
            Never Frozen. Always Fresh. <span className="text-igo-gold font-bold">Always Traced.</span> <br />
            Same-day delivery from heritage Tamil farms with 100% cold-chain integrity.
          </p>

          {/* Rating bar */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-igo-gold text-igo-gold" />
              ))}
            </div>
            <span className="font-bold text-neutral-dark">4.9</span>
            <span className="text-neutral-400 text-sm">from 12,000+ verified reviews</span>
          </div>

          <div className="flex flex-wrap gap-4 mb-6">
            <a href="#products">
              <button className="group bg-igo-green text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-igo-green/90 transition-all shadow-xl shadow-igo-green/20 active:scale-95">
                Shop Fresh Now
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </a>
            <a href="#b2b">
              <button className="bg-white text-neutral-dark border-2 border-neutral-200 px-8 py-4 rounded-2xl font-bold hover:border-igo-gold hover:text-igo-gold transition-all active:scale-95">
                B2B Bulk Orders
              </button>
            </a>
          </div>

          {/* Pincode Checker */}
          <PincodeChecker />

          {/* Stats */}
          <div className="flex flex-wrap gap-6 pt-6 border-t border-neutral-100">
            {stats.map(stat => (
              <StatCard key={stat.label} {...stat} started={statsStarted} />
            ))}
          </div>
        </motion.div>

        {/* Right: Hero Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, rotate: 1 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative hidden lg:block"
        >
          <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl z-20 group">
            <div className="absolute inset-0 bg-igo-green/5 mix-blend-multiply pointer-events-none z-10" />
            <img
              src="/images/hero.png"
              alt="Premium Farm-Fresh Protein Cuts"
              className="w-full h-full object-cover aspect-[4/3] group-hover:scale-105 transition-transform duration-700"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1607623814075-e512199b4472?auto=format&fit=crop&q=80&w=1200';
              }}
            />

            {/* Live Trace Overlay */}
            <div className="absolute bottom-5 left-5 right-5 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-white/60 shadow-xl z-20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-igo-green font-bold uppercase tracking-widest leading-none mb-1">Live Trace Data</p>
                  <p className="text-sm font-display font-bold text-neutral-dark">Batch #IGO-7729V | Origin: Tiruppur</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-igo-green animate-pulse" />
                  <span className="text-[10px] font-bold text-igo-green uppercase">Fresh</span>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Verified Badge */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-8 -left-8 bg-white p-5 rounded-2xl shadow-xl z-30 max-w-[190px]"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-igo-green/10 rounded-lg">
                <ShieldCheck className="text-igo-green w-5 h-5" />
              </div>
              <span className="font-bold text-xs uppercase tracking-wider text-neutral-400">Verified Batch</span>
            </div>
            <div className="font-display font-bold text-base text-neutral-dark">Batch #IGO-9421</div>
            <div className="text-[10px] text-neutral-400 mt-1">Traced to: High Meadows Farm</div>
          </motion.div>

          {/* Offer Badge */}
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute -top-6 -right-6 bg-igo-gold text-white p-4 rounded-2xl shadow-xl z-30"
          >
            <p className="text-xs font-bold">First Order</p>
            <p className="text-xl font-display font-extrabold">15% Off</p>
            <p className="text-[10px] opacity-80">Use: IGOFRESH15</p>
          </motion.div>

          {/* Decorative */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-igo-gold/10 rounded-full blur-3xl z-10" />
          <div className="absolute -bottom-20 -right-20 w-64 h-64 border border-igo-green/10 rounded-full z-10" />
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
