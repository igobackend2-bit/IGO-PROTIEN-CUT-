import React, { useState } from 'react';
import { MapPin, Thermometer, QrCode, ShieldCheck, ArrowRight, CheckCircle2, Clock } from 'lucide-react';

interface TraceResult {
  batchId: string;
  farmName: string;
  farmLocation: string;
  cutDate: string;
  handler: string;
  tempLog: string;
  status: 'verified';
}

const features = [
  {
    icon: MapPin,
    title: 'Verified Origins',
    desc: 'Traced back to heritage farms across South India.',
    cta: 'View Network'
  },
  {
    icon: Thermometer,
    title: 'Cold Chain Transparency',
    desc: 'Real-time temperature logs (0-4°C) for your specific batch.',
    cta: 'Live Status'
  },
  {
    icon: QrCode,
    title: 'Scan & See Everything',
    desc: 'Every pack comes with a QR code — know the farm, date, and handler.',
    cta: 'Try Lookup'
  },
  {
    icon: ShieldCheck,
    title: 'Food Safety Certified',
    desc: 'ISO 22000, HACCP, and hygiene standards rigorously verified.',
    cta: 'View Certs'
  }
];

export const TraceabilitySection: React.FC = () => {
  const [batchId, setBatchId] = useState('');
  const [result, setResult] = useState<TraceResult | null>(null);

  const handleTrace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchId.trim()) return;
    setResult({
      batchId: batchId.trim().toUpperCase(),
      farmName: 'High Meadows Heritage Farm',
      farmLocation: 'Nilgiris Range, Tamil Nadu',
      cutDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      handler: 'Certified Butcher #IGO-041',
      tempLog: '2.1°C - 3.4°C (within 0-4°C range, zero breaks)',
      status: 'verified'
    });
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Trust Your Protein</span>
        <h2 className="text-2xl sm:text-3xl font-black text-[#0A1F12] tracking-tight">
          Know Your Source. Trust Your Cut.
        </h2>
        <p className="text-xs sm:text-sm text-neutral-600">
          Our technology-driven traceability system provides complete farm-to-table transparency. Every pack carries a batch ID you can verify instantly.
        </p>
      </div>

      {/* Batch ID Lookup Panel */}
      <div className="bg-[#0A1F12] rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 max-w-xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 bg-emerald-950 border border-emerald-800 px-3 py-1 rounded-full text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> 0-4°C Supply Chain Integrity
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">Trace Your Pack's Journey</h3>
          <form onSubmit={handleTrace} className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              placeholder="Enter Batch ID (e.g., IGO-9421) to verify..."
              className="w-full bg-white border border-neutral-200 rounded-2xl px-4 py-3 text-sm text-[#0A1F12] focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="w-full sm:w-auto shrink-0 bg-[#0F7B3A] hover:bg-emerald-500 text-white font-black px-6 py-3 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer"
            >
              Trace Now <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {result && (
            <div className="bg-white/5 border border-emerald-800 rounded-2xl p-5 text-left space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-emerald-900 pb-3">
                <span className="font-mono font-black text-emerald-400 text-sm">Batch #{result.batchId}</span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 uppercase bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> Verified
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-300">
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{result.farmName}, {result.farmLocation}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Cut & packed: {result.cutDate}</span>
                </div>
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{result.handler}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Thermometer className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{result.tempLog}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((f) => (
          <div key={f.title} className="bg-white border border-neutral-200 rounded-2xl p-5 space-y-3 shadow-sm hover:shadow-md transition">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <f.icon className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-[#0A1F12] text-sm">{f.title}</h4>
            <p className="text-xs text-neutral-500 leading-relaxed">{f.desc}</p>
            <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer">
              {f.cta} <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};
