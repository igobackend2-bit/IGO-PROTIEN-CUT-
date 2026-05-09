import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Factory, Truck, Home, CheckCircle2, X, ChevronRight, ThermometerSnowflake, Loader2 } from 'lucide-react';

const Traceability3D = React.lazy(() => import('../components/3d/Traceability3D'));

const pillars = [
  {
    id: 'farm',
    icon: Home,
    title: 'From Verified Farms',
    desc: 'Every product sourced from IGO-certified partner farms across South India.',
    action: 'View Network'
  },
  {
    id: 'cold',
    icon: Truck,
    title: 'Temperature Locked',
    desc: 'Real-time monitoring from farm to your fridge. 0–4°C guaranteed.',
    action: 'Live Status'
  },
  {
    id: 'scan',
    icon: Search,
    title: 'Scan & See Everything',
    desc: 'Every pack comes with a QR code. Know the farm, date, and handler.',
    action: 'Try Lookup'
  },
  {
    id: 'safe',
    icon: CheckCircle2,
    title: 'Food Safety Certified',
    desc: 'ISO 22000, HACCP, and hygiene standards rigorously verified.',
    action: 'View Certs'
  }
];

const Traceability = () => {
  const [batchId, setBatchId] = useState('');
  const [showResult, setShowResult] = useState(false);

  const handleTrace = (e: React.FormEvent) => {
    e.preventDefault();
    if (batchId.trim()) {
      setShowResult(true);
    }
  };

  return (
    <section id="traceability" className="py-24 bg-white overflow-hidden scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-igo-green font-bold text-sm uppercase tracking-widest">Trust Your Protein</span>
            <h2 className="text-4xl md:text-5xl font-display font-bold mt-4 text-neutral-dark">
              Know Your Source. <br />
              <span className="text-igo-gold">Trust Your Cut.</span>
            </h2>
            <p className="mt-8 text-neutral-500 text-lg leading-relaxed">
              Our technology-driven traceability system provides complete 
              farm-to-table transparency. Every pack comes with a unique QR code 
              that reveals the journey of your meat—from the specific farm to 
              the temperature logs of its journey.
            </p>
            <div className="mt-10 flex flex-col gap-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-igo-green/10 flex items-center justify-center flex-shrink-0 text-igo-green">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-neutral-dark">Verified Origins</h4>
                  <p className="text-sm text-neutral-400">Traced back to heritage farms in Tamil Nadu & Ooty.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-igo-gold/10 flex items-center justify-center flex-shrink-0 text-igo-gold">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-neutral-dark">Cold Chain Transparency</h4>
                  <p className="text-sm text-neutral-400">View real-time temperature logs (0-4°C) for your specific batch.</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl bg-neutral-dark min-h-[500px]">
               <React.Suspense fallback={
                 <div className="absolute inset-0 flex items-center justify-center">
                   <Loader2 className="w-10 h-10 text-igo-green animate-spin opacity-20" />
                 </div>
               }>
                 <div className="absolute inset-0 z-0">
                    <Traceability3D />
                 </div>
               </React.Suspense>
               
               <div className="absolute inset-0 bg-gradient-to-t from-neutral-dark/80 via-transparent to-transparent z-10 pointer-events-none" />
               
               <div className="absolute bottom-8 left-8 right-8 bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl z-20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-white uppercase tracking-widest mb-1">Interactive Journey</p>
                    <p className="text-sm font-display font-bold text-white">0–4°C Supply Chain Integrity</p>
                  </div>
                  <div className="w-10 h-10 bg-igo-green rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-igo-green/5 rounded-full blur-3xl -z-10" />
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-igo-gold/5 rounded-full blur-3xl -z-10" />
          </motion.div>
        </div>

        {/* Interactive Lookup Tool */}
        <div className="max-w-3xl mx-auto mb-32 relative">
          <form 
            onSubmit={handleTrace}
            className="bg-neutral-light p-2 rounded-2xl flex items-center shadow-inner border border-neutral-200 group focus-within:border-igo-green transition-all"
          >
            <div className="pl-6 text-neutral-400 group-focus-within:text-igo-green transition-colors">
              <Search className="w-5 h-5" />
            </div>
            <input 
              type="text" 
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              placeholder="Enter Batch ID (e.g., IGO-9421) to verify..." 
              className="bg-transparent border-none focus:ring-0 px-4 py-4 flex-1 text-neutral-dark font-medium placeholder:text-neutral-400"
            />
            <button 
              type="submit"
              className="bg-igo-green text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-igo-green/90 transition-all shadow-lg active:scale-95"
            >
              Trace Now
            </button>
          </form>

          {/* Trace Results Modal-style Overlay */}
          <AnimatePresence>
            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className="absolute top-full left-0 right-0 mt-6 z-30"
              >
                <div className="bg-white border border-igo-green/20 shadow-2xl rounded-[32px] p-8 lg:p-12 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-igo-green to-igo-gold" />
                  
                  <button 
                    onClick={() => setShowResult(false)}
                    className="absolute top-8 right-8 text-neutral-300 hover:text-neutral-dark transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="flex flex-col md:flex-row gap-10 items-start">
                    <div className="w-full md:w-1/3">
                      {/* Mini Map Visual */}
                      <div className="aspect-square bg-neutral-100 rounded-2xl mb-6 relative overflow-hidden border border-neutral-200">
                        <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/77.5946,12.9716,10,0/400x400?access_token=mock')] bg-cover opacity-60" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="relative">
                            <div className="absolute -inset-4 bg-igo-green/20 rounded-full animate-ping" />
                            <div className="absolute -inset-8 bg-igo-green/10 rounded-full animate-ping delay-300" />
                            <div className="absolute -inset-12 bg-igo-green/5 rounded-full animate-ping delay-700" />
                            <MapPin className="w-8 h-8 text-igo-green fill-white relative z-10" />
                          </div>
                        </div>
                        <div className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur-md p-2 rounded-lg text-[8px] font-bold text-neutral-500 uppercase tracking-widest text-center">
                          Current Hub: Pollachi, TN
                        </div>
                      </div>

                      <div className="bg-neutral-light rounded-2xl p-6 mb-6">
                        <div className="text-[10px] font-bold text-igo-gold uppercase tracking-[0.2em] mb-2">Verified Batch</div>
                        <div className="text-2xl font-display font-bold text-neutral-dark mb-1">#{batchId.toUpperCase()}</div>
                        <div className="text-xs text-neutral-400">Scan Date: May 04, 2026 • 12:30 PM</div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-sm text-neutral-600">
                          <CheckCircle2 className="w-5 h-5 text-igo-green" />
                          Certified Origin
                        </div>
                        <div className="flex items-center gap-3 text-sm text-neutral-600">
                          <CheckCircle2 className="w-5 h-5 text-igo-green" />
                          Hormone Free
                        </div>
                        <div className="flex items-center gap-3 text-sm text-neutral-600">
                          <CheckCircle2 className="w-5 h-5 text-igo-green" />
                          Cold-Chain Maintaining
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 space-y-8">
                      <div className="relative pl-8 border-l-2 border-neutral-100 space-y-12">
                        {[
                          { title: 'High Meadows Farm', date: 'April 28', status: 'Sourced', location: 'Ooty, India' },
                          { title: 'IGO Center of Excellence', date: 'April 30', status: 'Processed', location: 'Pollachi Facility' },
                          { title: 'Distribution Hub', date: 'May 02', status: 'Shipped', location: 'Coimbatore HQ' }
                        ].map((item, i) => (
                          <div key={i} className="relative group/item">
                            <div className="absolute -left-[37px] top-0 w-4 h-4 rounded-full bg-white border-2 border-igo-green shadow-[0_0_0_4px_white]" />
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-bold text-neutral-dark group-hover/item:text-igo-green transition-colors">{item.title}</h4>
                                <div className="text-xs text-neutral-400 flex items-center gap-2 mt-1">
                                  <MapPin className="w-3 h-3" />
                                  {item.location}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-[10px] font-bold text-igo-green uppercase">{item.status}</div>
                                <div className="text-xs text-neutral-400">{item.date}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Cold Chain Log */}
                      <div className="mt-10 p-6 bg-igo-green/5 border border-igo-green/10 rounded-2xl">
                        <div className="flex items-center gap-2 mb-4">
                          <ThermometerSnowflake className="w-4 h-4 text-igo-green" />
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-igo-green">Cold Chain Log (0-4°C)</h4>
                        </div>
                        <div className="flex justify-between items-end h-16 gap-1">
                          {[2.1, 1.8, 2.4, 2.0, 1.9, 2.2, 2.5, 2.1, 1.7, 2.0].map((temp, i) => (
                            <div 
                              key={i} 
                              className="w-full bg-igo-green/20 rounded-t-sm relative group/bar"
                              style={{ height: `${(temp / 4) * 100}%` }}
                            >
                              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-neutral-dark text-white text-[8px] px-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity">
                                {temp}°
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="mt-3 text-[10px] text-neutral-400 text-center">Consistent temperature maintained for 12h 45m</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Timeline Visual */}
        <div className="grid lg:grid-cols-4 gap-8">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group h-full"
              >
                <div className="bg-neutral-light/50 p-8 rounded-[2rem] border border-transparent group-hover:border-igo-green/20 group-hover:bg-white group-hover:shadow-2xl transition-all duration-500 h-full flex flex-col items-start text-left">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-neutral-100 flex items-center justify-center text-neutral-400 group-hover:bg-igo-green group-hover:text-white group-hover:border-igo-green transition-all duration-500 mb-8">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-neutral-dark leading-tight">{pillar.title}</h3>
                  <p className="text-neutral-500 text-sm leading-relaxed mb-8 flex-1">
                    {pillar.desc}
                  </p>
                  <button className="text-igo-gold hover:text-igo-green font-bold text-xs uppercase tracking-[0.2em] transition-colors flex items-center gap-2 group/btn">
                    {pillar.action}
                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Traceability;
