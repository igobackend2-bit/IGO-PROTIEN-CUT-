import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Upload, Trash2, Copy, Check, AlertTriangle, ImageIcon, RefreshCw } from 'lucide-react';
import {
  listMedia,
  uploadMedia,
  deleteMedia,
  formatBytes,
  readImageDimensions,
  MediaItem,
  SIZE_WARNING_BYTES
} from '../../lib/api/media';

/**
 * MEDIA LIBRARY — upload and manage the images used across the site.
 *
 * Backed by the `igo-website-media` Storage bucket, which is website-owned and
 * deliberately separate from the app's `product-images` bucket. Product photos
 * are managed in the Flutter admin; marketing images live here.
 *
 * Doubles as a picker: `onPick` turns it into a modal that other content forms
 * open to choose an image, which is why 11 of the 25 content areas depend on
 * this being built first.
 */

interface MediaLibraryProps {
  /** When provided, each tile becomes selectable and returns its public URL. */
  onPick?: (url: string) => void;
  notify: (msg: string, kind?: 'ok' | 'err') => void;
}

export const MediaLibrary: React.FC<MediaLibraryProps> = ({ onPick, notify }) => {
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const res = await listMedia();
    if (!res.ok) {
      notify(res.error ?? 'Could not load media.', 'err');
      setItems([]);
      return;
    }
    setItems(res.data ?? []);
  }, [notify]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    let succeeded = 0;

    for (const file of Array.from(files)) {
      // Warn rather than block — a big image is a performance problem, not a
      // correctness one, and the admin may have a good reason.
      if (file.size > SIZE_WARNING_BYTES) {
        const dims = await readImageDimensions(file);
        const dimText = dims ? ` (${dims.width}×${dims.height}px)` : '';
        notify(
          `${file.name} is ${formatBytes(file.size)}${dimText} — consider compressing it.`,
          'err'
        );
      }

      const res = await uploadMedia(file);
      if (res.ok) succeeded += 1;
      else notify(`${file.name}: ${res.error}`, 'err');
    }

    setUploading(false);
    if (succeeded > 0) {
      notify(`Uploaded ${succeeded} image${succeeded === 1 ? '' : 's'}.`);
      void load();
    }
  };

  const copyUrl = async (item: MediaItem) => {
    try {
      await navigator.clipboard.writeText(item.url);
      setCopiedPath(item.path);
      setTimeout(() => setCopiedPath(null), 1500);
    } catch {
      notify('Could not copy — select the URL manually.', 'err');
    }
  };

  return (
    <div className="space-y-5">
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-10 text-center transition ${
          dragOver
            ? 'border-[#0F7B3A] bg-emerald-50'
            : 'border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50'
        }`}
      >
        <Upload className={`h-8 w-8 ${dragOver ? 'text-[#0F7B3A]' : 'text-neutral-400'}`} />
        <p className="font-semibold text-neutral-700">
          {uploading ? 'Uploading…' : 'Drop images here, or click to browse'}
        </p>
        <p className="text-xs text-neutral-500">
          PNG, JPG or WebP. Under {formatBytes(SIZE_WARNING_BYTES)} keeps the site fast.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            void handleFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-600">
          {items === null ? 'Loading…' : `${items.length} image${items.length === 1 ? '' : 's'}`}
          {onPick && <span className="ml-2 text-[#0F7B3A]">— click one to use it</span>}
        </p>
        <button
          onClick={() => void load()}
          className="flex items-center gap-1.5 rounded-full border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {items !== null && items.length === 0 && (
        <div className="rounded-xl border border-neutral-200 py-12 text-center">
          <ImageIcon className="mx-auto mb-2 h-8 w-8 text-neutral-300" />
          <p className="text-sm text-neutral-500">
            No images yet. Upload one above to get started.
          </p>
        </div>
      )}

      {items !== null && items.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.path}
              className={`group overflow-hidden rounded-xl border border-neutral-200 ${
                onPick ? 'cursor-pointer hover:border-[#0F7B3A]' : ''
              }`}
              onClick={onPick ? () => onPick(item.url) : undefined}
            >
              <div className="relative aspect-4/3 bg-neutral-100">
                <img
                  src={item.url}
                  alt={item.name}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                {item.sizeBytes > SIZE_WARNING_BYTES && (
                  <span
                    title="Large file — may slow the page"
                    className="absolute top-2 right-2 rounded-full bg-amber-500 p-1"
                  >
                    <AlertTriangle className="h-3 w-3 text-white" />
                  </span>
                )}
              </div>

              <div className="space-y-2 p-2.5">
                <p className="truncate text-xs font-semibold text-neutral-700" title={item.name}>
                  {item.name}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-neutral-500">
                    {formatBytes(item.sizeBytes)}
                  </span>
                  {!onPick && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          void copyUrl(item);
                        }}
                        title="Copy URL"
                        className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                      >
                        {copiedPath === item.path ? (
                          <Check className="h-3.5 w-3.5 text-[#0F7B3A]" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          const res = await deleteMedia(item.path);
                          if (!res.ok) notify(res.error ?? 'Delete failed.', 'err');
                          else {
                            notify('Image deleted.');
                            void load();
                          }
                        }}
                        title="Delete"
                        className="rounded p-1 text-neutral-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="rounded-lg bg-neutral-50 p-3 text-xs text-neutral-500">
        Deleting an image here does <strong>not</strong> remove it from wherever it's used —
        that spot will fall back to the IGO brand mark. Check the Homepage and Sections tabs
        before deleting.
      </p>
    </div>
  );
};
