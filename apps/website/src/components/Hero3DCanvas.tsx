import React, { useRef, useState } from 'react';
import { Thermometer, Play, Pause, Drumstick, Beef, Fish, Flame } from 'lucide-react';

type Cut3DType = 'chicken' | 'steak' | 'salmon' | 'skewer';

interface CutInfo {
  id: Cut3DType;
  name: string;
  tag: string;
  temp: string;
  protein: string;
  fat: string;
  description: string;
  hotspots: { title: string; desc: string }[];
}

const CUT_INFOS: Record<Cut3DType, CutInfo> = {
  chicken: {
    id: 'chicken',
    name: 'Farm Fresh Chicken Drumstick',
    tag: '100% Antibiotic & Hormone Free',
    temp: '2.4°C Chilled',
    protein: '28g / 100g',
    fat: '3.5g low-fat',
    description: 'Pasture-raised, hand-trimmed tender drumstick sealed under zero-oxygen vacuum packing.',
    hotspots: [
      { title: 'Tendon Cleaned', desc: 'Pre-trimmed for smooth even cooking' },
      { title: '0-4°C Vacuum Seal', desc: 'Zero exposure to ambient air' },
      { title: 'Juicy Meat Mass', desc: 'Moist and succulent muscle fibers' }
    ]
  },
  steak: {
    id: 'steak',
    name: 'Prime Grass-Fed Lamb Chop',
    tag: 'Pass-through Pasture Grain Fed',
    temp: '3.1°C Chilled',
    protein: '25g / 100g',
    fat: '7.2g marbled',
    description: 'Tender 100% grass-fed lamb chop cut across the grain for silky tenderness in curries & roasts.',
    hotspots: [
      { title: 'Rich Intramuscular Fat', desc: 'Natural marbling for deep flavor' },
      { title: 'Rib Bone Trimmed', desc: 'Frenched bone edge for clean presentation' },
      { title: 'Zero Moisture Loss', desc: 'Dry-chilled to lock essential juices' }
    ]
  },
  salmon: {
    id: 'salmon',
    name: 'Wild Salmon Prime Fillet',
    tag: 'Rich in Omega-3 Oils',
    temp: '1.8°C Deep Chilled',
    protein: '22g / 100g',
    fat: '11g Healthy Fats',
    description: 'Ocean-harvested, descaled and deboned sashimi-grade Atlantic salmon fillet with skin-on protection.',
    hotspots: [
      { title: 'Omega-3 Layers', desc: 'Natural fatty striations' },
      { title: 'Deboned & Scaled', desc: 'Pin-bones 100% removed' },
      { title: 'Crispy Skin Base', desc: 'Retains moisture during pan-searing' }
    ]
  },
  skewer: {
    id: 'skewer',
    name: 'Tandoori Tikka Skewer',
    tag: 'Pre-Marinated Ready-To-Cook',
    temp: '2.9°C Chilled',
    protein: '31g / 100g',
    fat: '4.1g low-fat',
    description: 'Hung curd, Kashmiri chilli & mustard oil marinade infused 12 hours into tender chicken breast cubes.',
    hotspots: [
      { title: '12-Hr Infused Rub', desc: 'Deep spice absorption into core' },
      { title: 'Stainless Skewer', desc: 'Hygienic prep for clay oven / grill' },
      { title: 'Smokey Crust', desc: 'Char-broil ready coating' }
    ]
  }
};

const HOTSPOT_POSITION_CLASSES = ['top-20 left-10 sm:left-16', 'bottom-24 right-8 sm:right-16', 'top-1/2 right-12'];

const CUT_ICONS: Record<Cut3DType, typeof Drumstick> = {
  chicken: Drumstick,
  steak: Beef,
  salmon: Fish,
  skewer: Flame
};

export const Hero3DCanvas: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [activeCut, setActiveCut] = useState<Cut3DType>('chicken');
  const [activeHotspot, setActiveHotspot] = useState<number | null>(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoError, setVideoError] = useState(false);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const currentInfo = CUT_INFOS[activeCut];
  const CurrentIcon = CUT_ICONS[activeCut];

  return (
    <div className="relative w-full h-[420px] sm:h-[500px] bg-[#050F08] border-2 border-emerald-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between p-4 sm:p-6 group">
      {/* Top Bar Controls */}
      <div className="flex items-center justify-between z-20">
        <div className="flex items-center gap-2 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-emerald-800 text-xs text-white">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-bold">Fresh Cut Showcase</span>
          <span className="text-[10px] text-emerald-400 font-mono">0-4°C Sealed</span>
        </div>

        <button
          onClick={togglePlayback}
          className={`px-3 py-1.5 rounded-full border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
            isPlaying
              ? 'bg-[#0F7B3A] text-white border-emerald-400'
              : 'bg-black/60 text-neutral-400 border-emerald-900 hover:text-white'
          }`}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          {isPlaying ? 'Playing' : 'Paused'}
        </button>
      </div>

      {/* Main Video / Fallback Mount */}
      {!videoError ? (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover z-0"
          src="/videos/3D_animation_of_food_preparation_202607251716.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onError={() => setVideoError(true)}
        />
      ) : (
        <div className="absolute inset-0 w-full h-full z-0 bg-gradient-to-br from-emerald-950 via-[#0B1A10] to-black flex items-center justify-center overflow-hidden">
          {/* Ambient glow orbs for depth */}
          <div className="absolute -top-10 -left-10 w-64 h-64 bg-emerald-600/15 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-emerald-950/60 rounded-full blur-[100px] pointer-events-none" />

          {/* Subtle dot texture */}
          <div
            className="absolute inset-0 opacity-[0.05] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '36px 36px'
            }}
          />

          {/* Centered cut icon badge */}
          <div className="relative flex flex-col items-center gap-3">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.25em]">Fresh Cut Preview</span>
            <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-emerald-950/60 border-2 border-emerald-700 flex items-center justify-center shadow-2xl">
              <span className="absolute inset-0 rounded-full border border-emerald-500/40 animate-ping" />
              <CurrentIcon className="w-14 h-14 sm:w-16 sm:h-16 text-emerald-400" />
            </div>
            <span className="text-xs font-bold text-white/80">{currentInfo.name}</span>
          </div>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/40 z-[1] pointer-events-none" />

      {/* Interactive Hotspot Pins Overlay */}
      <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
        {currentInfo.hotspots.map((hs, idx) => {
          const isActive = activeHotspot === idx;
          return (
            <button
              key={hs.title}
              onClick={() => setActiveHotspot(idx)}
              className={`absolute pointer-events-auto transition-all duration-300 flex items-center gap-2 cursor-pointer ${HOTSPOT_POSITION_CLASSES[idx] || ''}`}
            >
              <div className={`relative flex items-center justify-center w-8 h-8 rounded-full font-black text-xs transition border ${
                isActive
                  ? 'bg-[#0F7B3A] border-white text-white shadow-lg scale-125'
                  : 'bg-black/80 border-emerald-600 text-emerald-400 hover:scale-110'
              }`}>
                {idx + 1}
                <span className="absolute inset-0 rounded-full bg-emerald-400/40 animate-ping pointer-events-none" />
              </div>

              {isActive && (
                <div className="bg-black/90 border border-emerald-600 text-white p-2.5 rounded-2xl shadow-2xl max-w-[180px] text-left animate-fadeIn">
                  <div className="text-xs font-bold text-emerald-300">{hs.title}</div>
                  <div className="text-[10px] text-neutral-300 mt-0.5 leading-tight">{hs.desc}</div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Cut Selector Tabs & Specs Card */}
      <div className="relative z-20 space-y-3">
        {/* Active Cut Details Badge */}
        <div className="bg-black/80 backdrop-blur-md border border-emerald-800 p-3.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                {currentInfo.tag}
              </span>
              <span className="text-xs text-neutral-400 font-mono flex items-center gap-1">
                <Thermometer className="w-3 h-3 text-emerald-400" /> {currentInfo.temp}
              </span>
            </div>
            <h3 className="text-sm font-black text-white mt-1">{currentInfo.name}</h3>
            <p className="text-[11px] text-neutral-300 line-clamp-1">{currentInfo.description}</p>
          </div>

          <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-emerald-900 pt-2 sm:pt-0 sm:pl-4 shrink-0">
            <div>
              <div className="text-[9px] text-neutral-400 uppercase">Protein</div>
              <div className="text-xs font-black text-emerald-400">{currentInfo.protein}</div>
            </div>
            <div>
              <div className="text-[9px] text-neutral-400 uppercase">Fat Ratio</div>
              <div className="text-xs font-black text-white">{currentInfo.fat}</div>
            </div>
          </div>
        </div>

        {/* Cut Type Selection Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'chicken' as const, label: 'Drumstick', Icon: Drumstick },
            { id: 'steak' as const, label: 'Lamb Chop', Icon: Beef },
            { id: 'salmon' as const, label: 'Salmon', Icon: Fish },
            { id: 'skewer' as const, label: 'Tikka', Icon: Flame }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveCut(item.id);
                setActiveHotspot(0);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer border flex items-center gap-1.5 ${
                activeCut === item.id
                  ? 'bg-[#0F7B3A] text-white border-emerald-400 shadow-md'
                  : 'bg-black/60 text-neutral-300 border-emerald-950 hover:border-emerald-800 hover:text-white'
              }`}
            >
              <item.Icon className="w-3.5 h-3.5" />
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
