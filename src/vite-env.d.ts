/// <reference types="vite/client" />

/**
 * Typed environment variables for the Vite client bundle.
 *
 * Only VITE_-prefixed variables are exposed to the browser. Note the absence
 * of SUPABASE_SERVICE_ROLE_KEY here — that is deliberate and must stay that
 * way. It bypasses RLS entirely and is read only in `server.ts` from
 * `process.env`, never in `src/`.
 */
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  /** 'supabase' (default) reads the live admin-owned catalog; 'local' uses mockData.ts. */
  readonly VITE_CATALOG_SOURCE?: string;
  readonly VITE_RAZORPAY_KEY_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
