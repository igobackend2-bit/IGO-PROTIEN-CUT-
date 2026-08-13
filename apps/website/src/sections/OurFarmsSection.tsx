import React from 'react';
import { useSiteContent } from '../lib/hooks/useSiteContent';
import { resolveIcon } from '../lib/iconMap';
import { FadeImage } from '../components/FadeImage';
import { useLang, pick } from '../lib/language';

/**
 * Editable from /admin → Sections → Our Farms and → Certifications.
 *
 * The three narrative images used to point at igo-protien-cut.vercel.app — an
 * old, unrelated Vercel deployment that has since been overwritten with an
 * entirely different site, so that URL now 404s and the images broke
 * site-wide. The original photos were recovered from an old deployment of
 * that same project and re-hosted locally under /Images/narrative so nothing
 * here depends on an external host again.
 */
const FARMS_FALLBACK = {
  eyebrow: 'FROM OUR NETWORK',
  heading: 'Our Farms',
  subheading:
    'From heritage pastures to your kitchen — every stage of the journey, traced honestly.',
  items: [
    {
      label: 'Heritage Farms',
      caption: 'Nilgiris range, Tamil Nadu',
      image: '/Images/narrative/farm.jpg'
    },
    {
      label: 'Sterile Processing',
      caption: 'ISO 22000 dark stores, 0-4°C',
      image: '/Images/narrative/facility.jpg'
    },
    {
      label: 'Batch-Tracked Packaging',
      caption: 'Insulated cold-chain delivery bags',
      image: '/Images/narrative/packaging.jpg'
    }
  ]
};

const CERTS_FALLBACK = {
  items: [
    { name: 'ISO 22000', icon: 'ShieldCheck' },
    { name: 'HACCP', icon: 'Award' },
    { name: 'FSSAI Licensed', icon: 'Globe' },
    { name: '100% Halal', icon: 'Sprout' }
  ]
};
const CERTS_FALLBACK_TA = {
  items: [
    { name: 'ISO 22000', icon: 'ShieldCheck' },
    { name: 'HACCP', icon: 'Award' },
    { name: 'FSSAI உரிமம்', icon: 'Globe' },
    { name: '100% ஹலால்', icon: 'Sprout' }
  ]
};
const CERTS_FALLBACK_HI = {
  items: [
    { name: 'ISO 22000', icon: 'ShieldCheck' },
    { name: 'HACCP', icon: 'Award' },
    { name: 'FSSAI लाइसेंस प्राप्त', icon: 'Globe' },
    { name: '100% हलाल', icon: 'Sprout' }
  ]
};
const CERTS_FALLBACK_ML = {
  items: [
    { name: 'ISO 22000', icon: 'ShieldCheck' },
    { name: 'HACCP', icon: 'Award' },
    { name: 'FSSAI ലൈസൻസ്', icon: 'Globe' },
    { name: '100% ഹലാൽ', icon: 'Sprout' }
  ]
};
const CERTS_FALLBACK_TE = {
  items: [
    { name: 'ISO 22000', icon: 'ShieldCheck' },
    { name: 'HACCP', icon: 'Award' },
    { name: 'FSSAI లైసెన్స్డ్', icon: 'Globe' },
    { name: '100% హలాల్', icon: 'Sprout' }
  ]
};
const FARMS_FALLBACK_TA = {
  eyebrow: 'எங்கள் நெட்வொர்க்கிலிருந்து',
  heading: 'எங்கள் பண்ணைகள்',
  subheading: 'பாரம்பரிய மேய்ச்சல் நிலங்களிலிருந்து உங்கள் சமையலறை வரை — பயணத்தின் ஒவ்வொரு கட்டமும் நேர்மையாக கண்காணிக்கப்படுகிறது.',
  items: [
    {
      label: 'பாரம்பரிய பண்ணைகள்',
      caption: 'நீலகிரி மலைத்தொடர், தமிழ்நாடு',
      image: '/Images/narrative/farm.jpg'
    },
    {
      label: 'கிருமி நீக்க செயலாக்கம்',
      caption: 'ISO 22000 இருண்ட கடைகள், 0-4°C',
      image: '/Images/narrative/facility.jpg'
    },
    {
      label: 'பேட்ச் கண்காணிக்கப்பட்ட பேக்கேஜிங்',
      caption: 'இன்சுலேட்டட் குளிர் சங்கிலி டெலிவரி பைகள்',
      image: '/Images/narrative/packaging.jpg'
    }
  ]
};
const FARMS_FALLBACK_HI = {
  eyebrow: 'हमारे नेटवर्क से',
  heading: 'हमारे फार्म',
  subheading: 'पारंपरिक चरागाहों से आपकी रसोई तक — यात्रा के हर चरण को ईमानदारी से ट्रैक किया गया है।',
  items: [
    {
      label: 'विरासती फार्म',
      caption: 'नीलगिरि पर्वतमाला, तमिलनाडु',
      image: '/Images/narrative/farm.jpg'
    },
    {
      label: 'स्टेराइल प्रोसेसिंग',
      caption: 'ISO 22000 डार्क स्टोर्स, 0-4°C',
      image: '/Images/narrative/facility.jpg'
    },
    {
      label: 'बैच-ट्रैक्ड पैकेजिंग',
      caption: 'इंसुलेटेड कोल्ड-चेन डिलीवरी बैग',
      image: '/Images/narrative/packaging.jpg'
    }
  ]
};
const FARMS_FALLBACK_ML = {
  eyebrow: 'ഞങ്ങളുടെ നെറ്റ്‌വർക്കിൽ നിന്ന്',
  heading: 'ഞങ്ങളുടെ ഫാമുകൾ',
  subheading: 'പരമ്പരാഗത മേച്ചിൽപ്പുറങ്ങളിൽ നിന്ന് നിങ്ങളുടെ അടുക്കളയിലേക്ക് — യാത്രയുടെ ഓരോ ഘട്ടവും സത്യസന്ധമായി കണ്ടെത്തി.',
  items: [
    {
      label: 'പൈതൃക ഫാമുകൾ',
      caption: 'നീലഗിരി മലനിരകൾ, തമിഴ്‌നാട്',
      image: '/Images/narrative/farm.jpg'
    },
    {
      label: 'സ്റ്റെറൈൽ പ്രോസസിംഗ്',
      caption: 'ISO 22000 ഡാർക്ക് സ്റ്റോറുകൾ, 0-4°C',
      image: '/Images/narrative/facility.jpg'
    },
    {
      label: 'ബാച്ച്-ട്രാക്ക്ഡ് പാക്കേജിംഗ്',
      caption: 'ഇൻസുലേറ്റഡ് കോൾഡ്-ചെയിൻ ഡെലിവറി ബാഗുകൾ',
      image: '/Images/narrative/packaging.jpg'
    }
  ]
};
const FARMS_FALLBACK_TE = {
  eyebrow: 'మా నెట్‌వర్క్ నుండి',
  heading: 'మా పొలాలు',
  subheading: 'సంప్రదాయ పచ్చిక బయళ్ల నుండి మీ వంటగది వరకు — ప్రయాణంలోని ప్రతి దశను నిజాయితీగా ట్రేస్ చేయబడింది.',
  items: [
    {
      label: 'వారసత్వ పొలాలు',
      caption: 'నీలగిరి కొండలు, తమిళనాడు',
      image: '/Images/narrative/farm.jpg'
    },
    {
      label: 'స్టెరైల్ ప్రాసెసింగ్',
      caption: 'ISO 22000 డార్క్ స్టోర్లు, 0-4°C',
      image: '/Images/narrative/facility.jpg'
    },
    {
      label: 'బ్యాచ్-ట్రాక్డ్ ప్యాకేజింగ్',
      caption: 'ఇన్సులేటెడ్ కోల్డ్-చైన్ డెలివరీ బ్యాగులు',
      image: '/Images/narrative/packaging.jpg'
    }
  ]
};

// "Our Farms" — real photography from the three-stage narrative sequence
// already used elsewhere on the site (farm → facility → packaging), plus
// the same certifications already listed on the About page. No new claims.
export const OurFarmsSection: React.FC = () => {
  const { lang } = useLang();
  const farmsBlock = useSiteContent('sections.our_farms', FARMS_FALLBACK);
  const certsBlock = useSiteContent('sections.certifications', CERTS_FALLBACK);
  const resolvedFarmsBlock = lang === 'ta' ? FARMS_FALLBACK_TA : lang === 'hi' ? FARMS_FALLBACK_HI : lang === 'ml' ? FARMS_FALLBACK_ML : lang === 'te' ? FARMS_FALLBACK_TE : farmsBlock;
  const resolvedCertsBlock = lang === 'ta' ? CERTS_FALLBACK_TA : lang === 'hi' ? CERTS_FALLBACK_HI : lang === 'ml' ? CERTS_FALLBACK_ML : lang === 'te' ? CERTS_FALLBACK_TE : certsBlock;

  const journey = resolvedFarmsBlock.items;
  const certs = resolvedCertsBlock.items.map((c) => ({ name: c.name, icon: resolveIcon(c.icon) }));

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
          {pick(lang, { en: 'Transparency Builds Trust', ta: 'வெளிப்படைத்தன்மை நம்பிக்கையை உருவாக்குகிறது', hi: 'पारदर्शिता विश्वास बनाती है', ml: 'സുതാര്യത വിശ്വാസം വളർത്തുന്നു', te: 'పారదర్శకత నమ్మకాన్ని పెంచుతుంది' })}
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-[#0A1F12] tracking-tight">
          {pick(lang, { en: 'Our Farms', ta: 'எங்கள் பண்ணைகள்', hi: 'हमारे फार्म', ml: 'ഞങ്ങളുടെ ഫാമുകൾ', te: 'మా పొలాలు' })}
        </h2>
        <p className="text-xs sm:text-sm text-neutral-600">
          {pick(lang, {
            en: 'From heritage pastures to your kitchen — every stage of the journey, shown honestly.',
            ta: 'பாரம்பரிய மேய்ச்சல் நிலங்களிலிருந்து உங்கள் சமையலறை வரை — பயணத்தின் ஒவ்வொரு கட்டமும் நேர்மையாக காட்டப்படுகிறது.',
            hi: 'पारंपरिक चरागाहों से आपकी रसोई तक — यात्रा का हर चरण ईमानदारी से दिखाया गया है।',
            ml: 'പരമ്പരാഗത മേച്ചിൽപ്പുറങ്ങളിൽ നിന്ന് നിങ്ങളുടെ അടുക്കളയിലേക്ക് — യാത്രയുടെ ഓരോ ഘട്ടവും സത്യസന്ധമായി കാണിച്ചിരിക്കുന്നു.',
            te: 'సంప్రదాయ పచ్చిక బయళ్ల నుండి మీ వంటగది వరకు — ప్రయాణంలోని ప్రతి దశను నిజాయితీగా చూపబడింది.'
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {journey.map((step) => (
          <div key={step.label} className="relative rounded-2xl overflow-hidden aspect-4/3 group">
            <FadeImage
              src={step.image}
              alt={step.label}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A1F12]/90 via-[#0A1F12]/20 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3">
              <h3 className="text-white font-black text-sm">{step.label}</h3>
              <p className="text-white/70 text-[11px]">{step.caption}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {certs.map((cert) => {
          const Icon = cert.icon;
          return (
            <div
              key={cert.name}
              className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3 justify-center"
            >
              <Icon className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-xs font-black text-[#0A1F12]">{cert.name}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
};
