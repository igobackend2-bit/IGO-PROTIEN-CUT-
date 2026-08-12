import { Product } from '../types';

/**
 * Client-side AI-search fallback.
 *
 * WHY THIS EXISTS
 * The live site is built to static files and deployed to Hostinger over FTP
 * (see .github/workflows/deploy.yml). Static hosting has no server, so
 * /api/ai-search does not exist in production and every request to it 404s.
 * Without this, the AI Search modal showed "Failed to connect to AI server"
 * on the live site.
 *
 * So: try the server endpoint first (it exists in local dev and on Vercel),
 * and if it isn't there, answer from the real catalog instead. These are
 * genuine products with genuine prices pulled from the live catalog — the
 * ranking is keyword-and-nutrition based, not a language model, and the UI
 * says so rather than passing it off as AI.
 */

interface Recommendation {
  name: string;
  category: string;
  reason: string;
  protein: string;
  quickRecipe: string;
}

/** Parses '31g' / '31 g' / '—' into a number for ranking. Unknown → 0. */
function proteinValue(product: Product): number {
  const raw = product.nutrition?.protein ?? '';
  const match = raw.match(/([\d.]+)/);
  return match ? parseFloat(match[1]) : 0;
}

interface Intent {
  categories: Product['category'][];
  boneless: boolean;
  quick: boolean;
  highProtein: boolean;
  keywords: string[];
}

function readIntent(query: string): Intent {
  const q = query.toLowerCase();
  const categories: Product['category'][] = [];

  if (q.includes('chicken')) categories.push('chicken');
  if (q.includes('mutton') || q.includes('goat') || q.includes('lamb')) categories.push('mutton');
  if (q.includes('beef') || q.includes('steak')) categories.push('beef');
  if (q.includes('fish') || q.includes('seafood') || q.includes('prawn') || q.includes('crab'))
    categories.push('fish');
  if (q.includes('egg')) categories.push('eggs');
  if (q.includes('biryani')) categories.push('biryani');
  if (q.includes('marinated') || q.includes('ready')) categories.push('ready-to-cook');

  return {
    categories,
    boneless: q.includes('boneless') || q.includes('no bone') || q.includes('zero bone'),
    quick:
      q.includes('quick') ||
      q.includes('fast') ||
      q.includes('10-minute') ||
      q.includes('10 minute') ||
      q.includes('15'),
    highProtein:
      q.includes('protein') ||
      q.includes('gym') ||
      q.includes('muscle') ||
      q.includes('fitness') ||
      q.includes('keto') ||
      q.includes('diet'),
    keywords: q.split(/\s+/).filter((w) => w.length > 3)
  };
}

function scoreProduct(product: Product, intent: Intent): number {
  let score = 0;

  if (intent.categories.length > 0 && intent.categories.includes(product.category)) score += 40;
  if (intent.boneless && product.boneType === 'Boneless') score += 25;
  if (intent.quick && product.prepTimeMinutes > 0 && product.prepTimeMinutes <= 20) score += 20;
  if (intent.highProtein) score += Math.min(proteinValue(product), 35);

  const haystack = `${product.name} ${product.subcategory} ${product.description}`.toLowerCase();
  for (const word of intent.keywords) {
    if (haystack.includes(word)) score += 8;
  }

  // Prefer things the customer can actually buy right now.
  if (product.stockStatus === 'Out of Stock') score -= 100;
  if (product.isBestSeller) score += 5;

  return score;
}

function buildReason(product: Product, intent: Intent): string {
  const bits: string[] = [];

  if (intent.highProtein && proteinValue(product) > 0) {
    bits.push(`${product.nutrition.protein} protein per 100g`);
  }
  if (intent.boneless && product.boneType === 'Boneless') bits.push('completely boneless');
  if (intent.quick && product.prepTimeMinutes > 0) {
    bits.push(`ready in about ${product.prepTimeMinutes} minutes`);
  }
  if (product.isBestSeller) bits.push('one of our bestsellers');

  if (bits.length === 0) {
    return product.shortDescription || `A good match from our ${product.category} range.`;
  }
  return `${bits.join(', ')}.`;
}

function buildRecipe(product: Product): string {
  if (product.recipePairing) return product.recipePairing;

  switch (product.category) {
    case 'fish':
      return 'Pan-sear in a hot pan for 4 minutes a side, finish with lemon and cracked pepper.';
    case 'eggs':
      return 'Whisk with pepper and cook low and slow for a soft, creamy scramble.';
    case 'mutton':
    case 'beef':
      return 'Brown the pieces first, then pressure cook 20 minutes with onion, tomato and whole spices.';
    case 'ready-to-cook':
      return 'Already marinated — air-fry at 180°C for 12 minutes, turning once.';
    default:
      return 'Marinate in yogurt, ginger-garlic and turmeric for 30 minutes, then cook through.';
  }
}

/**
 * Ranks the live catalog against the query and returns the top matches.
 * Returns an empty array if nothing scores meaningfully, so the caller can
 * say "no match" rather than showing an irrelevant product.
 */
export function localAiSearch(query: string, catalog: Product[], limit = 3) {
  const intent = readIntent(query);

  const ranked = catalog
    .map((product) => ({ product, score: scoreProduct(product, intent) }))
    .filter((entry) => entry.score > 10)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  const recommendations: Recommendation[] = ranked.map(({ product }) => ({
    name: product.name,
    category: product.category,
    reason: buildReason(product, intent),
    protein: product.nutrition?.protein ?? '—',
    quickRecipe: buildRecipe(product)
  }));

  return { recommendations, source: 'catalog' as const };
}
