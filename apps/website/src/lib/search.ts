import { Product } from '../types';

/**
 * Relevance-ranked product search.
 *
 * Previously every search surface (Navbar's search bar, /search page) used
 * a flat `name.toLowerCase().includes(q)` check — a match ANYWHERE in the
 * string, weighted no differently than any other. Searching "on" (typing
 * toward "onion") therefore surfaced "Watermelon", "Honey", "Almonds" and
 * "Coconut oil" just as confidently as "Onion", because "on" happens to sit
 * inside all of those names too. None of that is wrong data — it's a
 * relevance problem: a customer typing a prefix expects prefix/word matches
 * first, not anything containing the substring anywhere.
 *
 * This scores each product against the query and returns only real matches,
 * best first:
 *   100  name is an exact match
 *    90  name starts with the query
 *    70  a whole word inside the name starts with the query (e.g. "big" in
 *        "Onion big")
 *    50  category/subcategory starts with the query
 *    30  name contains the query anywhere (the old behaviour, now the
 *        lowest-priority tier instead of the only tier)
 *    20  category/subcategory/description contains the query anywhere
 * Ties break by name length (shorter, more specific names first).
 */
export function scoreProductMatch(query: string, product: Product): number {
  const q = query.trim().toLowerCase();
  if (!q) return 0;

  const name = product.name.toLowerCase();
  const category = (product.category ?? '').toLowerCase();
  const subcategory = (product.subcategory ?? '').toLowerCase();
  const description = (product.description ?? '').toLowerCase();

  if (name === q) return 100;
  if (name.startsWith(q)) return 90;
  if (name.split(/\s+/).some((word) => word.startsWith(q))) return 70;
  if (category.startsWith(q) || subcategory.startsWith(q)) return 50;
  if (name.includes(q)) return 30;
  if (category.includes(q) || subcategory.includes(q) || description.includes(q)) return 20;
  return 0;
}

export function rankedProductMatches(query: string, products: Product[], limit = 6): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const scored = products
    .map((product) => ({ product, score: scoreProductMatch(q, product) }))
    .filter((s) => s.score > 0);

  scored.sort((a, b) => b.score - a.score || a.product.name.length - b.product.name.length);
  return scored.slice(0, limit).map((s) => s.product);
}
