import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Crown, Zap, Truck, ShieldCheck, ChevronRight, Star, Loader2, CheckCircle2 } from 'lucide-react';

declare global {
  interface Window { Razorpay: any; }
}

const PRIME_PRICE = 499;

const benefits = [
  { icon: Truck,      title: 'Zero Delivery Fees', desc: 'Unlimited free delivery on all orders above ₹199.' },
  { icon: Zap,        title: 'Priority Slots',      desc: 'Get your protein in under 30 mins with dedicated Prime riders.' },
  { icon: ShieldCheck,title: 'Prime Only Cuts',     desc: 'Exclusive access to Heritage Farm batches and dry-aged steaks.' },
  { icon: Star,       title: 'Cashback Rewards',    desc: 'Flat 5% cashback on every purchase, credited instantly.' },
];

const loadRazorpay = (): Promise<boolean> => new Promise(resolve => {
  if (window.Razorpay) { resolve(true); return; }
  const s = document.createElement('script');
  s.src = 'https://checkout.razorpay.com/v1/checkout.js';
  s.onload = () => resolve(true);
  s.onerror = () => resolve(false);
  document.body.appendChild(s);
});

const IGOPrime = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPrimeMember, setIsPrimeMember] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    const checkPrimeStatus = async () => {
      try {
        const userRaw = localStorage.getItem('igo_user');
        if (!userRaw) { setCheckingStatus(false); return; }
        const user = JSON.parse(userRaw);
        if (!user.email) { setCheckingStatus(false); return; }

        const { supabase, isSupabaseConfigured } = await import('../lib/supabase');
        if (!isSupabaseConfigured) { setCheckingStatus(false); return; }

        const { data } = await supabase
          .from('profiles')
          .select('is_prime_member')
          .eq('email', user.email)
          .maybeSingle();

        if (data?.is_prime_member) setIsPrimeMember(true);
      } catch (err) {
        console.error('Prime status check failed:', err);
      } finally {
        setCheckingStatus(false);
      }
    };
    checkPrimeStatus();
  }, []);

  const activatePrimeMembership = async (email: string) => {
    const { supabase } = await import('../lib/supabase');
    const { error } = await supabase
      .from('profiles')
      .upsert(
        { email, is_prime_member: true, prime_since: new Date().toISOString(), updated_at: new Date().toISOString() },
        { onConflict: 'email' }
      );
    if (error) throw error;
  };

  const handleJoinPrime = async () => {
    const userRaw = localStorage.getItem('igo_user');
    if (!userRaw) {
      alert('Please sign in first to join IGO Prime.');
      return;
    }
    const user = JSON.parse(userRaw);
    if (!user.email) {
      alert('Please sign in with an email address to join IGO Prime.');
      return;
    }

    setIsProcessing(true);
    const loaded = await loadRazorpay();
    if (!loaded) {
      alert('Payment gateway failed to load. Please try again.');
      setIsProcessing(false);
      return;
    }

    const rzp = new window.Razorpay({
      key:         import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
      amount:      PRIME_PRICE * 100,
      currency:    'INR',
      name:        'IGO Protein Cuts',
      description: 'IGO Prime — Annual Membership',
      image:       '/logo.png',
      prefill:     { name: user.name || '', email: user.email, contact: user.phone || '' },
      theme:       { color: '#D4AF37' },
      handler: async () => {
        try {
          await activatePrimeMembership(user.email);
          setIsPrimeMember(true);
        } catch (err) {
          console.error('Failed to activate Prime membership:', err);
          alert('Payment succeeded, but we could not activate your membership automatically. Please contact support with your payment reference.');
        } finally {
          setIsProcessing(false);
        }
      },
      modal: { ondismiss: () => setIsProcessing(false) },
    });
    rzp.open();
  };

  return (
    <section id="prime" className="py-24 relative overflow-hidden bg-neutral-dark">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-igo-gold/10 rounded-full blur-[120px] -z-0" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-igo-green/10 rounded-full blur-[120px] -z-0" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-igo-gold/10 border border-igo-gold/20 mb-8">
              <Crown className="w-4 h-4 text-igo-gold fill-igo-gold" />
              <span className="text-igo-gold font-bold text-xs uppercase tracking-widest">The Gold Standard</span>
            </div>

            <h2 className="text-5xl md:text-6xl font-display font-bold text-white leading-tight">
              Join the <span className="text-gradient-gold">Elite.</span> <br />
              Become IGO <span className="text-igo-gold">Prime.</span>
            </h2>

            <p className="mt-8 text-neutral-400 text-lg leading-relaxed max-w-lg">
              Unlock the ultimate meat-buying experience. Faster delivery,
              exclusive cuts, and zero fees. It's more than a membership—it's a commitment to quality.
            </p>

            <div className="mt-12 flex flex-col sm:flex-row gap-6">
              {isPrimeMember ? (
                <div className="px-10 py-5 bg-igo-green/10 border border-igo-green/30 text-igo-green font-bold rounded-2xl flex items-center justify-center gap-3">
                  <CheckCircle2 className="w-5 h-5" />
                  You're an IGO Prime Member
                </div>
              ) : (
                <button
                  onClick={handleJoinPrime}
                  disabled={isProcessing || checkingStatus}
                  className="px-10 py-5 bg-igo-gold text-neutral-dark font-bold rounded-2xl hover:scale-105 transition-all shadow-2xl shadow-igo-gold/20 flex items-center justify-center gap-3 group disabled:opacity-60 disabled:hover:scale-100"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Join Now at &#8377;{PRIME_PRICE}/year
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              )}
              <a
                href="#prime"
                className="px-10 py-5 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-all backdrop-blur-md text-center"
              >
                View All Benefits
              </a>
            </div>

            <p className="mt-6 text-sm text-neutral-500">*Cancel anytime. 30-day money back guarantee.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-10 lg:mt-0">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="glass-dark p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] group hover:border-igo-gold/30 transition-all duration-500"
                >
                  <div className="w-14 h-14 rounded-2xl bg-igo-gold/10 flex items-center justify-center text-igo-gold mb-6 group-hover:scale-110 transition-transform">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{benefit.title}</h3>
                  <p className="text-neutral-500 text-sm leading-relaxed">{benefit.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default IGOPrime;
