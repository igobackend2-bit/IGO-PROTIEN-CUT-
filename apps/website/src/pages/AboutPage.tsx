import React from 'react';
import { ShieldCheck, Award, Clock, CheckCircle2, Truck } from 'lucide-react';
import { useSiteContent } from '../lib/hooks/useSiteContent';
import { FadeImage } from '../components/FadeImage';
import { TraceabilitySection } from '../sections/TraceabilitySection';
import { useLang } from '../lib/language';

const CONTENT_TA = {
  title: 'ப்ரோட்டீன் கட்ஸ் கதை',
  intro:
    'இந்திய வீடுகளில் இருந்து இரசாயன பாதுகாப்பான்கள், ஆன்டிபயாடிக்குகள் மற்றும் பழைய உறைந்த இறைச்சிகளை ஒழிக்க வேண்டும் என்ற ஒரே ஆர்வத்தில் இருந்து ப்ரோட்டீன் கட்ஸ் பிறந்தது. மதிப்புமிக்க IGO குரூப்ஸ் சுற்றுச்சூழல் அமைப்பின் ஒரு பகுதியாக, தொழில்நுட்பம், பண்ணை கூட்டாண்மைகள் மற்றும் குளிர்சாதன சேமிப்பு லாஜிஸ்டிக்ஸை பயன்படுத்தி 30-90 நிமிடங்களில் தூய்மையான, புதிய புரதத்தை வழங்குகிறோம்.'
};

const WHAT_WE_SELL_TA = [
  'புதிய கோழி',
  'மட்டன் & மாட்டிறைச்சி',
  'மீன் & கடல் உணவு',
  'பண்ணை முட்டைகள்',
  'சமைக்க தயார்',
  'உறைந்த சிற்றுண்டிகள்',
  'காம்போ பாக்குகள்',
  'இறைச்சி சந்தாக்கள்'
];

export const AboutPage: React.FC = () => {
  const { lang } = useLang();
  // Only the hero title/intro are admin-editable here (via /admin → Pages &
  // SEO → About page). The sections below (Trust, Founder Message,
  // Certifications) are bespoke layouts, not a generic heading/body list, so
  // they stay hardcoded rather than being forced into a shape that doesn't
  // fit them.
  const content = useSiteContent('pages.about', {
    title: 'The Protein Cuts Story',
    intro:
      'Protein Cuts was born out of a single obsession: to eradicate chemical preservatives, antibiotics, and stale frozen meats from Indian households. As part of the prestigious IGO Groups ecosystem, we leverage technology, farm partnerships, and cold-chain logistics to deliver pure, fresh protein in 30-90 minutes.'
  });
  const resolvedContent = lang === 'ta' ? CONTENT_TA : content;
  const whatWeSellItems = lang === 'ta' ? WHAT_WE_SELL_TA : [
    'Fresh Chicken',
    'Mutton & Beef',
    'Fish & Seafood',
    'Farm Eggs',
    'Ready-to-Cook',
    'Frozen Snacks',
    'Combo Packs',
    'Meat Subscriptions'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Hero */}
      <div className="bg-[#0A1F12] rounded-3xl p-8 sm:p-12 text-center max-w-4xl mx-auto space-y-4 shadow-lg shadow-emerald-950/20 text-white">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">{lang === 'ta' ? 'IGO சுற்றுச்சூழல் அமைப்பு பிராண்ட்' : 'IGO ECOSYSTEM BRAND'}</span>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight">{resolvedContent.title}</h1>
        <p className="text-xs sm:text-base text-neutral-300 leading-relaxed">{resolvedContent.intro}</p>
      </div>

      {/* What We Sell — customer feedback pointed out that everything above
          this point is guarantees/brand-story copy (antibiotic-free, cold
          chain, certifications) without ever plainly stating what's actually
          for sale. A new visitor reading only the hero had no quick way to
          tell this is a fresh-meat-and-seafood delivery service rather than,
          say, a supplement or grocery brand. This section says it directly. */}
      <div className="bg-white border border-neutral-200 rounded-3xl p-8 space-y-6 shadow-sm">
        <div className="max-w-2xl">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">{lang === 'ta' ? 'நாங்கள் விற்பது என்ன' : 'What We Sell'}</span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0A1F12] tracking-tight mt-2">
            {lang === 'ta'
              ? 'புதிய கோழி, மட்டன், மீன், கடல் உணவு மற்றும் முட்டைகள் — ஆர்டர் செய்யும்போது வெட்டப்பட்டு 30-90 நிமிடங்களில் வழங்கப்படும்.'
              : 'Fresh chicken, mutton, fish, seafood and eggs — cut to order and delivered in 30-90 minutes.'}
          </h2>
          <p className="text-sm text-neutral-600 leading-relaxed mt-3">
            {lang === 'ta'
              ? 'ப்ரோட்டீன் கட்ஸ் ஒரு ஆன்லைன் கசாப்புக் கடை: நீங்கள் வெட்டு மற்றும் எடையைத் தேர்ந்தெடுக்கிறீர்கள், நீங்கள் ஆர்டர் செய்த பிறகு எங்கள் கசாப்புக்காரர்கள் அதை புதிதாக தயார் செய்கிறார்கள், அது 0-4°C குளிர்ச்சியில் உங்கள் வீட்டிற்கு வருகிறது. தனிப்பட்ட வெட்டுகளுக்கு அப்பால், நாங்கள் சமைக்கத் தயார் மேரினேட் செய்யப்பட்ட பொருட்கள், உறைந்த சிற்றுண்டிகள், குடும்பங்கள் அல்லது ஜிம் பயனர்களுக்கான காம்போ பாக்குகள் மற்றும் தொடர் இறைச்சி சந்தாக்களையும் விற்கிறோம்.'
              : 'Protein Cuts is an online butcher: you pick the cut and weight, our butchers dress it fresh after you order, and it reaches your door chilled at 0-4°C. Beyond individual cuts, we also sell ready-to-cook marinated items, frozen snacks, combo packs for families or gym-goers, and recurring meat subscriptions.'}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {whatWeSellItems.map((item) => (
            <div
              key={item}
              className="bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2.5 font-bold text-[#0A1F12] text-center"
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Trust / Traceability — real facility photo, real facts already
          established elsewhere on the site (batch ID traceability, 0-4°C
          cold chain, heritage Nilgiris farms) rather than a fabricated
          phone/QR-code composite image. */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
        <div className="space-y-5">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">{lang === 'ta' ? 'உங்கள் புரதத்தை நம்புங்கள்' : 'Trust Your Protein'}</span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            <span className="text-[#0A1F12]">{lang === 'ta' ? 'உங்கள் மூலத்தை அறியுங்கள்.' : 'Know Your Source.'}</span>
            <br />
            <span className="text-[#D4AF37]">{lang === 'ta' ? 'உங்கள் வெட்டை நம்புங்கள்.' : 'Trust Your Cut.'}</span>
          </h2>
          <p className="text-sm text-neutral-600 leading-relaxed max-w-md">
            {lang === 'ta'
              ? 'எங்கள் தொழில்நுட்ப-இயங்கும் கண்காணிப்பு அமைப்பு பண்ணையிலிருந்து மேசைக்கு முழுமையான வெளிப்படைத்தன்மையை வழங்குகிறது. ஒவ்வொரு பாக்கிலும் ஒரு தனித்துவமான பேட்ச் ஐடி மற்றும் QR குறியீடு உள்ளது, இது உங்கள் இறைச்சியின் பயணத்தை — குறிப்பிட்ட பண்ணையிலிருந்து அதன் டெலிவரியின் வெப்பநிலை பதிவுகள் வரை — வெளிப்படுத்துகிறது.'
              : 'Our technology-driven traceability system provides complete farm-to-table transparency. Every pack carries a unique batch ID and QR code that reveals the journey of your meat — from the specific farm to the temperature logs of its delivery.'}
          </p>

          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <div className="font-bold text-[#0A1F12] text-sm">{lang === 'ta' ? 'சரிபார்க்கப்பட்ட தோற்றங்கள்' : 'Verified Origins'}</div>
                <p className="text-xs text-neutral-500">{lang === 'ta' ? 'தமிழ்நாட்டின் நீலகிரி மலைத்தொடரில் உள்ள பாரம்பரிய பண்ணைகளுக்கு கண்டறியப்பட்டது.' : 'Traced back to heritage farms in the Nilgiris range, Tamil Nadu.'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <div className="font-bold text-[#0A1F12] text-sm">{lang === 'ta' ? 'குளிர்சாதன சேமிப்பு வெளிப்படைத்தன்மை' : 'Cold Chain Transparency'}</div>
                <p className="text-xs text-neutral-500">{lang === 'ta' ? 'ஒவ்வொரு பேட்சும் பண்ணையிலிருந்து வீடு வரை 0-4°C வரம்பிற்குள் கண்காணிக்கப்படுகிறது.' : 'Every batch stays tracked within a 0-4°C window, farm to door.'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative rounded-3xl overflow-hidden shadow-xl shadow-black/20 min-h-[320px]">
          {/* Was pointed at igo-protien-cut.vercel.app, an old, unrelated
              Vercel project that's since been redeployed with a different
              site — the URL now 404s. Recovered the original photo from an
              old deployment of that same project and re-hosted it locally. */}
          <FadeImage
            src="/Images/narrative/facility.jpg"
            alt="IGO cold-chain facility — batch-tracked processing"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A1F12]/85 via-[#0A1F12]/10 to-transparent" />

          <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-[9px] font-bold text-white/60 uppercase tracking-widest">{lang === 'ta' ? 'ஊடாடும் பயணம்' : 'Interactive Journey'}</div>
              <div className="text-sm font-black text-white">{lang === 'ta' ? '0-4°C விநியோக சங்கிலி ஒருமைப்பாடு' : '0-4°C Supply Chain Integrity'}</div>
            </div>
            <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4.5 h-4.5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Real batch lookup — was built but never wired into any page, so the
          "scan your pack" claim above had no actual tool behind it. Backed by
          igo_batch_trace (see supabase/migrations/0019_batch_traceability.sql). */}
      <TraceabilitySection />

      {/* Leadership & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <span className="text-xs font-bold text-emerald-700 uppercase">{lang === 'ta' ? 'தர சுகாதார அறிக்கை' : 'QUALITY HYGIENE MANIFESTO'}</span>
          <h2 className="text-2xl font-black text-[#0A1F12]">{lang === 'ta' ? 'நிறுவனர் & CEO செய்தி' : 'Founder & CEO Message'}</h2>
          <p className="text-xs text-neutral-600 leading-relaxed">
            {lang === 'ta'
              ? '"இறைச்சி அழுக்கு மற்றும் ஈக்களுக்கு வெளிப்படும் திறந்த கவுண்டர்களில் இருக்கக்கூடாது, தண்ணீர் அல்லது ஸ்டீராய்டுகள் ஏற்றப்படவும் கூடாது. ப்ரோட்டீன் கட்ஸில், ஒவ்வொரு வெட்டும் வெப்பநிலை கட்டுப்படுத்தப்பட்ட இருண்ட கடைகளில் தயார் செய்யப்படுகிறது, 150+ ஆய்வக சோதனைச் சாவடிகளுக்கு உட்படுத்தப்படுகிறது, மற்றும் மூடப்பட்ட தெர்மல் பைகளில் வழங்கப்படுகிறது."'
              : '"Meat shouldn\'t sit on open counters exposed to dirt and flies, nor should it be injected with water or steroids. At Protein Cuts, every single cut is dressed under temperature-controlled dark stores, subjected to 150+ lab checkpoints, and delivered in sealed thermal bags."'}
          </p>
          <div className="font-bold text-[#0A1F12] text-sm pt-2">
            {lang === 'ta' ? '— IGO நிர்வாக குழு & மாஸ்டர் கசாப்பு குழு' : '— IGO Executive Board & Master Butchery Team'}
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-3xl p-6 space-y-4 shadow-sm">
          <h3 className="font-bold text-[#0A1F12] text-base">{lang === 'ta' ? 'முக்கிய IGO சான்றிதழ்கள்' : 'Key IGO Certifications'}</h3>
          <div className="space-y-3 text-xs text-neutral-600">
            <div className="flex items-center gap-3 bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
              <Award className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <strong className="text-[#0A1F12] block">{lang === 'ta' ? 'FSSAI சான்றளிக்கப்பட்ட யூனிட்' : 'FSSAI Certified Unit'}</strong>
                <span>{lang === 'ta' ? 'உரிமம் எண். 10020042001928' : 'License No. 10020042001928'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <strong className="text-[#0A1F12] block">{lang === 'ta' ? '100% ஹலால் & ஆன்டிபயாடிக் இல்லாதது' : '100% Halal & Antibiotic-Free'}</strong>
                <span>{lang === 'ta' ? 'கடுமையான சடங்கு இணக்கம் மற்றும் பூஜ்ஜிய இரசாயன எச்ச உத்தரவாதங்கள்' : 'Strict ritual compliance and zero chemical residue guarantees'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
              <Clock className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <strong className="text-[#0A1F12] block">{lang === 'ta' ? 'ISO 22000 உணவு பாதுகாப்பு தரநிலை' : 'ISO 22000 Food Safety Standard'}</strong>
                <span>{lang === 'ta' ? 'போக்குவரத்து முழுவதும் 0°C முதல் 4°C வரை HACCP வெப்பநிலை கண்காணிப்பு' : 'HACCP temperature monitoring from 0°C to 4°C throughout transport'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
