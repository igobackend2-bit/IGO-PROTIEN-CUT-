import React from 'react';
import { Star, Search, ArrowRight, Instagram } from 'lucide-react';
import { ContentPreviewContext } from '../../lib/hooks/useSiteContent';
import { resolveIcon } from '../../lib/iconMap';
import { FadeImage } from '../FadeImage';
import { HowItWorksSection } from '../../sections/HowItWorksSection';
import { OurFarmsSection } from '../../sections/OurFarmsSection';
import { WhyIGOSection } from '../../sections/WhyIGOSection';
import { FreshnessPromiseSection } from '../../sections/FreshnessPromiseSection';
import { TestimonialsSection } from '../../sections/TestimonialsSection';
import { QualityCertificationsSection } from '../../sections/QualityCertificationsSection';

/**
 * LIVE PREVIEW — shows each content block exactly as the website renders it.
 *
 * Two mechanisms:
 *
 *  1. Sections that exist as standalone components render the REAL component
 *     inside a ContentPreviewContext carrying the draft. Those are pixel-exact
 *     because they are literally the same code the site runs.
 *
 *  2. Homepage blocks are laid out inline inside HomePage.tsx rather than
 *     extracted, so rendering the real thing would mean rendering the whole
 *     1,600-line page. Those are reproduced below using the SAME Tailwind
 *     classes copied from HomePage.tsx, so the typography, colours, ring/
 *     border treatments and badge styling all match.
 *
 * When a homepage section is later extracted into its own component, move its
 * key into LIVE_SECTIONS and delete the reproduction here.
 */

interface SectionPreviewProps {
  blockKey: string;
  payload: Record<string, unknown>;
}

const LIVE_SECTIONS: Record<string, React.FC> = {
  'sections.how_it_works': HowItWorksSection,
  'sections.our_farms': OurFarmsSection,
  'sections.comparison': WhyIGOSection,
  'sections.freshness_pillars': FreshnessPromiseSection,
  'sections.trust_strip': TestimonialsSection,
  'sections.certifications': QualityCertificationsSection
};

export const SectionPreview: React.FC<SectionPreviewProps> = ({ blockKey, payload }) => {
  const Live = LIVE_SECTIONS[blockKey];

  if (Live) {
    return (
      <ContentPreviewContext.Provider value={{ [blockKey]: payload }}>
        {/* Scaled so a full-width section fits the panel. Content and hierarchy
            are exact; only the scale differs from the live page. */}
        <div className="origin-top scale-[0.6] [width:167%]">
          <Live />
        </div>
      </ContentPreviewContext.Provider>
    );
  }

  return <HomepagePreview blockKey={blockKey} payload={payload} />;
};

type Row = Record<string, any>;

const HomepagePreview: React.FC<SectionPreviewProps> = ({ blockKey, payload }) => {
  const p = payload as Row;

  // ── HERO ──────────────────────────────────────────────────────────────────
  if (blockKey === 'home.hero') {
    const theme = (p.themes ?? [])[0] ?? {};
    return (
      <Frame>
        <div className="flex items-center gap-2 mb-3">
          <span className="h-px w-8 bg-[#D4AF37]" />
          <span className="text-[#D4AF37] font-bold text-[10px] uppercase tracking-[0.2em]">
            {theme.label}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-[#08120B] leading-[1.05] mb-4 tracking-tighter">
          {theme.headlineTop}
          <br />
          <span className="text-[#0F7B3A]">{theme.headlineAccent}</span> {theme.headlineBottom}
        </h1>

        <p className="text-neutral-600 text-sm max-w-lg mb-5 leading-relaxed font-medium">
          {theme.description}
        </p>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star key={n} className="w-4 h-4 fill-[#0F7B3A] text-[#0F7B3A]" />
            ))}
          </div>
          <span className="font-bold text-[#08120B] text-sm">4.9</span>
          <span className="text-neutral-400 text-xs">from 12,000+ verified reviews</span>
        </div>

        {(p.themes ?? []).length > 1 && (
          <Note>
            Rotates through {p.themes.length} headlines every{' '}
            {Math.round((p.autoRotateMs ?? 6000) / 1000)}s — showing the first
          </Note>
        )}
      </Frame>
    );
  }

  // ── HERO IMAGE CARDS ──────────────────────────────────────────────────────
  if (blockKey === 'home.hero_images') {
    return (
      <div className="grid grid-cols-3 gap-3">
        {(p.items ?? []).map((item: Row, i: number) => (
          <div key={i} className="relative rounded-2xl overflow-hidden aspect-4/3 bg-neutral-100">
            <FadeImage src={item.src} alt={item.alt ?? ''} className="w-full h-full object-cover" />
            <div className="absolute bottom-2 left-2 right-2 rounded-lg bg-white/95 backdrop-blur px-2.5 py-2">
              <p className="text-[10px] font-black text-[#08120B] leading-tight">{item.caption}</p>
              <p className="text-[8px] text-neutral-500 leading-snug mt-0.5">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── CATEGORY CIRCLES ──────────────────────────────────────────────────────
  if (blockKey === 'home.categories') {
    return (
      <div className="grid grid-cols-5 sm:grid-cols-7 gap-x-3 gap-y-5">
        {(p.items ?? []).map((cat: Row, i: number) => (
          <div key={i} className="flex flex-col items-center gap-2.5">
            <div className="relative">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-neutral-100 border-2 border-white ring-1 ring-neutral-200 shadow-sm">
                <FadeImage
                  src={cat.image}
                  alt={cat.title ?? ''}
                  className="w-full h-full object-cover"
                />
              </div>
              {cat.badge && (
                <span
                  className={`absolute -top-1 -right-1 text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wide shadow-sm border border-white ${
                    cat.badge === 'NEW'
                      ? 'bg-[#0F7B3A] text-white'
                      : cat.badge === 'HOT'
                        ? 'bg-red-500 text-white'
                        : 'bg-white text-emerald-700'
                  }`}
                >
                  {cat.badge}
                </span>
              )}
            </div>
            <div className="text-center">
              <h3 className="text-[10px] font-bold text-[#08120B] line-clamp-1">{cat.title}</h3>
              <p className="text-[8px] text-neutral-500 line-clamp-1">{cat.count}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── PROMO CAROUSEL ────────────────────────────────────────────────────────
  if (blockKey === 'home.promo_slides') {
    const items = p.items ?? [];
    return (
      <div className="space-y-3">
        {items.map((s: Row, i: number) => (
          <div
            key={i}
            className="relative rounded-2xl overflow-hidden bg-[#08120B] flex items-stretch min-h-[128px]"
          >
            <div className="absolute inset-0">
              <FadeImage src={s.image} alt={s.alt ?? ''} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-transparent" />
            </div>
            <div className="relative z-10 p-4 flex flex-col justify-center max-w-[70%]">
              <p className="text-[8px] font-bold tracking-widest text-emerald-400 uppercase mb-1">
                {s.eyebrow}
              </p>
              <p className="text-lg font-black text-white leading-tight">
                {s.title} <span className="text-emerald-400">{s.titleAccent}</span>
              </p>
              <p className="text-[10px] text-white/70 mt-1 line-clamp-2 leading-relaxed">{s.copy}</p>
              <span className="mt-2.5 inline-flex w-fit items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[10px] font-bold text-[#08120B]">
                {s.cta} <ArrowRight className="w-3 h-3" />
              </span>
            </div>
            {(s.badgeLine1 || s.badgeLine2) && (
              <div className="relative z-10 ml-auto flex flex-col items-center justify-center bg-[#0F7B3A] px-4 text-center">
                <span className="text-[8px] font-bold text-white/80 uppercase">{s.badgeLine1}</span>
                <span className="text-sm font-black text-white leading-tight">{s.badgeLine2}</span>
              </div>
            )}
          </div>
        ))}
        <Note>Auto-advances every {Math.round((p.autoRotateMs ?? 4500) / 1000)}s</Note>
      </div>
    );
  }

  // ── INSTAGRAM STRIP ───────────────────────────────────────────────────────
  if (blockKey === 'home.instagram') {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Instagram className="w-4 h-4 text-[#0F7B3A]" />
          <span className="text-xs font-bold text-[#08120B]">Follow {p.handle}</span>
        </div>
        <div className="grid grid-cols-6 gap-2">
          {(p.items ?? []).map((post: Row, i: number) => (
            <div
              key={i}
              className={`relative aspect-square rounded-xl overflow-hidden ${
                post.fit === 'contain' ? 'bg-white border border-neutral-200' : 'bg-neutral-100'
              }`}
            >
              <FadeImage
                src={post.image}
                alt={post.alt ?? ''}
                className={`w-full h-full ${post.fit === 'contain' ? 'object-contain p-1' : 'object-cover'}`}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── STATS BAND ────────────────────────────────────────────────────────────
  if (blockKey === 'home.stats') {
    return (
      <div className="bg-[#0F7B3A] rounded-2xl py-8 px-4">
        <div className="text-center mb-6">
          <h2 className="text-white font-black text-xl tracking-tight leading-none">Why IGO?</h2>
          <p className="text-white/70 text-[9px] font-bold mt-2 uppercase tracking-widest">
            {p.heading}
          </p>
        </div>
        <div className="flex items-center justify-center gap-6">
          {(p.items ?? []).map((badge: Row, i: number) => (
            <div key={i} className="flex flex-col items-center gap-2 shrink-0">
              <div className="w-18 h-18 rounded-full bg-white border-4 border-white/25 flex items-center justify-center shadow-md px-2">
                <span className="text-[#08120B] font-black text-xs text-center leading-none">
                  {badge.value}
                </span>
              </div>
              <span className="text-white/85 text-[8px] font-bold uppercase tracking-widest leading-tight text-center w-18">
                {badge.label}
              </span>
            </div>
          ))}
        </div>
        <Note dark>
          {'{{productCount}}'} is replaced with the live catalog count on the site
        </Note>
      </div>
    );
  }

  // ── VALUE PROPS ───────────────────────────────────────────────────────────
  if (blockKey === 'home.value_props') {
    return (
      <div className="bg-[#0F7B3A] rounded-2xl p-6 grid grid-cols-4 gap-4">
        {(p.items ?? []).map((item: Row, i: number) => {
          const Icon = resolveIcon(item.icon);
          return (
            <div key={i} className="flex flex-col items-center text-center gap-2">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                <Icon className="w-5 h-5 text-[#0F7B3A]" />
              </div>
              <p className="text-[10px] font-black text-white uppercase tracking-wide leading-tight">
                {item.title}
              </p>
              <p className="text-[8px] text-white/70 leading-snug">{item.text}</p>
            </div>
          );
        })}
      </div>
    );
  }

  // ── PROMO TILES / PARTNERS ────────────────────────────────────────────────
  if (blockKey === 'sections.promo_tiles' || blockKey === 'sections.partners') {
    return (
      <div className="grid grid-cols-2 gap-3">
        {(p.items ?? []).map((tile: Row, i: number) => (
          <div
            key={i}
            className="relative rounded-2xl overflow-hidden min-h-[110px] flex items-end p-3"
          >
            <div className="absolute inset-0">
              <FadeImage src={tile.image} alt="" className="w-full h-full object-cover" />
              <div
                className={`absolute inset-0 ${tile.theme === 'light' ? 'bg-white/75' : 'bg-black/60'}`}
              />
            </div>
            <div className="relative z-10">
              {tile.badge && (
                <span className="mb-1 inline-block rounded-full bg-[#0F7B3A] px-2 py-0.5 text-[7px] font-black text-white uppercase">
                  {tile.badge}
                </span>
              )}
              <p
                className={`text-xs font-black leading-tight ${tile.theme === 'light' ? 'text-[#08120B]' : 'text-white'}`}
              >
                {tile.title}
              </p>
              <p
                className={`text-[9px] mt-0.5 line-clamp-2 ${tile.theme === 'light' ? 'text-neutral-600' : 'text-white/70'}`}
              >
                {tile.subtitle || tile.text}
              </p>
              <span
                className={`mt-1.5 inline-block text-[8px] font-bold uppercase tracking-wider ${tile.theme === 'light' ? 'text-[#0F7B3A]' : 'text-emerald-400'}`}
              >
                {tile.cta} →
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── BUNDLE BANNER ─────────────────────────────────────────────────────────
  if (blockKey === 'sections.bundle_banner') {
    return (
      <div className="relative rounded-2xl overflow-hidden min-h-[150px] flex items-center">
        <div className="absolute inset-0">
          <FadeImage src={p.image} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-transparent" />
        </div>
        <div className="relative z-10 p-5 max-w-[65%]">
          <p className="text-[8px] font-bold tracking-widest text-emerald-400 uppercase">
            {p.eyebrow}
          </p>
          <p className="mt-1 text-xl font-black text-white leading-tight">
            {p.heading} <span className="text-emerald-400">{p.headingAccent}</span>
          </p>
          <p className="mt-1.5 text-[10px] text-white/70 line-clamp-2 leading-relaxed">{p.body}</p>
          <span className="mt-3 inline-block rounded-full bg-white px-4 py-1.5 text-[10px] font-bold text-[#08120B]">
            {p.cta}
          </span>
        </div>
        {p.badge && (
          <div className="relative z-10 ml-auto mr-4 rounded-xl bg-[#0F7B3A] px-3 py-2 text-center">
            <span className="text-xs font-black text-white">{p.badge}</span>
          </div>
        )}
      </div>
    );
  }

  // ── POPULAR SEARCHES ──────────────────────────────────────────────────────
  if (blockKey === 'sections.popular_searches') {
    return (
      <div className="space-y-2.5">
        <p className="text-xs font-bold text-[#08120B]">{p.heading}</p>
        <div className="flex flex-wrap gap-2">
          {(p.items ?? []).map((chip: Row, i: number) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-neutral-700"
            >
              <Search className="w-3 h-3 text-neutral-400" />
              {chip.label}
            </span>
          ))}
        </div>
      </div>
    );
  }

  // ── APP BANNER / NEWSLETTER / TEXT BLOCKS ─────────────────────────────────
  if (blockKey === 'home.app_banner' || blockKey === 'home.newsletter') {
    return (
      <div className="relative rounded-2xl overflow-hidden bg-[#08120B] p-5 flex items-center gap-4">
        {p.image && (
          <div className="absolute inset-0 opacity-25">
            <FadeImage src={p.image} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="relative z-10 flex-1">
          {p.eyebrow && (
            <p className="text-[8px] font-bold tracking-widest text-emerald-400 uppercase">
              {p.eyebrow}
            </p>
          )}
          <p className="mt-1 text-lg font-black text-white leading-tight">{p.heading}</p>
          <p className="mt-1.5 text-[10px] text-white/70 leading-relaxed max-w-sm">{p.body}</p>
          {p.cta && (
            <div className="mt-3 flex items-center gap-2">
              <span className="rounded-lg bg-white/10 px-3 py-1.5 text-[10px] text-white/50">
                {p.placeholder}
              </span>
              <span className="rounded-lg bg-[#0F7B3A] px-3 py-1.5 text-[10px] font-bold text-white">
                {p.cta}
              </span>
            </div>
          )}
        </div>
        {p.qrImage && (
          <div className="relative z-10 h-20 w-20 shrink-0 rounded-lg bg-white p-1.5">
            <FadeImage src={p.qrImage} alt="QR" className="w-full h-full object-contain" />
          </div>
        )}
      </div>
    );
  }

  // ── FOOTER ────────────────────────────────────────────────────────────────
  if (blockKey === 'site.footer') {
    return (
      <div className="rounded-2xl bg-[#08120B] p-5 text-white">
        <p className="text-[10px] text-white/60 leading-relaxed max-w-sm">{p.tagline}</p>
        <div className="mt-4 grid grid-cols-4 gap-4">
          {(p.columns ?? []).map((col: Row, i: number) => (
            <div key={i}>
              <p className="text-[9px] font-black tracking-wider text-white uppercase">
                {col.title}
              </p>
              <ul className="mt-2 space-y-1">
                {(col.links ?? []).map((l: Row, j: number) => (
                  <li key={j} className="text-[9px] text-white/55">
                    {l.label}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <p className="text-[9px] font-black tracking-wider text-white uppercase">Contact</p>
            <p className="mt-2 text-[9px] text-white/55">{p.phone}</p>
            <p className="text-[9px] text-white/55">{p.email}</p>
            <p className="mt-1 text-[9px] leading-snug text-white/55">{p.address}</p>
          </div>
        </div>
        <p className="mt-4 border-t border-white/10 pt-3 text-[8px] text-white/35">
          {p.copyright}
        </p>
      </div>
    );
  }

  // ── PLANS / RECIPES / GUIDES ──────────────────────────────────────────────
  if (blockKey.startsWith('plans.')) {
    return (
      <div className="space-y-3">
        {p.heading && <p className="text-sm font-black text-[#08120B]">{p.heading}</p>}
        <div className="grid grid-cols-3 gap-3">
          {(p.items ?? []).map((item: Row, i: number) => (
            <div key={i} className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
              {item.image && (
                <div className="aspect-4/3 bg-neutral-100">
                  <FadeImage src={item.image} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-2.5">
                {item.badge && (
                  <span className="mb-1 inline-block rounded-full bg-[#0F7B3A] px-1.5 py-0.5 text-[7px] font-black text-white uppercase">
                    {item.badge}
                  </span>
                )}
                <p className="text-[11px] font-bold text-[#08120B] leading-tight line-clamp-2">
                  {item.title}
                </p>
                <p className="mt-0.5 text-[9px] text-neutral-500 line-clamp-2">
                  {item.tagline || item.excerpt || item.difficulty}
                </p>
                {item.pricePerMonth != null && (
                  <p className="mt-1.5 text-xs font-black text-[#0F7B3A]">
                    ₹{item.pricePerMonth}
                    <span className="ml-1 text-[8px] font-normal text-neutral-400">
                      {item.frequency}
                    </span>
                  </p>
                )}
                {Array.isArray(item.ingredients) && (
                  <p className="mt-1 text-[8px] text-neutral-400">
                    {item.ingredients.length} ingredients · {(item.steps ?? []).length} steps
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── STATIC PAGES ──────────────────────────────────────────────────────────
  if (blockKey.startsWith('pages.')) {
    return (
      <div className="overflow-hidden rounded-2xl border border-neutral-200">
        {p.heroImage && (
          <div className="h-28 bg-neutral-100">
            <FadeImage src={p.heroImage} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="space-y-3 p-4">
          <p className="text-lg font-black text-[#08120B]">{p.title}</p>
          <p className="text-[11px] leading-relaxed text-neutral-600">{p.intro}</p>
          {(p.sections ?? []).map((s: Row, i: number) => (
            <div key={i} className="border-t border-neutral-100 pt-2.5">
              <p className="text-[11px] font-bold text-[#08120B]">{s.heading}</p>
              <p className="mt-0.5 text-[10px] leading-relaxed text-neutral-500 line-clamp-3">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── SEO ───────────────────────────────────────────────────────────────────
  if (blockKey === 'seo.pages') {
    return (
      <div className="space-y-2.5">
        <Note>How each page appears in Google results</Note>
        {(p.items ?? []).slice(0, 4).map((item: Row, i: number) => (
          <div key={i} className="rounded-lg border border-neutral-200 p-3">
            <p className="text-[10px] text-emerald-700">
              igoproteincuts.com<span className="text-neutral-400">{item.path}</span>
            </p>
            <p className="mt-0.5 text-sm text-[#1a0dab] leading-snug line-clamp-1">{item.title}</p>
            <p className="mt-0.5 text-[10px] leading-snug text-neutral-600 line-clamp-2">
              {item.description}
            </p>
          </div>
        ))}
        {(p.items ?? []).length > 4 && (
          <Note>+ {p.items.length - 4} more pages</Note>
        )}
      </div>
    );
  }

  // ── Fallback ──────────────────────────────────────────────────────────────
  return (
    <Frame>
      {p.eyebrow && (
        <p className="text-[9px] font-bold tracking-widest text-emerald-600 uppercase">
          {p.eyebrow}
        </p>
      )}
      {(p.heading || p.title) && (
        <p className="mt-1 text-base font-black text-[#08120B]">{p.heading || p.title}</p>
      )}
      {(p.body || p.intro || p.subheading) && (
        <p className="mt-1.5 text-[11px] leading-relaxed text-neutral-600">
          {p.body || p.intro || p.subheading}
        </p>
      )}
      {Array.isArray(p.items) && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {p.items.map((item: Row, i: number) => {
            const Icon = resolveIcon(item.icon);
            return (
              <div
                key={i}
                className="flex items-start gap-2 rounded-lg border border-neutral-200 p-2.5"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-emerald-50">
                  <Icon className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-bold text-[#08120B]">
                    {item.title || item.name || item.label}
                  </p>
                  <p className="line-clamp-2 text-[9px] text-neutral-500">
                    {item.text || item.desc || item.caption}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Frame>
  );
};

// ── Small helpers ───────────────────────────────────────────────────────────

const Frame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="rounded-2xl bg-gradient-to-br from-white to-emerald-50/40 p-5">{children}</div>
);

const Note: React.FC<{ children: React.ReactNode; dark?: boolean }> = ({ children, dark }) => (
  <p className={`mt-3 text-[9px] ${dark ? 'text-white/50' : 'text-neutral-400'}`}>{children}</p>
);
