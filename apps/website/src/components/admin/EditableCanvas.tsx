import React from 'react';
import { Star, Search, ArrowRight, Instagram, Check, Minus, ChevronRight } from 'lucide-react';
import { resolveIcon } from '../../lib/iconMap';
import {
  EditableText,
  EditableImage,
  ItemControls,
  AddItemButton,
  EditableItem,
  WithEditIcon
} from './Editable';
import { RailProductPicker } from './RailProductPicker';

/**
 * EDITABLE CANVAS — the section rendered as it appears on the site, with every
 * bit of text and every image editable in place.
 *
 * Click a headline and type. Hover an image and press "Change image". Hover a
 * card and reorder or delete it. There's no separate form for the common cases;
 * the ContentEditor still offers a full field list underneath for anything the
 * canvas doesn't surface (paths, ids, icon names).
 *
 * Markup mirrors the real components — the same Tailwind classes as
 * HomePage.tsx and the section files — so what you edit looks like what ships.
 */

interface CanvasProps {
  blockKey: string;
  payload: Record<string, any>;
  /** path is a jsonb path, e.g. ['items', 2, 'title'] */
  onChange: (path: (string | number)[], value: unknown) => void;
  /** Opens the media library; calls `apply` with the chosen URL. */
  onPickImage: (apply: (url: string) => void) => void;
  notify: (msg: string, kind?: 'ok' | 'err') => void;
}

/**
 * Which merchandising flag drives each product rail. The rails render products
 * flagged in igo_product_web_meta rather than a hand-ordered list, so the
 * picker toggles the flag.
 */
const RAIL_FLAGS: Record<string, { flag: 'is_best_seller' | 'is_today_fresh' | 'is_flash_offer'; name: string }> = {
  'home.rail_top_picks': { flag: 'is_best_seller', name: 'Top Picks' },
  'home.rail_fresh_stock': { flag: 'is_today_fresh', name: "Today's Fresh Stock" },
  'home.rail_flash_deals': { flag: 'is_flash_offer', name: 'Flash Deals' }
};

/**
 * What drives the products in each rail that has no simple on/off flag.
 * Shown under the heading so it's obvious where to go to change them.
 */
const RAIL_NOTES: Record<string, string> = {
  'home.section_categories':
    'The category circles below this heading are edited in "Farm to Fork — categories".',
  'home.rail_combo_packs':
    'This rail shows every product in the "combo-packs" category. Add or edit those products in the main admin dashboard — their titles, prices and photos come from the catalog.',
  'home.rail_chef_picks':
    'This rail shows products that have a recipe pairing set. Add one under Product SEO to include a product here.'
};

export const EditableCanvas: React.FC<CanvasProps> = ({
  blockKey,
  payload: p,
  onChange,
  onPickImage,
  notify
}) => {
  // ── list helpers ──────────────────────────────────────────────────────────
  const items: any[] = Array.isArray(p.items) ? p.items : [];

  const setItems = (next: any[]) => onChange(['items'], next);
  const moveItem = (from: number, to: number) => {
    const copy = [...items];
    [copy[from], copy[to]] = [copy[to], copy[from]];
    setItems(copy);
  };
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));
  const addItem = () => {
    const template = items[0];
    const blank =
      template && typeof template === 'object'
        ? Object.fromEntries(Object.keys(template).map((k) => [k, '']))
        : '';
    setItems([...items, blank]);
  };

  /**
   * Editable text with a pencil badge on hover.
   *
   * The badge matters: without it the only affordance was a faint hover tint,
   * and people don't discover that text is clickable. `block` classes keep
   * their own wrapper display so layout doesn't shift.
   */
  const T = (
    path: (string | number)[],
    value: string,
    className: string,
    opts?: { multiline?: boolean; placeholder?: string }
  ) => (
    <WithEditIcon className={className.includes('block') ? 'block w-full' : ''}>
      <EditableText
        value={value ?? ''}
        onChange={(v) => onChange(path, v)}
        className={className}
        multiline={opts?.multiline}
        placeholder={opts?.placeholder}
      />
    </WithEditIcon>
  );

  const Img = (path: (string | number)[], src: string, className: string, alt = '') => (
    <EditableImage
      src={src ?? ''}
      alt={alt}
      className={className}
      onPick={onPickImage}
      onChange={(url) => onChange(path, url)}
    />
  );

  // ── COMPARISON TABLE — rendered like the real dark table on the site ─────
  if (blockKey === 'sections.comparison') {
    const rows: any[] = p.rows ?? [];
    const cols = p.columns ?? {};
    return (
      <div className="space-y-4">
        <div className="mx-auto max-w-2xl space-y-1.5 text-center">
          {T(['eyebrow'], p.eyebrow, 'block text-xs font-bold tracking-widest text-emerald-600 uppercase')}
          {T(['heading'], p.heading, 'block text-2xl font-black tracking-tight text-[#08120B]')}
          {T(['subheading'], p.subheading, 'block text-xs text-neutral-600', { multiline: true })}
        </div>

        <div className="overflow-hidden rounded-2xl">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#08120B]">
                <th className="px-4 py-3 text-[9px] font-bold tracking-wider text-white/50 uppercase">
                  {T(['columns', 'feature'], cols.feature, '')}
                </th>
                <th className="border-x border-emerald-500/20 bg-[#0F7B3A]/20 px-4 py-3">
                  {T(['columns', 'igo'], cols.igo, 'text-sm font-black tracking-tight text-white')}
                </th>
                <th className="px-4 py-3 text-[9px] font-bold tracking-wider text-white/50 uppercase">
                  {T(['columns', 'local'], cols.local, '')}
                </th>
                <th className="px-4 py-3 text-[9px] font-bold tracking-wider text-white/50 uppercase">
                  {T(['columns', 'competitor'], cols.competitor, '')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {rows.map((r, i) => (
                <tr key={i} className="group/item relative border-b border-neutral-100 last:border-0">
                  <td className="relative px-4 py-3">
                    <ItemControls
                      index={i}
                      total={rows.length}
                      onMove={(a, b) => {
                        const copy = [...rows];
                        [copy[a], copy[b]] = [copy[b], copy[a]];
                        onChange(['rows'], copy);
                      }}
                      onRemove={(idx) => onChange(['rows'], rows.filter((_, j) => j !== idx))}
                    />
                    {T(['rows', i, 'feature'], r.feature, 'text-xs font-bold text-[#08120B]')}
                  </td>
                  <td className="bg-emerald-50/40 px-4 py-3">
                    <span className="flex items-start gap-1.5">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0F7B3A]" />
                      {T(['rows', i, 'igo'], r.igo, 'text-xs font-bold text-[#0F7B3A]')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-start gap-1.5">
                      <Minus className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-300" />
                      {T(['rows', i, 'local'], r.local, 'text-xs text-neutral-500')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-start gap-1.5">
                      <Minus className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-300" />
                      {T(['rows', i, 'competitor'], r.competitor, 'text-xs text-neutral-500')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <AddItemButton
          label="Add a comparison row"
          onClick={() =>
            onChange(['rows'], [...rows, { feature: '', igo: '', local: '', competitor: '' }])
          }
          className="w-full"
        />
      </div>
    );
  }

  // ── PRODUCT RAIL HEADINGS — heading + which products appear ───────────────
  if (blockKey.startsWith('home.rail_') || blockKey === 'home.section_categories') {
    const rail = RAIL_FLAGS[blockKey];
    return (
      <div className="space-y-4">
        {/* Header styled like the real rail header on the homepage */}
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-neutral-100 pb-3">
          <div>
            <span className="mb-1 flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 fill-emerald-600 text-emerald-600" />
              {T(['eyebrow'], p.eyebrow, 'text-[11px] font-bold tracking-widest text-emerald-600 uppercase')}
            </span>
            {T(['heading'], p.heading, 'block text-2xl font-black tracking-tight text-[#08120B]')}
            {p.subheading !== undefined &&
              T(['subheading'], p.subheading, 'mt-1 block max-w-2xl text-xs text-neutral-600', { multiline: true })}
          </div>
          {p.viewAllLabel !== undefined && (
            <span className="flex items-center gap-1 text-xs font-bold text-[#0F7B3A]">
              {T(['viewAllLabel'], p.viewAllLabel, '')}
              <ChevronRight className="h-3.5 w-3.5" />
            </span>
          )}
          {p.badge !== undefined && (
            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-[#0F7B3A]">
              {T(['badge'], p.badge, '')}
            </span>
          )}
        </div>

        {rail ? (
          <RailProductPicker flag={rail.flag} railName={rail.name} notify={notify} />
        ) : (
          <p className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-[11px] leading-relaxed text-neutral-600">
            {RAIL_NOTES[blockKey] ??
              'The products in this section come from the catalog and are managed in the main admin dashboard.'}
          </p>
        )}
      </div>
    );
  }

  // ── HERO ──────────────────────────────────────────────────────────────────
  if (blockKey === 'home.hero') {
    const themes: any[] = p.themes ?? [];
    return (
      <div className="space-y-4">
        {themes.map((theme, i) => (
          <EditableItem
            key={i}
            className="rounded-2xl bg-gradient-to-br from-white to-emerald-50/50 p-5 ring-1 ring-neutral-200"
          >
            <ItemControls
              index={i}
              total={themes.length}
              onMove={(a, b) => {
                const copy = [...themes];
                [copy[a], copy[b]] = [copy[b], copy[a]];
                onChange(['themes'], copy);
              }}
              onRemove={(idx) => onChange(['themes'], themes.filter((_, j) => j !== idx))}
            />
            <div className="mb-3 flex items-center gap-2">
              <span className="h-px w-8 shrink-0 bg-[#D4AF37]" />
              {T(['themes', i, 'label'], theme.label, 'text-[#D4AF37] font-bold text-[10px] uppercase tracking-[0.2em]')}
            </div>
            <h1 className="mb-3 text-3xl leading-[1.05] font-black tracking-tighter text-[#08120B]">
              {T(['themes', i, 'headlineTop'], theme.headlineTop, 'block')}
              {T(['themes', i, 'headlineAccent'], theme.headlineAccent, 'text-[#0F7B3A]')}{' '}
              {T(['themes', i, 'headlineBottom'], theme.headlineBottom, '')}
            </h1>
            {T(['themes', i, 'description'], theme.description, 'block text-neutral-600 text-sm max-w-lg leading-relaxed font-medium', { multiline: true })}
            <div className="mt-4 flex items-center gap-3">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} className="h-4 w-4 fill-[#0F7B3A] text-[#0F7B3A]" />
                ))}
              </div>
              <span className="text-sm font-bold text-[#08120B]">4.9</span>
              <span className="text-xs text-neutral-400">from 12,000+ verified reviews</span>
            </div>
          </EditableItem>
        ))}
        <AddItemButton
          label="Add another headline"
          onClick={() => {
            const blank = { label: '', headlineTop: '', headlineAccent: '', headlineBottom: '', description: '' };
            onChange(['themes'], [...themes, blank]);
          }}
          className="w-full"
        />
      </div>
    );
  }

  // ── HERO IMAGE CARDS ──────────────────────────────────────────────────────
  if (blockKey === 'home.hero_images') {
    return (
      <div className="grid grid-cols-3 gap-3">
        {items.map((item, i) => (
          <EditableItem key={i} className="overflow-hidden rounded-2xl">
            <ItemControls index={i} total={items.length} onMove={moveItem} onRemove={removeItem} dark />
            <div className="relative aspect-4/3 bg-neutral-100">
              {Img(['items', i, 'src'], item.src, 'w-full h-full object-cover', item.alt)}
            </div>
            <div className="space-y-0.5 bg-white p-2.5 ring-1 ring-neutral-200">
              {T(['items', i, 'caption'], item.caption, 'block text-[11px] font-black text-[#08120B] leading-tight')}
              {T(['items', i, 'sub'], item.sub, 'block text-[9px] text-neutral-500 leading-snug', { multiline: true })}
            </div>
          </EditableItem>
        ))}
        <AddItemButton label="Add" onClick={addItem} className="min-h-[140px]" />
      </div>
    );
  }

  // ── PROMO CAROUSEL — the banner in your screenshot ────────────────────────
  if (blockKey === 'home.promo_slides') {
    return (
      <div className="space-y-3">
        {items.map((s, i) => (
          <EditableItem key={i} className="overflow-hidden rounded-2xl">
            <ItemControls index={i} total={items.length} onMove={moveItem} onRemove={removeItem} dark />
            <div className="relative flex min-h-[150px] items-stretch bg-[#08120B]">
              <div className="absolute inset-0">
                {Img(['items', i, 'image'], s.image, 'w-full h-full object-cover', s.alt)}
                <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-black/85 via-black/60 to-transparent" />
              </div>

              <div className="relative z-20 flex max-w-[68%] flex-col justify-center p-5">
                {T(['items', i, 'eyebrow'], s.eyebrow, 'block text-[9px] font-bold tracking-widest text-emerald-400 uppercase mb-1.5')}
                <p className="text-xl leading-tight font-black text-white">
                  {T(['items', i, 'title'], s.title, '')}{' '}
                  {T(['items', i, 'titleAccent'], s.titleAccent, 'text-emerald-400')}
                </p>
                {T(['items', i, 'copy'], s.copy, 'mt-1.5 block text-[11px] leading-relaxed text-white/70', { multiline: true })}
                <span className="mt-3 inline-flex w-fit items-center gap-1 rounded-full bg-white px-4 py-2 text-[11px] font-bold text-[#08120B]">
                  {T(['items', i, 'cta'], s.cta, '')}
                  <ArrowRight className="h-3 w-3" />
                </span>
              </div>

              <div className="relative z-20 ml-auto flex flex-col items-center justify-center bg-[#0F7B3A] px-5 text-center">
                {T(['items', i, 'badgeLine1'], s.badgeLine1, 'block text-[9px] font-bold text-white/80 uppercase tracking-wide')}
                {T(['items', i, 'badgeLine2'], s.badgeLine2, 'block text-base font-black text-white leading-tight mt-0.5')}
              </div>
            </div>
          </EditableItem>
        ))}
        <AddItemButton label="Add a slide" onClick={addItem} className="w-full" />
      </div>
    );
  }

  // ── CATEGORY CIRCLES ──────────────────────────────────────────────────────
  if (blockKey === 'home.categories') {
    return (
      <div className="grid grid-cols-5 gap-x-3 gap-y-5 sm:grid-cols-6">
        {items.map((cat, i) => (
          <EditableItem key={i} className="flex flex-col items-center gap-2">
            <ItemControls index={i} total={items.length} onMove={moveItem} onRemove={removeItem} />
            <div className="relative">
              <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-white bg-neutral-100 shadow-sm ring-1 ring-neutral-200">
                {Img(['items', i, 'image'], cat.image, 'w-full h-full object-cover', cat.title)}
              </div>
              {cat.badge !== undefined && (
                <span
                  className={`absolute -top-1 -right-1 rounded-full border border-white px-1.5 py-0.5 text-[7px] font-black tracking-wide uppercase shadow-sm ${
                    cat.badge === 'NEW' ? 'bg-[#0F7B3A] text-white' : 'bg-white text-emerald-700'
                  }`}
                >
                  {T(['items', i, 'badge'], cat.badge, '', { placeholder: '—' })}
                </span>
              )}
            </div>
            <div className="w-full text-center">
              {T(['items', i, 'title'], cat.title, 'block text-[10px] font-bold text-[#08120B]')}
              {T(['items', i, 'count'], cat.count, 'block text-[8px] text-neutral-500')}
            </div>
          </EditableItem>
        ))}
        <AddItemButton label="Add" onClick={addItem} className="min-h-[92px]" />
      </div>
    );
  }

  // ── INSTAGRAM ─────────────────────────────────────────────────────────────
  if (blockKey === 'home.instagram') {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Instagram className="h-4 w-4 text-[#0F7B3A]" />
          {T(['handle'], p.handle, 'text-xs font-bold text-[#08120B]')}
        </div>
        <div className="grid grid-cols-6 gap-2">
          {items.map((post, i) => (
            <EditableItem key={i}>
              <ItemControls index={i} total={items.length} onMove={moveItem} onRemove={removeItem} dark />
              <div
                className={`relative aspect-square overflow-hidden rounded-xl ${
                  post.fit === 'contain' ? 'border border-neutral-200 bg-white' : 'bg-neutral-100'
                }`}
              >
                {Img(
                  ['items', i, 'image'],
                  post.image,
                  `w-full h-full ${post.fit === 'contain' ? 'object-contain p-1' : 'object-cover'}`,
                  post.alt
                )}
              </div>
            </EditableItem>
          ))}
          <AddItemButton label="Add" onClick={addItem} className="aspect-square" />
        </div>
      </div>
    );
  }

  // ── STATS BAND ────────────────────────────────────────────────────────────
  if (blockKey === 'home.stats') {
    return (
      <div className="rounded-2xl bg-[#0F7B3A] px-4 py-8">
        <div className="mb-6 text-center">
          <h2 className="text-xl leading-none font-black tracking-tight text-white">Why IGO?</h2>
          {T(['heading'], p.heading, 'mt-2 block text-[9px] font-bold tracking-widest text-white/70 uppercase')}
        </div>
        <div className="flex items-start justify-center gap-6">
          {items.map((badge, i) => (
            <EditableItem key={i} className="flex flex-col items-center gap-2">
              <ItemControls index={i} total={items.length} onMove={moveItem} onRemove={removeItem} />
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white/25 bg-white px-1.5">
                {T(['items', i, 'value'], badge.value, 'text-center text-xs leading-none font-black text-[#08120B]')}
              </div>
              {T(['items', i, 'label'], badge.label, 'block w-20 text-center text-[8px] leading-tight font-bold tracking-widest text-white/85 uppercase')}
            </EditableItem>
          ))}
          <AddItemButton label="Add" onClick={addItem} className="h-16 w-16 !rounded-full border-white/30 text-white/60" />
        </div>
        <p className="mt-4 text-center text-[9px] text-white/40">
          {'{{productCount}}'} is replaced with the live catalog count
        </p>
      </div>
    );
  }

  // ── VALUE PROPS / CARD GRIDS ──────────────────────────────────────────────
  if (blockKey === 'home.value_props') {
    return (
      <div className="grid grid-cols-4 gap-4 rounded-2xl bg-[#0F7B3A] p-6">
        {items.map((item, i) => {
          const Icon = resolveIcon(item.icon);
          return (
            <EditableItem key={i} className="flex flex-col items-center gap-2 text-center">
              <ItemControls index={i} total={items.length} onMove={moveItem} onRemove={removeItem} />
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
                <Icon className="h-5 w-5 text-[#0F7B3A]" />
              </div>
              {T(['items', i, 'title'], item.title, 'block text-[10px] font-black tracking-wide text-white uppercase leading-tight')}
              {T(['items', i, 'text'], item.text, 'block text-[8px] leading-snug text-white/70', { multiline: true })}
            </EditableItem>
          );
        })}
      </div>
    );
  }

  // ── PROMO TILES / PARTNERS ────────────────────────────────────────────────
  if (blockKey === 'sections.promo_tiles' || blockKey === 'sections.partners') {
    return (
      <div className="grid grid-cols-2 gap-3">
        {items.map((tile, i) => {
          const light = tile.theme === 'light';
          return (
            <EditableItem key={i} className="overflow-hidden rounded-2xl">
              <ItemControls index={i} total={items.length} onMove={moveItem} onRemove={removeItem} dark />
              <div className="relative flex min-h-[130px] items-end p-4">
                <div className="absolute inset-0">
                  {Img(['items', i, 'image'], tile.image, 'w-full h-full object-cover')}
                  <div
                    className={`pointer-events-none absolute inset-0 z-10 ${light ? 'bg-white/75' : 'bg-black/60'}`}
                  />
                </div>
                <div className="relative z-20">
                  {T(['items', i, 'title'], tile.title, `block text-sm font-black leading-tight ${light ? 'text-[#08120B]' : 'text-white'}`)}
                  {T(['items', i, tile.subtitle !== undefined ? 'subtitle' : 'text'], tile.subtitle ?? tile.text, `mt-0.5 block text-[10px] ${light ? 'text-neutral-600' : 'text-white/70'}`, { multiline: true })}
                  {T(['items', i, 'cta'], tile.cta, `mt-2 block text-[9px] font-bold tracking-wider uppercase ${light ? 'text-[#0F7B3A]' : 'text-emerald-400'}`)}
                </div>
              </div>
            </EditableItem>
          );
        })}
        <AddItemButton label="Add tile" onClick={addItem} className="min-h-[130px]" />
      </div>
    );
  }

  // ── BUNDLE BANNER ─────────────────────────────────────────────────────────
  if (blockKey === 'sections.bundle_banner') {
    return (
      <div className="relative flex min-h-[170px] items-center overflow-hidden rounded-2xl">
        <div className="absolute inset-0">
          {Img(['image'], p.image, 'w-full h-full object-cover')}
          <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-black/90 via-black/65 to-transparent" />
        </div>
        <div className="relative z-20 max-w-[62%] p-5">
          {T(['eyebrow'], p.eyebrow, 'block text-[9px] font-bold tracking-widest text-emerald-400 uppercase')}
          <p className="mt-1 text-xl leading-tight font-black text-white">
            {T(['heading'], p.heading, '')}{' '}
            {T(['headingAccent'], p.headingAccent, 'text-emerald-400')}
          </p>
          {T(['body'], p.body, 'mt-1.5 block text-[11px] leading-relaxed text-white/70', { multiline: true })}
          <span className="mt-3 inline-block rounded-full bg-white px-4 py-2 text-[11px] font-bold text-[#08120B]">
            {T(['cta'], p.cta, '')}
          </span>
        </div>
        <div className="relative z-20 mr-5 ml-auto rounded-xl bg-[#0F7B3A] px-4 py-2.5 text-center">
          {T(['badge'], p.badge, 'text-sm font-black text-white')}
        </div>
      </div>
    );
  }

  // ── TICKER STRIP — the scrolling marquee above the promo carousel ─────────
  if (blockKey === 'home.ticker') {
    return (
      <div className="space-y-3">
        <div className="overflow-hidden rounded-t-2xl border-b border-white/10 bg-[#08120B] py-2">
          <div className="flex flex-wrap items-center">
            {items.map((item, i) => (
              <EditableItem key={i} className="flex shrink-0 items-center gap-4 px-5 py-1">
                <ItemControls index={i} total={items.length} onMove={moveItem} onRemove={removeItem} dark />
                {T(['items', i, 'label'], item.label, 'text-[10px] font-bold tracking-wider text-emerald-400 uppercase')}
                <span className="text-white/30">•</span>
              </EditableItem>
            ))}
          </div>
        </div>
        <AddItemButton label="Add a ticker item" onClick={addItem} className="w-full" />
        <p className="text-[10px] leading-relaxed text-neutral-400">
          This list scrolls continuously on the site — it's rendered twice so the loop is seamless.
          Keep each item short; long phrases slow the loop down noticeably.
        </p>
      </div>
    );
  }

  // ── TICKER STRIP — the dark bar above the promo carousel ──────────────────
  if (blockKey === 'home.ticker') {
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 rounded-xl bg-[#08120B] px-5 py-3">
          {items.map((chip, i) => (
            <EditableItem key={i} className="flex items-center gap-6">
              <ItemControls index={i} total={items.length} onMove={moveItem} onRemove={removeItem} dark />
              {T(['items', i, 'label'], chip.label, 'text-[10px] font-bold tracking-wider text-emerald-400 uppercase')}
              {i < items.length - 1 && <span className="h-1 w-1 rounded-full bg-white/25" />}
            </EditableItem>
          ))}
        </div>
        <AddItemButton label="Add a ticker item" onClick={addItem} className="w-full" />
        <p className="text-[10px] text-neutral-400">
          Keep these short — they sit on one line and scroll on mobile.
        </p>
      </div>
    );
  }

  // ── POPULAR SEARCHES ──────────────────────────────────────────────────────
  if (blockKey === 'sections.popular_searches') {
    return (
      <div className="space-y-3">
        {T(['heading'], p.heading, 'block text-xs font-bold text-[#08120B]')}
        <div className="flex flex-wrap items-center gap-2">
          {items.map((chip, i) => (
            <EditableItem key={i}>
              <ItemControls index={i} total={items.length} onMove={moveItem} onRemove={removeItem} />
              <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-2 text-[11px] font-semibold text-neutral-700">
                <Search className="h-3 w-3 shrink-0 text-neutral-400" />
                {T(['items', i, 'label'], chip.label, '')}
              </span>
            </EditableItem>
          ))}
          <AddItemButton label="Add" onClick={addItem} className="px-4 !py-2" />
        </div>
      </div>
    );
  }

  // ── APP BANNER / NEWSLETTER ───────────────────────────────────────────────
  if (blockKey === 'home.app_banner' || blockKey === 'home.newsletter') {
    return (
      <div className="relative flex items-center gap-4 overflow-hidden rounded-2xl bg-[#08120B] p-5">
        {p.image !== undefined && (
          <div className="absolute inset-0 opacity-25">
            {Img(['image'], p.image, 'w-full h-full object-cover')}
          </div>
        )}
        <div className="relative z-20 flex-1">
          {p.eyebrow !== undefined &&
            T(['eyebrow'], p.eyebrow, 'block text-[9px] font-bold tracking-widest text-emerald-400 uppercase')}
          {T(['heading'], p.heading, 'mt-1 block text-lg font-black leading-tight text-white')}
          {T(['body'], p.body, 'mt-1.5 block max-w-sm text-[11px] leading-relaxed text-white/70', { multiline: true })}
          {p.cta !== undefined && (
            <div className="mt-3 flex items-center gap-2">
              <span className="rounded-lg bg-white/10 px-3 py-2 text-[11px] text-white/50">
                {T(['placeholder'], p.placeholder, '')}
              </span>
              <span className="rounded-lg bg-[#0F7B3A] px-3 py-2 text-[11px] font-bold text-white">
                {T(['cta'], p.cta, '')}
              </span>
            </div>
          )}
        </div>
        {p.qrImage !== undefined && (
          <div className="relative z-20 h-20 w-20 shrink-0 rounded-lg bg-white p-1.5">
            {Img(['qrImage'], p.qrImage, 'w-full h-full object-contain')}
          </div>
        )}
      </div>
    );
  }

  // ── SUBSCRIPTION PLANS — the dark green plan cards ────────────────────────
  if (blockKey === 'plans.subscriptions') {
    return (
      <div className="space-y-5 rounded-2xl bg-[#0A2818] p-6">
        <div className="space-y-1.5 text-center">
          {T(['eyebrow'], p.eyebrow, 'block text-[10px] font-bold tracking-widest text-emerald-400 uppercase')}
          {T(['heading'], p.heading, 'block text-2xl font-black tracking-tight text-white')}
        </div>

        <div className="grid grid-cols-4 gap-3">
          {items.map((plan, i) => (
            <EditableItem
              key={i}
              className="rounded-2xl border border-emerald-500/25 bg-[#08120B] p-4"
            >
              <ItemControls index={i} total={items.length} onMove={moveItem} onRemove={removeItem} dark />
              {plan.badge !== undefined && (
                <span className="mb-2 inline-block rounded-full bg-[#D4AF37] px-2 py-0.5 text-[8px] font-black tracking-wide text-[#08120B] uppercase">
                  {T(['items', i, 'badge'], plan.badge, '', { placeholder: 'badge' })}
                </span>
              )}
              {T(['items', i, 'title'], plan.title, 'block text-sm leading-tight font-black text-white')}
              {T(['items', i, 'tagline'], plan.tagline, 'mt-0.5 block text-[10px] text-white/50', { multiline: true })}

              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-lg font-black text-emerald-400">
                  ₹{T(['items', i, 'pricePerMonth'], String(plan.pricePerMonth ?? ''), '')}
                </span>
                <span className="text-[10px] text-white/35 line-through">
                  ₹{T(['items', i, 'originalPrice'], String(plan.originalPrice ?? ''), '')}
                </span>
              </div>
              {T(['items', i, 'savings'], plan.savings, 'block text-[9px] font-bold text-[#D4AF37]')}

              <ul className="mt-3 space-y-1">
                {(plan.itemsIncluded ?? []).map((inc: string, j: number) => (
                  <li key={j} className="flex items-start gap-1.5">
                    <Check className="mt-0.5 h-2.5 w-2.5 shrink-0 text-emerald-400" />
                    {T(['items', i, 'itemsIncluded', j], inc, 'text-[9px] leading-snug text-white/70')}
                  </li>
                ))}
              </ul>
              <AddItemButton
                label="Add inclusion"
                onClick={() =>
                  onChange(['items', i, 'itemsIncluded'], [...(plan.itemsIncluded ?? []), ''])
                }
                className="mt-2 w-full !py-1.5 border-white/20 text-[9px] text-white/50"
              />

              <div className="mt-3 rounded-full bg-[#0F7B3A] py-2 text-center text-[10px] font-bold text-white">
                Activate Subscription
              </div>
            </EditableItem>
          ))}
          <AddItemButton
            label="Add plan"
            onClick={addItem}
            className="min-h-[240px] border-white/25 text-white/50 hover:border-emerald-400 hover:bg-white/5 hover:text-emerald-400"
          />
        </div>
      </div>
    );
  }

  // ── SIGNATURE RECIPES — photo cards ───────────────────────────────────────
  if (blockKey === 'plans.recipes') {
    return (
      <div className="space-y-5">
        <div className="flex items-end justify-between">
          <div>
            {T(['eyebrow'], p.eyebrow, 'block text-[10px] font-bold tracking-widest text-emerald-600 uppercase')}
            {T(['heading'], p.heading, 'block text-2xl font-black tracking-tight text-[#08120B]')}
          </div>
          <span className="text-xs font-bold text-[#0F7B3A]">Explore All Recipes ›</span>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {items.map((r, i) => (
            <EditableItem key={i} className="overflow-hidden rounded-2xl bg-[#08120B]">
              <ItemControls index={i} total={items.length} onMove={moveItem} onRemove={removeItem} dark />
              <div className="relative aspect-4/3">
                {Img(['items', i, 'image'], r.image, 'w-full h-full object-cover', r.title)}
                <span className="absolute top-2 left-2 z-20 rounded-full bg-[#0F7B3A] px-2 py-0.5 text-[8px] font-black text-white uppercase">
                  {T(['items', i, 'difficulty'], r.difficulty, '', { placeholder: 'level' })}
                </span>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-2/3 bg-gradient-to-t from-black to-transparent" />
                <div className="absolute right-3 bottom-3 left-3 z-20">
                  {T(['items', i, 'title'], r.title, 'block text-sm leading-tight font-black text-white')}
                  <p className="mt-1 flex items-center gap-2 text-[9px] text-white/60">
                    <span>
                      Prep {T(['items', i, 'prepTime'], r.prepTime, '')}
                    </span>
                    <span>·</span>
                    <span>
                      Cook {T(['items', i, 'cookTime'], r.cookTime, '')}
                    </span>
                  </p>
                </div>
              </div>
              <div className="p-3 text-[9px] text-white/50">
                {(r.ingredients ?? []).length} ingredients · {(r.steps ?? []).length} steps —
                edit them in All fields
              </div>
            </EditableItem>
          ))}
          <AddItemButton label="Add recipe" onClick={addItem} className="min-h-[220px]" />
        </div>
      </div>
    );
  }

  // ── COOK IT RIGHT GUIDES ──────────────────────────────────────────────────
  if (blockKey === 'plans.guides') {
    return (
      <div className="space-y-5">
        <div>
          {T(['eyebrow'], p.eyebrow, 'block text-[10px] font-bold tracking-widest text-emerald-600 uppercase')}
          {T(['heading'], p.heading, 'block text-2xl font-black tracking-tight text-[#08120B]')}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {items.map((g, i) => (
            <EditableItem key={i} className="overflow-hidden rounded-2xl border border-neutral-200">
              <ItemControls index={i} total={items.length} onMove={moveItem} onRemove={removeItem} dark />
              <div className="aspect-16/10 bg-neutral-100">
                {Img(['items', i, 'image'], g.image, 'w-full h-full object-cover', g.title)}
              </div>
              <div className="space-y-1.5 p-3">
                <span className="inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-[8px] font-bold text-emerald-700 uppercase">
                  {T(['items', i, 'category'], g.category, '', { placeholder: 'category' })}
                </span>
                {T(['items', i, 'title'], g.title, 'block text-xs leading-tight font-bold text-[#08120B]')}
                {T(['items', i, 'excerpt'], g.excerpt, 'block text-[10px] leading-snug text-neutral-500', { multiline: true })}
                <p className="text-[9px] font-semibold text-[#0F7B3A]">
                  {T(['items', i, 'readTime'], g.readTime, '')} · Read More ›
                </p>
              </div>
            </EditableItem>
          ))}
          <AddItemButton label="Add guide" onClick={addItem} className="min-h-[200px]" />
        </div>
      </div>
    );
  }

  // ── PLANS fallback ────────────────────────────────────────────────────────
  if (blockKey.startsWith('plans.')) {
    return (
      <div className="space-y-3">
        {T(['heading'], p.heading, 'block text-sm font-black text-[#08120B]')}
        <div className="grid grid-cols-3 gap-3">
          {items.map((item, i) => (
            <EditableItem key={i} className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
              <ItemControls index={i} total={items.length} onMove={moveItem} onRemove={removeItem} />
              {item.image !== undefined && (
                <div className="aspect-4/3 bg-neutral-100">
                  {Img(['items', i, 'image'], item.image, 'w-full h-full object-cover')}
                </div>
              )}
              <div className="p-2.5">
                {T(['items', i, 'title'], item.title, 'block text-[11px] font-bold leading-tight text-[#08120B]')}
                {T(['items', i, item.tagline !== undefined ? 'tagline' : 'excerpt'], item.tagline ?? item.excerpt, 'mt-0.5 block text-[9px] text-neutral-500', { multiline: true })}
                {item.pricePerMonth !== undefined && (
                  <p className="mt-1.5 text-xs font-black text-[#0F7B3A]">
                    ₹{T(['items', i, 'pricePerMonth'], String(item.pricePerMonth), '')}
                  </p>
                )}
              </div>
            </EditableItem>
          ))}
          <AddItemButton label="Add" onClick={addItem} className="min-h-[150px]" />
        </div>
      </div>
    );
  }

  // ── STATIC PAGES ──────────────────────────────────────────────────────────
  if (blockKey.startsWith('pages.')) {
    const sections: any[] = p.sections ?? [];
    return (
      <div className="overflow-hidden rounded-2xl border border-neutral-200">
        {p.heroImage !== undefined && (
          <div className="h-28 bg-neutral-100">{Img(['heroImage'], p.heroImage, 'w-full h-full object-cover')}</div>
        )}
        <div className="space-y-3 p-4">
          {T(['title'], p.title, 'block text-lg font-black text-[#08120B]')}
          {T(['intro'], p.intro, 'block text-[11px] leading-relaxed text-neutral-600', { multiline: true })}
          {sections.map((s, i) => (
            <EditableItem key={i} className="border-t border-neutral-100 pt-2.5">
              <ItemControls
                index={i}
                total={sections.length}
                onMove={(a, b) => {
                  const copy = [...sections];
                  [copy[a], copy[b]] = [copy[b], copy[a]];
                  onChange(['sections'], copy);
                }}
                onRemove={(idx) => onChange(['sections'], sections.filter((_, j) => j !== idx))}
              />
              {T(['sections', i, 'heading'], s.heading, 'block text-[11px] font-bold text-[#08120B]')}
              {T(['sections', i, 'body'], s.body, 'mt-0.5 block text-[10px] leading-relaxed text-neutral-500', { multiline: true })}
            </EditableItem>
          ))}
          <AddItemButton
            label="Add a section"
            onClick={() => onChange(['sections'], [...sections, { heading: '', body: '' }])}
            className="w-full"
          />
        </div>
      </div>
    );
  }

  // ── SEO — rendered as a Google result ─────────────────────────────────────
  if (blockKey === 'seo.pages') {
    return (
      <div className="space-y-3">
        <p className="text-[10px] text-neutral-400">How each page appears in Google results</p>
        {items.map((item, i) => (
          <EditableItem key={i} className="rounded-lg border border-neutral-200 p-3">
            <ItemControls index={i} total={items.length} onMove={moveItem} onRemove={removeItem} />
            <p className="text-[10px] text-emerald-700">
              igoproteincuts.com
              {T(['items', i, 'path'], item.path, 'text-neutral-400')}
            </p>
            {T(['items', i, 'title'], item.title, 'mt-0.5 block text-sm leading-snug text-[#1a0dab]')}
            {T(['items', i, 'description'], item.description, 'mt-0.5 block text-[10px] leading-snug text-neutral-600', { multiline: true })}
          </EditableItem>
        ))}
        <AddItemButton label="Add a page" onClick={addItem} className="w-full" />
      </div>
    );
  }

  // ── FOOTER ────────────────────────────────────────────────────────────────
  if (blockKey === 'site.footer') {
    const columns: any[] = p.columns ?? [];
    return (
      <div className="rounded-2xl bg-[#08120B] p-5 text-white">
        {T(['tagline'], p.tagline, 'block max-w-sm text-[10px] leading-relaxed text-white/60', { multiline: true })}
        <div className="mt-4 grid grid-cols-4 gap-4">
          {columns.map((col, ci) => (
            <div key={ci}>
              {T(['columns', ci, 'title'], col.title, 'block text-[9px] font-black tracking-wider text-white uppercase')}
              <ul className="mt-2 space-y-1">
                {(col.links ?? []).map((l: any, li: number) => (
                  <li key={li}>
                    {T(['columns', ci, 'links', li, 'label'], l.label, 'block text-[9px] text-white/55')}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <p className="text-[9px] font-black tracking-wider text-white uppercase">Contact</p>
            {T(['phone'], p.phone, 'mt-2 block text-[9px] text-white/55')}
            {T(['email'], p.email, 'block text-[9px] text-white/55')}
            {T(['address'], p.address, 'mt-1 block text-[9px] leading-snug text-white/55', { multiline: true })}
          </div>
        </div>
        {T(['copyright'], p.copyright, 'mt-4 block border-t border-white/10 pt-3 text-[8px] text-white/35')}
      </div>
    );
  }

  // ── HOW IT WORKS — 3 numbered circles, as on the site ─────────────────────
  if (blockKey === 'sections.how_it_works') {
    return (
      <div className="space-y-8">
        <div className="mx-auto max-w-2xl space-y-1.5 text-center">
          {T(['eyebrow'], p.eyebrow, 'block text-xs font-bold tracking-widest text-emerald-600 uppercase')}
          {T(['heading'], p.heading, 'block text-2xl font-black tracking-tight text-[#08120B]')}
        </div>

        <div className="relative grid grid-cols-3 gap-6">
          <div className="absolute top-10 right-[15%] left-[15%] hidden h-px bg-emerald-100 md:block" />
          {items.map((step, i) => {
            const Icon = resolveIcon(step.icon);
            return (
              <EditableItem key={i} className="relative text-center">
                <ItemControls index={i} total={items.length} onMove={moveItem} onRemove={removeItem} />
                <div className="relative z-10 mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-emerald-50 shadow-md">
                  <Icon className="h-8 w-8 text-emerald-600" />
                  <div className="absolute -top-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#0F7B3A] text-[11px] font-black text-white">
                    0{i + 1}
                  </div>
                </div>
                {T(['items', i, 'title'], step.title, 'mb-2 block text-base font-bold text-[#08120B]')}
                {T(['items', i, 'text'], step.text, 'mx-auto block max-w-xs text-xs leading-relaxed text-neutral-600', { multiline: true })}
              </EditableItem>
            );
          })}
        </div>
        <AddItemButton label="Add a step" onClick={addItem} className="w-full" />
      </div>
    );
  }

  // ── OUR FARMS — 3 photo cards ─────────────────────────────────────────────
  if (blockKey === 'sections.our_farms') {
    return (
      <div className="space-y-5">
        <div className="mx-auto max-w-2xl space-y-1.5 text-center">
          {T(['eyebrow'], p.eyebrow, 'block text-xs font-bold tracking-widest text-emerald-600 uppercase')}
          {T(['heading'], p.heading, 'block text-2xl font-black tracking-tight text-[#08120B]')}
          {p.subheading !== undefined &&
            T(['subheading'], p.subheading, 'block text-xs text-neutral-600', { multiline: true })}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {items.map((item, i) => (
            <EditableItem key={i} className="overflow-hidden rounded-2xl border border-neutral-200">
              <ItemControls index={i} total={items.length} onMove={moveItem} onRemove={removeItem} dark />
              <div className="aspect-4/3 bg-neutral-100">
                {Img(['items', i, 'image'], item.image, 'w-full h-full object-cover', item.label)}
              </div>
              <div className="space-y-0.5 p-3">
                {T(['items', i, 'label'], item.label, 'block text-sm font-black text-[#08120B]')}
                {T(['items', i, 'caption'], item.caption, 'block text-[11px] text-neutral-500', { multiline: true })}
              </div>
            </EditableItem>
          ))}
          <AddItemButton label="Add" onClick={addItem} className="min-h-[180px]" />
        </div>
      </div>
    );
  }

  // ── CERTIFICATIONS — badge row on the emerald band ────────────────────────
  if (blockKey === 'sections.certifications') {
    return (
      <div className="space-y-5 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-6">
        <div className="max-w-2xl space-y-1.5">
          {T(['eyebrow'], p.eyebrow, 'block text-xs font-bold tracking-widest text-emerald-600 uppercase')}
          {T(['heading'], p.heading, 'block text-2xl leading-tight font-black tracking-tight text-[#08120B]')}
        </div>

        <div className="grid grid-cols-4 gap-3">
          {items.map((c, i) => {
            const Icon = resolveIcon(c.icon);
            return (
              <EditableItem
                key={i}
                className="rounded-2xl border border-emerald-100 bg-white p-4 text-center shadow-sm"
              >
                <ItemControls index={i} total={items.length} onMove={moveItem} onRemove={removeItem} />
                <div className="mx-auto mb-2.5 flex h-11 w-11 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600">
                  <Icon className="h-5 w-5" />
                </div>
                {T(['items', i, 'name'], c.name, 'block text-sm font-bold text-[#08120B]')}
                {T(['items', i, 'desc'], c.desc, 'mt-0.5 block text-[10px] leading-snug text-neutral-500', { multiline: true })}
                {c.year !== undefined && (
                  <span className="mt-2 inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
                    {T(['items', i, 'year'], c.year, '', { placeholder: 'year' })}
                  </span>
                )}
              </EditableItem>
            );
          })}
          <AddItemButton label="Add" onClick={addItem} className="min-h-[130px]" />
        </div>
      </div>
    );
  }

  // ── FRESHNESS PILLARS — the black band ────────────────────────────────────
  if (blockKey === 'sections.freshness_pillars') {
    return (
      <div className="space-y-6 rounded-2xl bg-black p-7">
        <div className="space-y-1.5 text-center">
          {T(['eyebrow'], p.eyebrow, 'block text-xs font-bold tracking-[0.2em] text-white uppercase')}
          {T(['heading'], p.heading, 'block text-2xl font-black text-white')}
        </div>

        <div className="grid grid-cols-4 gap-5">
          {items.map((pillar, i) => {
            const Icon = resolveIcon(pillar.icon);
            return (
              <EditableItem key={i} className="flex flex-col items-center gap-2.5 text-center">
                <ItemControls index={i} total={items.length} onMove={moveItem} onRemove={removeItem} dark />
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10">
                  <Icon className="h-5 w-5 text-emerald-400" />
                </div>
                {T(['items', i, 'title'], pillar.title, 'block text-xs font-bold text-white')}
                {T(['items', i, 'text'], pillar.text, 'block text-[10px] leading-snug text-white/60', { multiline: true })}
              </EditableItem>
            );
          })}
        </div>
        <AddItemButton
          label="Add a pillar"
          onClick={addItem}
          className="w-full border-white/25 text-white/60 hover:border-emerald-400 hover:bg-white/5 hover:text-emerald-400"
        />
      </div>
    );
  }

  // ── TRUST STRIP — 3 wide cards ────────────────────────────────────────────
  if (blockKey === 'sections.trust_strip') {
    return (
      <div className="space-y-5">
        <div className="mx-auto max-w-xl space-y-1.5 text-center">
          {T(['eyebrow'], p.eyebrow, 'block text-xs font-bold tracking-widest text-emerald-600 uppercase')}
          {T(['heading'], p.heading, 'block text-2xl font-black tracking-tight text-[#08120B]')}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {items.map((item, i) => {
            const Icon = resolveIcon(item.icon);
            return (
              <EditableItem
                key={i}
                className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
              >
                <ItemControls index={i} total={items.length} onMove={moveItem} onRemove={removeItem} />
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50">
                  <Icon className="h-5 w-5 text-emerald-600" />
                </div>
                {T(['items', i, 'title'], item.title, 'block text-sm font-bold text-[#08120B]')}
                {T(['items', i, 'text'], item.text, 'mt-1.5 block text-[11px] leading-relaxed text-neutral-600', { multiline: true })}
              </EditableItem>
            );
          })}
          <AddItemButton label="Add" onClick={addItem} className="min-h-[150px]" />
        </div>
      </div>
    );
  }

  // ── Generic card list ─────────────────────────────────────────────────────
  if (items.length > 0) {
    return (
      <div className="space-y-3">
        {p.eyebrow !== undefined &&
          T(['eyebrow'], p.eyebrow, 'block text-[9px] font-bold tracking-widest text-emerald-600 uppercase')}
        {p.heading !== undefined && T(['heading'], p.heading, 'block text-base font-black text-[#08120B]')}
        <div className="grid grid-cols-2 gap-2.5">
          {items.map((item, i) => {
            const Icon = resolveIcon(item.icon);
            return (
              <EditableItem key={i} className="flex items-start gap-2.5 rounded-lg border border-neutral-200 p-3">
                <ItemControls index={i} total={items.length} onMove={moveItem} onRemove={removeItem} />
                {item.image !== undefined ? (
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded">
                    {Img(['items', i, 'image'], item.image, 'w-full h-full object-cover')}
                  </div>
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-emerald-50">
                    <Icon className="h-4 w-4 text-emerald-600" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  {T(['items', i, item.title !== undefined ? 'title' : item.name !== undefined ? 'name' : 'label'], item.title ?? item.name ?? item.label, 'block text-[11px] font-bold text-[#08120B]')}
                  {T(['items', i, item.text !== undefined ? 'text' : item.desc !== undefined ? 'desc' : 'caption'], item.text ?? item.desc ?? item.caption, 'block text-[9px] leading-snug text-neutral-500', { multiline: true })}
                </div>
              </EditableItem>
            );
          })}
        </div>
        <AddItemButton label="Add item" onClick={addItem} className="w-full" />
      </div>
    );
  }

  // ── Plain text block ──────────────────────────────────────────────────────
  return (
    <div className="space-y-2 rounded-2xl border border-neutral-200 p-5">
      {Object.entries(p).map(([k, v]) =>
        typeof v === 'string' ? (
          <div key={k}>
            <p className="mb-0.5 text-[9px] font-bold tracking-wider text-neutral-400 uppercase">{k}</p>
            {T([k], v, 'block text-sm text-[#08120B]', { multiline: v.length > 60 })}
          </div>
        ) : null
      )}
    </div>
  );
};
