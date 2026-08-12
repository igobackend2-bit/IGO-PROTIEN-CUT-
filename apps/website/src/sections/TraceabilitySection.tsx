import React, { useState } from 'react';
import { MapPin, Thermometer, QrCode, ShieldCheck, ArrowRight, CheckCircle2, Clock, XCircle, Loader2 } from 'lucide-react';
import { lookupBatch, BatchTraceRow } from '../lib/api/batchTrace';
import { useLang } from '../lib/language';

interface TraceResult {
  batchId: string;
  productName: string | null;
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

const featuresTa = [
  {
    icon: MapPin,
    title: 'சரிபார்க்கப்பட்ட தோற்றங்கள்',
    desc: 'தென்னிந்தியா முழுவதும் உள்ள பாரம்பரிய பண்ணைகளுக்கு கண்டறியப்பட்டது.',
    cta: 'நெட்வொர்க்கைப் பார்க்கவும்'
  },
  {
    icon: Thermometer,
    title: 'குளிர்சாதன சேமிப்பு வெளிப்படைத்தன்மை',
    desc: 'உங்கள் குறிப்பிட்ட பேட்சுக்கான நேரடி வெப்பநிலை பதிவுகள் (0-4°C).',
    cta: 'நேரடி நிலை'
  },
  {
    icon: QrCode,
    title: 'ஸ்கேன் செய்து அனைத்தையும் பாருங்கள்',
    desc: 'ஒவ்வொரு பாக்கிலும் QR குறியீடு உள்ளது — பண்ணை, தேதி மற்றும் கையாளுநரை அறியுங்கள்.',
    cta: 'தேடலை முயற்சிக்கவும்'
  },
  {
    icon: ShieldCheck,
    title: 'உணவு பாதுகாப்பு சான்றளிக்கப்பட்டது',
    desc: 'ISO 22000, HACCP மற்றும் சுகாதார தரநிலைகள் கடுமையாக சரிபார்க்கப்பட்டன.',
    cta: 'சான்றிதழ்களைப் பார்க்கவும்'
  }
];

const toResult = (row: BatchTraceRow): TraceResult => ({
  batchId: row.batch_id.toUpperCase(),
  productName: row.product_name,
  farmName: row.farm_name,
  farmLocation: row.farm_location,
  cutDate: new Date(row.cut_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
  handler: row.handler,
  tempLog: row.temp_log,
  status: 'verified'
});

export const TraceabilitySection: React.FC = () => {
  const { lang } = useLang();
  const resolvedFeatures = lang === 'ta' ? featuresTa : features;
  const [batchId, setBatchId] = useState('');
  const [result, setResult] = useState<TraceResult | null>(null);
  // Was previously hardcoded to always return the same fake "Verified"
  // result for any input, including nonsense batch IDs — a real trust risk
  // once a customer actually tried it. Now queries the real igo_batch_trace
  // table and shows an honest "not found" state when there's no match.
  const [status, setStatus] = useState<'idle' | 'loading' | 'not_found' | 'error'>('idle');

  const handleTrace = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = batchId.trim();
    if (!trimmed) return;

    setStatus('loading');
    setResult(null);

    const res = await lookupBatch(trimmed);

    if (!res.ok) {
      setStatus('error');
      return;
    }
    if (!res.data) {
      setStatus('not_found');
      return;
    }

    setResult(toResult(res.data));
    setStatus('idle');
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">{lang === 'ta' ? 'உங்கள் புரதத்தை நம்புங்கள்' : 'Trust Your Protein'}</span>
        <h2 className="text-2xl sm:text-3xl font-black text-[#0A1F12] tracking-tight">
          {lang === 'ta' ? 'உங்கள் மூலத்தை அறியுங்கள். உங்கள் வெட்டை நம்புங்கள்.' : 'Know Your Source. Trust Your Cut.'}
        </h2>
        <p className="text-xs sm:text-sm text-neutral-600">
          {lang === 'ta'
            ? 'எங்கள் தொழில்நுட்ப-இயங்கும் கண்காணிப்பு அமைப்பு பண்ணையிலிருந்து மேசைக்கு முழுமையான வெளிப்படைத்தன்மையை வழங்குகிறது. ஒவ்வொரு பாக்கிலும் நீங்கள் உடனடியாக சரிபார்க்கக்கூடிய ஒரு பேட்ச் ஐடி உள்ளது.'
            : 'Our technology-driven traceability system provides complete farm-to-table transparency. Every pack carries a batch ID you can verify instantly.'}
        </p>
      </div>

      {/* Batch ID Lookup Panel */}
      <div className="bg-[#0A1F12] rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 max-w-xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 bg-emerald-950 border border-emerald-800 px-3 py-1 rounded-full text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> {lang === 'ta' ? '0-4°C விநியோக சங்கிலி ஒருமைப்பாடு' : '0-4°C Supply Chain Integrity'}
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">{lang === 'ta' ? 'உங்கள் பாக்கின் பயணத்தைக் கண்டறியுங்கள்' : "Trace Your Pack's Journey"}</h3>
          <form onSubmit={handleTrace} className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              value={batchId}
              onChange={(e) => {
                setBatchId(e.target.value);
                if (status !== 'loading') setStatus('idle');
              }}
              placeholder={lang === 'ta' ? 'சரிபார்க்க பேட்ச் ஐடியை உள்ளிடவும் (உதா. IGO-9421)...' : 'Enter Batch ID (e.g., IGO-9421) to verify...'}
              className="w-full bg-white border border-neutral-200 rounded-2xl px-4 py-3 text-sm text-[#0A1F12] focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full sm:w-auto shrink-0 bg-[#0F7B3A] hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black px-6 py-3 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> {lang === 'ta' ? 'கண்டறிகிறது...' : 'Tracing...'}
                </>
              ) : (
                <>
                  {lang === 'ta' ? 'இப்போது கண்டறியவும்' : 'Trace Now'} <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {status === 'not_found' && (
            <div className="bg-red-950/40 border border-red-800 rounded-2xl p-4 text-left flex items-center gap-2 text-red-300 text-xs font-bold animate-fadeIn">
              <XCircle className="w-4 h-4 shrink-0" />
              {lang === 'ta'
                ? `"${batchId.trim()}" க்கு பேட்ச் எதுவும் கிடைக்கவில்லை — உங்கள் பாக்கில் உள்ள குறியீட்டை மீண்டும் சரிபார்க்கவும், அல்லது தவறாகத் தெரிந்தால் ஆதரவைத் தொடர்பு கொள்ளவும்.`
                : `No batch found for "${batchId.trim()}" — double-check the code on your pack, or contact support if it looks wrong.`}
            </div>
          )}

          {status === 'error' && (
            <div className="bg-red-950/40 border border-red-800 rounded-2xl p-4 text-left flex items-center gap-2 text-red-300 text-xs font-bold animate-fadeIn">
              <XCircle className="w-4 h-4 shrink-0" />
              {lang === 'ta'
                ? 'இப்போது கண்காணிப்பு சேவையை அடைய முடியவில்லை — சிறிது நேரத்தில் மீண்டும் முயற்சிக்கவும்.'
                : "Couldn't reach the traceability service right now — please try again in a moment."}
            </div>
          )}

          {result && (
            <div className="bg-white/5 border border-emerald-800 rounded-2xl p-5 text-left space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-emerald-900 pb-3">
                <span className="font-mono font-black text-emerald-400 text-sm">{lang === 'ta' ? `பேட்ச் #${result.batchId}` : `Batch #${result.batchId}`}</span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 uppercase bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> {lang === 'ta' ? 'சரிபார்க்கப்பட்டது' : 'Verified'}
                </span>
              </div>
              {result.productName && (
                <div className="text-xs text-neutral-400 -mt-1">{result.productName}</div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-300">
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{result.farmName}, {result.farmLocation}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{lang === 'ta' ? `வெட்டப்பட்டு பேக் செய்யப்பட்டது: ${result.cutDate}` : `Cut & packed: ${result.cutDate}`}</span>
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
        {resolvedFeatures.map((f) => (
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
