import { useEffect, useState, useContext, createContext } from 'react';
import { supabase, isSupabaseConfigured } from '../supabase';

/**
 * PREVIEW OVERRIDE
 *
 * Lets the admin render a real section component with unsaved draft values.
 * When a block key is present in this context, `useSiteContent` returns the
 * draft instead of the saved/cached copy.
 *
 * This is why the live preview needs no changes to any section component —
 * they call `useSiteContent` exactly as they do on the real site, and simply
 * receive different data inside the provider.
 */
export const ContentPreviewContext = createContext<Record<string, unknown> | null>(null);

/**
 * Reads an editable content block from `igo_site_content`.
 *
 * THE CONTRACT: every call site passes the hardcoded value it renders today as
 * `fallback`. If the row is missing, unpublished, malformed, or Supabase is
 * unreachable, the section renders exactly what it renders now. A content block
 * can never blank out a section of the site — the worst case is that an edit
 * doesn't appear.
 *
 * Blocks are cached in module scope and in localStorage, so the first paint is
 * synchronous from cache and the network refresh happens behind it. This is the
 * same stale-while-revalidate approach the catalog uses.
 *
 *   const hero = useSiteContent('home.hero', HERO_FALLBACK);
 */

const CACHE_KEY = 'protein_cuts_site_content_v1';

type ContentPayload = Record<string, unknown>;

/** In-memory cache, shared across every hook instance in the session. */
let memoryCache: Record<string, ContentPayload> | null = null;
let inflight: Promise<Record<string, ContentPayload>> | null = null;

function readLocalCache(): Record<string, ContentPayload> {
  if (memoryCache) return memoryCache;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        memoryCache = parsed;
        return parsed;
      }
    }
  } catch {
    // Corrupt cache — treated as empty.
  }
  memoryCache = {};
  return memoryCache;
}

/**
 * Fetches every active block in one query. One round trip for the whole page
 * beats one per section, and content is small enough that fetching all of it is
 * cheaper than being selective.
 */
async function fetchAllBlocks(): Promise<Record<string, ContentPayload>> {
  if (!isSupabaseConfigured || !supabase) return {};

  const { data, error } = await supabase
    .from('igo_site_content')
    .select('key, payload')
    .eq('is_active', true);

  if (error) {
    console.warn('[content] could not load site content:', error.message);
    return {};
  }

  const map: Record<string, ContentPayload> = {};
  for (const row of (data ?? []) as unknown as { key: string; payload: ContentPayload }[]) {
    if (row.key && row.payload && typeof row.payload === 'object') {
      map[row.key] = row.payload;
    }
  }

  memoryCache = map;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(map));
  } catch {
    // Quota exceeded — memory cache still serves this session.
  }
  window.dispatchEvent(new Event('protein_cuts_content_updated'));
  return map;
}

/** Shared across hook instances so N sections trigger one request, not N. */
function loadOnce(): Promise<Record<string, ContentPayload>> {
  if (!inflight) {
    inflight = fetchAllBlocks().finally(() => {
      inflight = null;
    });
  }
  return inflight;
}

/**
 * @param key      block key, e.g. 'home.hero'
 * @param fallback the value currently hardcoded in the component
 */
export function useSiteContent<T extends ContentPayload>(key: string, fallback: T): T {
  const preview = useContext(ContentPreviewContext);

  const [value, setValue] = useState<T>(() => {
    const cached = readLocalCache()[key];
    return (cached as T) ?? fallback;
  });

  useEffect(() => {
    let cancelled = false;

    loadOnce()
      .then((blocks) => {
        if (cancelled) return;
        const fresh = blocks[key];
        if (fresh) setValue(fresh as T);
      })
      .catch(() => {
        // Keep the fallback — nothing to do.
      });

    // Re-read when the admin saves a block in another tab.
    const onUpdate = () => {
      const cached = readLocalCache()[key];
      if (cached) setValue(cached as T);
    };
    window.addEventListener('protein_cuts_content_updated', onUpdate);

    return () => {
      cancelled = true;
      window.removeEventListener('protein_cuts_content_updated', onUpdate);
    };
  }, [key]);

  // Draft values from the admin preview win over anything saved.
  if (preview && key in preview) {
    return preview[key] as T;
  }

  return value;
}

/**
 * Clears the cache and refetches. Called by the admin after a save so the
 * change shows immediately rather than on the next hard refresh.
 */
export async function refreshSiteContent(): Promise<void> {
  memoryCache = null;
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    // Ignore.
  }
  await fetchAllBlocks();
}

/**
 * Substitutes {{productCount}} style tokens in stat values, so a number that
 * should track the live catalog can stay dynamic while the rest of the label
 * remains editable.
 */
export function renderToken(value: string, tokens: Record<string, string | number>): string {
  return value.replace(/\{\{(\w+)\}\}/g, (match, name) =>
    name in tokens ? String(tokens[name]) : match
  );
}
