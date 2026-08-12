import { supabase, isSupabaseConfigured } from '../supabase';

/**
 * MEDIA LIBRARY — images uploaded from /admin.
 *
 * Stored in the `igo-website-media` bucket, which is website-owned and separate
 * from the app's `product-images` bucket. Product photos belong to the catalog
 * and are managed in the Flutter admin; marketing images belong here. Keeping
 * them apart means neither surface can accidentally break the other.
 *
 * Public read, admin-only write — enforced by RLS in 0010, using the same
 * `igo_is_active_admin()` check as the rest of the website admin.
 */

const BUCKET = 'igo-website-media';

/** Above this, a large hero image measurably slows first paint on mobile. */
export const SIZE_WARNING_BYTES = 500 * 1024;

export interface MediaItem {
  name: string;
  path: string;
  url: string;
  sizeBytes: number;
  createdAt: string | null;
}

export interface MediaResult<T = void> {
  ok: boolean;
  data?: T;
  error?: string;
}

function notConfigured<T>(): MediaResult<T> {
  return { ok: false, error: 'Backend not configured.' };
}

/**
 * Makes a filename safe for a URL path while keeping it recognisable.
 * Prefixed with a timestamp so re-uploading the same filename doesn't silently
 * overwrite an image that's already live somewhere on the site.
 */
function toStorageName(filename: string): string {
  const cleaned = filename
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return `${Date.now()}-${cleaned}`;
}

export async function listMedia(folder = ''): Promise<MediaResult<MediaItem[]>> {
  if (!isSupabaseConfigured || !supabase) return notConfigured();

  const { data, error } = await supabase.storage.from(BUCKET).list(folder, {
    limit: 500,
    sortBy: { column: 'created_at', order: 'desc' }
  });

  if (error) return { ok: false, error: error.message };

  const items: MediaItem[] = (data ?? [])
    // `list` returns folder placeholders too; those have no metadata.
    .filter((entry) => entry.id !== null)
    .map((entry) => {
      const path = folder ? `${folder}/${entry.name}` : entry.name;
      return {
        name: entry.name,
        path,
        url: supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl,
        sizeBytes: (entry.metadata as { size?: number } | null)?.size ?? 0,
        createdAt: entry.created_at ?? null
      };
    });

  return { ok: true, data: items };
}

export async function uploadMedia(file: File, folder = ''): Promise<MediaResult<MediaItem>> {
  if (!isSupabaseConfigured || !supabase) return notConfigured();

  if (!file.type.startsWith('image/')) {
    return { ok: false, error: 'Only image files can be uploaded here.' };
  }

  const name = toStorageName(file.name);
  const path = folder ? `${folder}/${name}` : name;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '604800',
    upsert: false,
    contentType: file.type
  });

  if (error) {
    // The most common cause is not being signed in as an active admin, which
    // the raw RLS message doesn't make obvious.
    const message = /row-level security|not authorized|permission/i.test(error.message)
      ? 'Upload denied. Sign in with an admin account and try again.'
      : error.message;
    return { ok: false, error: message };
  }

  return {
    ok: true,
    data: {
      name,
      path,
      url: supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl,
      sizeBytes: file.size,
      createdAt: new Date().toISOString()
    }
  };
}

export async function deleteMedia(path: string): Promise<MediaResult> {
  if (!isSupabaseConfigured || !supabase) return notConfigured();
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Human-readable file size for the media grid. */
export function formatBytes(bytes: number): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Reads an image's pixel dimensions before upload, so the media library can
 * warn about a 4000px hero that only ever renders at 1200.
 */
export function readImageDimensions(file: File): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}
