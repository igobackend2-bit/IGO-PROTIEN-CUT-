import React from 'react';
import { useSiteContent } from '../lib/hooks/useSiteContent';
import { resolveIcon } from '../lib/iconMap';
import { useLang } from '../lib/language';

/**
 * Editable from /admin → Sections → How It Works.
 * The object below is the fallback if the content block is missing.
 */
const FALLBACK = {
  eyebrow: 'SIMPLE PROCESS',
  heading: 'Fresh to Your Door in 3 Steps',
  items: [
    {
      icon: 'ShoppingCart',
      title: 'Place Your Order',
      text: 'Browse fresh categories, select your cuts, and checkout in under 2 minutes.'
    },
    {
      icon: 'PackageCheck',
      title: 'Process & Pack Fresh',
      text: 'Cuts are processed the same morning in sterile, temperature-controlled dark stores.'
    },
    {
      icon: 'Truck',
      title: 'Delivered Fresh',
      text: 'Arrives at your door at peak freshness (0-4°C) with end-to-end cold chain.'
    }
  ]
};

const FALLBACK_TA = {
  eyebrow: 'எளிய செயல்முறை',
  heading: '3 படிகளில் உங்கள் வீட்டு வாசலுக்கு புதியது',
  items: [
    {
      icon: 'ShoppingCart',
      title: 'உங்கள் ஆர்டரை வையுங்கள்',
      text: 'புதிய வகைகளை உலாவி, உங்கள் கட்ஸைத் தேர்ந்தெடுத்து, 2 நிமிடங்களுக்குள் செக்அவுட் செய்யுங்கள்.'
    },
    {
      icon: 'PackageCheck',
      title: 'செயலாக்கம் & புதிதாக பேக் செய்யப்படுகிறது',
      text: 'கட்ஸ் அதே காலையில் கிருமி நீக்கப்பட்ட, வெப்பநிலை கட்டுப்படுத்தப்பட்ட இருண்ட கடைகளில் செயலாக்கப்படுகிறது.'
    },
    {
      icon: 'Truck',
      title: 'புதியதாக டெலிவரி செய்யப்படுகிறது',
      text: 'இறுதி-முதல்-இறுதி குளிர் சங்கிலியுடன் அதிகபட்ச புத்துணர்ச்சியில் (0-4°C) உங்கள் வீட்டு வாசலுக்கு வருகிறது.'
    }
  ]
};

const FALLBACK_HI = {
  eyebrow: 'सरल प्रक्रिया',
  heading: '3 चरणों में आपके दरवाज़े तक ताज़ा',
  items: [
    {
      icon: 'ShoppingCart',
      title: 'अपना ऑर्डर दें',
      text: 'ताज़ा कैटेगरी ब्राउज़ करें, अपने कट्स चुनें, और 2 मिनट से भी कम समय में चेकआउट करें।'
    },
    {
      icon: 'PackageCheck',
      title: 'प्रोसेस और ताज़ा पैक',
      text: 'कट्स को उसी सुबह स्टेराइल, तापमान-नियंत्रित डार्क स्टोर्स में प्रोसेस किया जाता है।'
    },
    {
      icon: 'Truck',
      title: 'ताज़ा डिलीवर',
      text: 'एंड-टू-एंड कोल्ड चेन के साथ अधिकतम ताज़गी (0-4°C) में आपके दरवाज़े पर पहुँचता है।'
    }
  ]
};

const FALLBACK_ML = {
  eyebrow: 'ലളിതമായ പ്രക്രിയ',
  heading: '3 ഘട്ടങ്ങളിൽ നിങ്ങളുടെ വീട്ടുവാതിൽക്കൽ പുതുമ',
  items: [
    {
      icon: 'ShoppingCart',
      title: 'നിങ്ങളുടെ ഓർഡർ നൽകുക',
      text: 'പുതിയ വിഭാഗങ്ങൾ ബ്രൗസ് ചെയ്യുക, നിങ്ങളുടെ കട്ടുകൾ തിരഞ്ഞെടുക്കുക, 2 മിനിറ്റിനുള്ളിൽ ചെക്ക്ഔട്ട് ചെയ്യുക.'
    },
    {
      icon: 'PackageCheck',
      title: 'പ്രോസസ്സ് ചെയ്ത് പുതുതായി പായ്ക്ക് ചെയ്യുന്നു',
      text: 'കട്ടുകൾ അതേ രാവിലെ തന്നെ അണുവിമുക്തമായ, താപനില നിയന്ത്രിത ഡാർക്ക് സ്റ്റോറുകളിൽ പ്രോസസ്സ് ചെയ്യുന്നു.'
    },
    {
      icon: 'Truck',
      title: 'പുതുമയോടെ ഡെലിവർ ചെയ്യുന്നു',
      text: 'എൻഡ്-ടു-എൻഡ് കോൾഡ് ചെയിനോടെ പരമാവധി പുതുമയിൽ (0-4°C) നിങ്ങളുടെ വീട്ടുവാതിൽക്കൽ എത്തുന്നു.'
    }
  ]
};

const FALLBACK_TE = {
  eyebrow: 'సరళమైన ప్రక్రియ',
  heading: '3 దశల్లో మీ ఇంటి తలుపు వద్దకు తాజాగా',
  items: [
    {
      icon: 'ShoppingCart',
      title: 'మీ ఆర్డర్ పెట్టండి',
      text: 'తాజా కేటగిరీలను బ్రౌజ్ చేయండి, మీ కట్స్ ఎంచుకోండి, 2 నిమిషాల్లోపు చెక్అవుట్ చేయండి.'
    },
    {
      icon: 'PackageCheck',
      title: 'ప్రాసెస్ చేసి తాజాగా ప్యాక్ చేయడం',
      text: 'కట్స్ అదే ఉదయం స్టెరైల్, ఉష్ణోగ్రత-నియంత్రిత డార్క్ స్టోర్లలో ప్రాసెస్ చేయబడతాయి.'
    },
    {
      icon: 'Truck',
      title: 'తాజాగా డెలివరీ',
      text: 'ఎండ్-టు-ఎండ్ కోల్డ్ చైన్‌తో గరిష్ట తాజాదనంతో (0-4°C) మీ ఇంటి తలుపు వద్దకు చేరుకుంటుంది.'
    }
  ]
};

const FALLBACK_KN = {
  eyebrow: 'ಸರಳ ಪ್ರಕ್ರಿಯೆ',
  heading: '3 ಹಂತಗಳಲ್ಲಿ ನಿಮ್ಮ ಬಾಗಿಲಿಗೆ ತಾಜಾ',
  items: [
    {
      icon: 'ShoppingCart',
      title: 'ನಿಮ್ಮ ಆರ್ಡರ್ ಇರಿಸಿ',
      text: 'ತಾಜಾ ವಿಭಾಗಗಳನ್ನು ಬ್ರೌಸ್ ಮಾಡಿ, ನಿಮ್ಮ ಕಟ್ಸ್ ಆಯ್ಕೆಮಾಡಿ, 2 ನಿಮಿಷಗಳಲ್ಲಿ ಚೆಕ್‌ಔಟ್ ಮಾಡಿ.'
    },
    {
      icon: 'PackageCheck',
      title: 'ಪ್ರೊಸೆಸ್ ಮಾಡಿ ತಾಜಾವಾಗಿ ಪ್ಯಾಕ್ ಮಾಡಲಾಗುತ್ತದೆ',
      text: 'ಕಟ್ಸ್‌ಗಳನ್ನು ಅದೇ ಬೆಳಿಗ್ಗೆ ಸ್ಟೆರೈಲ್, ತಾಪಮಾನ-ನಿಯಂತ್ರಿತ ಡಾರ್ಕ್ ಸ್ಟೋರ್‌ಗಳಲ್ಲಿ ಪ್ರೊಸೆಸ್ ಮಾಡಲಾಗುತ್ತದೆ.'
    },
    {
      icon: 'Truck',
      title: 'ತಾಜಾವಾಗಿ ಡೆಲಿವರಿ',
      text: 'ಎಂಡ್-ಟು-ಎಂಡ್ ಕೋಲ್ಡ್ ಚೈನ್‌ನೊಂದಿಗೆ ಗರಿಷ್ಠ ತಾಜಾತನದಲ್ಲಿ (0-4°C) ನಿಮ್ಮ ಬಾಗಿಲಿಗೆ ತಲುಪುತ್ತದೆ.'
    }
  ]
};

export const HowItWorksSection: React.FC = () => {
  const { lang } = useLang();
  const block = useSiteContent('sections.how_it_works', FALLBACK);
  const resolvedBlock = lang === 'ta' ? FALLBACK_TA : lang === 'hi' ? FALLBACK_HI : lang === 'ml' ? FALLBACK_ML : lang === 'te' ? FALLBACK_TE : lang === 'kn' ? FALLBACK_KN : block;
  const steps = resolvedBlock.items.map((item, index) => ({
    id: index + 1,
    title: item.title,
    desc: item.text,
    icon: resolveIcon(item.icon)
  }));

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">{resolvedBlock.eyebrow}</span>
        <h2 className="text-2xl sm:text-3xl font-black text-[#0A1F12] tracking-tight">{resolvedBlock.heading}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        <div className="absolute top-10 left-[15%] right-[15%] h-px bg-emerald-100 hidden md:block" />

        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div key={step.id} className="relative text-center">
              <div className="w-20 h-20 bg-emerald-50 border-4 border-white rounded-full flex items-center justify-center mx-auto mb-6 relative z-10 shadow-md">
                <Icon className="w-8 h-8 text-emerald-600" />
                <div className="absolute -top-1.5 -right-1.5 w-7 h-7 bg-[#0F7B3A] text-white text-[11px] font-black flex items-center justify-center rounded-full border-2 border-white">
                  0{step.id}
                </div>
              </div>
              <h3 className="text-base font-bold text-[#0A1F12] mb-2">{step.title}</h3>
              <p className="text-xs text-neutral-600 leading-relaxed max-w-xs mx-auto">{step.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
