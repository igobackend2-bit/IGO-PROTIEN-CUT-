import React, { useState, useEffect, useCallback } from 'react';
import {
  Save,
  Plus,
  Trash2,
  Image as ImageIcon,
  X,
  Eye,
  EyeOff,
  RotateCcw,
  ChevronRight,
  GripVertical,
  Monitor,
  AlertTriangle
} from 'lucide-react';
import { listSiteContent, upsertSiteContent, SiteContentRow } from '../../lib/api/websiteAdmin';
import { refreshSiteContent } from '../../lib/hooks/useSiteContent';
import { MediaLibrary } from './MediaLibrary';
import { EditableCanvas } from './EditableCanvas';
import { isBlockConnected } from '../../lib/contentRegistry';

/**
 * CONTENT EDITOR — split view: block list, form, live preview.
 *
 * The form controls are still derived from the jsonb payload (adding a field in
 * SQL makes it editable here with no UI change), but the presentation is now
 * organised rather than a flat dump:
 *
 *   • left rail lists the blocks in the order they appear on the page
 *   • middle column is the form, with repeatable items as numbered cards
 *   • right column renders the ACTUAL section component with your unsaved
 *     draft, so you see the real thing before saving
 *
 * Field types are inferred:
 *   name matches image|src|photo|qr|logo|banner  → image picker
 *   name matches description|copy|body|text|…    → textarea
 *   array of objects                             → repeatable card list
 *   nested object                                → grouped sub-form
 */

interface ContentEditorProps {
  keyPrefix: string;
  title: string;
  description: string;
  notify: (msg: string, kind?: 'ok' | 'err') => void;
}

type Payload = Record<string, unknown>;

const IMAGE_FIELD = /image|src|photo|qr|logo|banner/i;
const LONG_TEXT_FIELD = /description|copy|body|text|subheading|tagline|caption|excerpt|sub$/i;
/** Fields that are structural rather than editorial — shown but de-emphasised. */
const TECHNICAL_FIELD = /^(id|icon|fit|theme|path|url)$/i;

function humanize(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

/**
 * Sidebar name for a block. Prefers `admin_label`, which 0014 sets to the
 * heading you actually see on the live page ("Why Choose IGO Protein Cuts?"),
 * falling back to a humanised key for anything seeded later.
 */
function blockLabel(b: { key: string; admin_label?: string | null }): string {
  return b.admin_label?.trim() || humanize(b.key.split('.').slice(1).join(' '));
}

/** Best-effort title for one entry in a repeatable list. */
function itemLabel(item: unknown, index: number): string {
  if (item && typeof item === 'object') {
    const o = item as Record<string, string>;
    const candidate = o.title || o.name || o.label || o.heading || o.feature || o.caption;
    if (candidate) return candidate;
  }
  return `Item ${index + 1}`;
}

export const ContentEditor: React.FC<ContentEditorProps> = ({
  keyPrefix,
  title,
  description,
  notify
}) => {
  const [blocks, setBlocks] = useState<SiteContentRow[] | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Payload>>({});
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [pickerFor, setPickerFor] = useState<((url: string) => void) | null>(null);

  const load = useCallback(async () => {
    const res = await listSiteContent();
    if (!res.ok) {
      notify(res.error ?? 'Could not load content.', 'err');
      setBlocks([]);
      return;
    }
    const filtered = (res.data ?? []).filter((b) => b.key.startsWith(keyPrefix));
    setBlocks(filtered);
    setDrafts(Object.fromEntries(filtered.map((b) => [b.key, b.payload])));
    setSelectedKey((current) =>
      current && filtered.some((b) => b.key === current) ? current : (filtered[0]?.key ?? null)
    );
  }, [keyPrefix, notify]);

  useEffect(() => {
    void load();
  }, [load]);

  const selected = blocks?.find((b) => b.key === selectedKey) ?? null;
  const draft = selectedKey ? (drafts[selectedKey] ?? selected?.payload ?? {}) : {};
  const isDirty =
    selected != null && JSON.stringify(draft) !== JSON.stringify(selected.payload);

  const updateDraft = (path: (string | number)[], value: unknown) => {
    if (!selectedKey) return;
    setDrafts((prev) => {
      const next = structuredClone(prev[selectedKey] ?? {}) as Payload;
      let target: Record<string | number, unknown> = next as Record<string | number, unknown>;
      for (let i = 0; i < path.length - 1; i += 1) {
        target = target[path[i]] as Record<string | number, unknown>;
      }
      target[path[path.length - 1]] = value;
      return { ...prev, [selectedKey]: next };
    });
  };

  const save = async () => {
    if (!selected || !selectedKey) return;
    setSaving(true);
    const res = await upsertSiteContent({
      id: selected.id,
      key: selected.key,
      content_type: selected.content_type,
      payload: draft,
      is_active: selected.is_active,
      display_order: selected.display_order
    });
    setSaving(false);

    if (!res.ok) {
      notify(res.error ?? 'Could not save.', 'err');
      return;
    }
    await refreshSiteContent();
    notify('Saved — refresh the site to see it live.');
    void load();
  };

  const toggleVisible = async () => {
    if (!selected) return;
    const res = await upsertSiteContent({
      id: selected.id,
      key: selected.key,
      content_type: selected.content_type,
      payload: selected.payload,
      is_active: !selected.is_active,
      display_order: selected.display_order
    });
    if (!res.ok) {
      notify(res.error ?? 'Could not update.', 'err');
      return;
    }
    await refreshSiteContent();
    notify(selected.is_active ? 'Section hidden from the site.' : 'Section is now live.');
    void load();
  };

  // ── Field rendering ───────────────────────────────────────────────────────

  const renderField = (
    path: (string | number)[],
    fieldName: string,
    value: unknown
  ): React.ReactNode => {
    const key = path.join('.');

    if (typeof value === 'string') {
      const isImage = IMAGE_FIELD.test(fieldName);
      const isLong = LONG_TEXT_FIELD.test(fieldName) || value.length > 90;
      const isTechnical = TECHNICAL_FIELD.test(fieldName);

      if (isImage) {
        return (
          <Field key={key} label={humanize(fieldName)} wide>
            <div className="flex items-center gap-2">
              <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
                {value ? (
                  <img src={value} alt="" className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon className="m-auto mt-3 h-4 w-4 text-neutral-300" />
                )}
              </div>
              <input
                value={value}
                onChange={(e) => updateDraft(path, e.target.value)}
                placeholder="/Images/… or full URL"
                className="min-w-0 flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-[#0F7B3A] focus:ring-1 focus:ring-[#0F7B3A] focus:outline-none"
              />
              <button
                onClick={() => setPickerFor(() => (url: string) => updateDraft(path, url))}
                className="shrink-0 rounded-lg bg-[#0F7B3A] px-3 py-2.5 text-xs font-semibold text-white hover:bg-[#0c6630]"
              >
                Browse
              </button>
            </div>
          </Field>
        );
      }

      return (
        <Field key={key} label={humanize(fieldName)} wide={isLong} muted={isTechnical}>
          {isLong ? (
            <textarea
              value={value}
              rows={3}
              onChange={(e) => updateDraft(path, e.target.value)}
              className="w-full resize-y rounded-lg border border-neutral-300 px-3 py-2 text-sm leading-relaxed focus:border-[#0F7B3A] focus:ring-1 focus:ring-[#0F7B3A] focus:outline-none"
            />
          ) : (
            <input
              value={value}
              onChange={(e) => updateDraft(path, e.target.value)}
              className={`w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-[#0F7B3A] focus:ring-1 focus:ring-[#0F7B3A] focus:outline-none ${
                isTechnical ? 'font-mono text-xs text-neutral-500' : ''
              }`}
            />
          )}
        </Field>
      );
    }

    if (typeof value === 'number') {
      return (
        <Field key={key} label={humanize(fieldName)}>
          <input
            type="number"
            value={value}
            onChange={(e) => updateDraft(path, Number(e.target.value))}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-[#0F7B3A] focus:ring-1 focus:ring-[#0F7B3A] focus:outline-none"
          />
        </Field>
      );
    }

    if (typeof value === 'boolean') {
      return (
        <Field key={key} label={humanize(fieldName)}>
          <button
            onClick={() => updateDraft(path, !value)}
            className={`rounded-full px-3 py-1.5 text-xs font-bold ${
              value ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-500'
            }`}
          >
            {value ? 'Yes' : 'No'}
          </button>
        </Field>
      );
    }

    if (Array.isArray(value)) {
      const isStringList = value.length > 0 && typeof value[0] === 'string';

      return (
        <div key={key} className="col-span-2 space-y-2.5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold tracking-wide text-neutral-700 uppercase">
              {humanize(fieldName)}
              <span className="ml-1.5 font-normal text-neutral-400">({value.length})</span>
            </p>
            <button
              onClick={() => {
                const template = value[0];
                const blank =
                  template && typeof template === 'object'
                    ? Object.fromEntries(Object.keys(template).map((k) => [k, '']))
                    : '';
                updateDraft(path, [...value, blank]);
              }}
              className="flex items-center gap-1 rounded-full bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-neutral-700"
            >
              <Plus className="h-3 w-3" />
              Add
            </button>
          </div>

          {isStringList ? (
            <div className="space-y-1.5">
              {value.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="w-5 shrink-0 text-right text-[10px] font-bold text-neutral-400">
                    {index + 1}
                  </span>
                  <input
                    value={String(item)}
                    onChange={(e) => {
                      const copy = [...value];
                      copy[index] = e.target.value;
                      updateDraft(path, copy);
                    }}
                    className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-[#0F7B3A] focus:outline-none"
                  />
                  <button
                    onClick={() => updateDraft(path, value.filter((_, i) => i !== index))}
                    className="rounded p-1.5 text-neutral-300 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2.5">
              {value.map((item, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-xl border border-neutral-200 bg-white"
                >
                  <div className="flex items-center justify-between border-b border-neutral-100 bg-neutral-50 px-3 py-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <GripVertical className="h-3.5 w-3.5 shrink-0 text-neutral-300" />
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-[10px] font-bold text-white">
                        {index + 1}
                      </span>
                      <span className="truncate text-xs font-bold text-neutral-700">
                        {itemLabel(item, index)}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-0.5">
                      <button
                        onClick={() => {
                          if (index === 0) return;
                          const copy = [...value];
                          [copy[index - 1], copy[index]] = [copy[index], copy[index - 1]];
                          updateDraft(path, copy);
                        }}
                        disabled={index === 0}
                        title="Move up"
                        className="rounded p-1 text-neutral-400 hover:bg-neutral-200 disabled:opacity-25"
                      >
                        <ChevronRight className="h-3.5 w-3.5 -rotate-90" />
                      </button>
                      <button
                        onClick={() => {
                          if (index === value.length - 1) return;
                          const copy = [...value];
                          [copy[index], copy[index + 1]] = [copy[index + 1], copy[index]];
                          updateDraft(path, copy);
                        }}
                        disabled={index === value.length - 1}
                        title="Move down"
                        className="rounded p-1 text-neutral-400 hover:bg-neutral-200 disabled:opacity-25"
                      >
                        <ChevronRight className="h-3.5 w-3.5 rotate-90" />
                      </button>
                      <button
                        onClick={() => updateDraft(path, value.filter((_, i) => i !== index))}
                        title="Remove"
                        className="rounded p-1 text-neutral-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-3">
                    {typeof item === 'object' && item !== null
                      ? Object.entries(item as Payload).map(([k, v]) =>
                          renderField([...path, index, k], k, v)
                        )
                      : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (typeof value === 'object' && value !== null) {
      return (
        <div key={key} className="col-span-2 rounded-xl border border-neutral-200 p-3">
          <p className="mb-2.5 text-xs font-bold tracking-wide text-neutral-700 uppercase">
            {humanize(fieldName)}
          </p>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(value as Payload).map(([k, v]) => renderField([...path, k], k, v))}
          </div>
        </div>
      );
    }

    return null;
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (blocks === null) {
    return <p className="py-16 text-center text-sm text-neutral-500">Loading content…</p>;
  }

  if (blocks.length === 0) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
        <p className="font-bold">No content blocks found.</p>
        <p className="mt-1.5 leading-relaxed">
          Run <code className="rounded bg-amber-100 px-1.5 py-0.5">0010_content_foundation.sql</code>,{' '}
          <code className="rounded bg-amber-100 px-1.5 py-0.5">0011_content_sections.sql</code> and{' '}
          <code className="rounded bg-amber-100 px-1.5 py-0.5">0012_pages_and_seo.sql</code> in the
          Supabase SQL editor, then reload.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-black text-[#08120B]">{title}</h2>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-neutral-600">{description}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[210px_1fr]">
        {/* Left rail */}
        <nav className="space-y-1 lg:sticky lg:top-4 lg:self-start lg:max-h-[80vh] lg:overflow-y-auto">
          <p className="px-3 pb-1 text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
            In page order
          </p>
          {blocks.map((b, i) => {
            const active = b.key === selectedKey;
            const dirty = JSON.stringify(drafts[b.key]) !== JSON.stringify(b.payload);
            return (
              <button
                key={b.key}
                onClick={() => setSelectedKey(b.key)}
                className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] transition ${
                  active
                    ? 'bg-[#0F7B3A] font-bold text-white'
                    : 'font-semibold text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold ${
                    active ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-500'
                  }`}
                >
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1 truncate">{blockLabel(b)}</span>
                {dirty && (
                  <span
                    title="Unsaved changes"
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${active ? 'bg-white' : 'bg-amber-500'}`}
                  />
                )}
                {!isBlockConnected(b.key) && (
                  <span
                    title="Saved, but the site doesn't read this block yet"
                    className={`shrink-0 rounded px-1 py-px text-[8px] font-bold ${
                      active ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    SOON
                  </span>
                )}
                {!b.is_active && (
                  <EyeOff className={`h-3 w-3 shrink-0 ${active ? 'text-white/70' : 'text-neutral-400'}`} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Editor + preview */}
        {selected && (
          <div className="min-w-0 space-y-4">
            <div className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
              <div className="min-w-0">
                <p className="font-bold text-[#08120B]">{blockLabel(selected)}</p>
                <p className="font-mono text-[11px] text-neutral-500">{selected.key}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowPreview((s) => !s)}
                  className="flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                >
                  <Monitor className="h-3.5 w-3.5" />
                  {showPreview ? 'Hide all fields' : 'All fields'}
                </button>
                <button
                  onClick={() => void toggleVisible()}
                  className="flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                >
                  {selected.is_active ? (
                    <>
                      <Eye className="h-3.5 w-3.5" /> Live
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-3.5 w-3.5" /> Hidden
                    </>
                  )}
                </button>
                <button
                  onClick={() =>
                    setDrafts((p) => ({ ...p, [selected.key]: selected.payload }))
                  }
                  disabled={!isDirty}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-200 disabled:opacity-40"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </button>
                <button
                  onClick={() => void save()}
                  disabled={saving || !isDirty}
                  className="flex items-center gap-1.5 rounded-full bg-[#0F7B3A] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#0c6630] disabled:opacity-40"
                >
                  <Save className="h-3.5 w-3.5" />
                  {saving ? 'Saving…' : isDirty ? 'Save changes' : 'Saved'}
                </button>
              </div>
            </div>

            {!isBlockConnected(selected.key) && (
              <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3.5">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <p className="text-xs leading-relaxed text-amber-900">
                  <strong>Not connected yet.</strong> This block saves correctly, but the page
                  still renders hardcoded values, so your changes won't appear on the live site
                  until it's wired up.
                </p>
              </div>
            )}

            {/* Edit directly on the section — click any text, hover any image. */}
            <div className="overflow-hidden rounded-xl border border-neutral-200">
              <div className="flex items-center gap-2 border-b border-neutral-100 bg-neutral-50 px-3 py-2">
                <span className="flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-red-400" />
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <span className="text-[11px] font-semibold text-neutral-500">
                  Click any text to edit · hover an image to change it
                </span>
              </div>
              <div className="bg-white p-4">
                <EditableCanvas
                  blockKey={selected.key}
                  payload={draft}
                  onChange={updateDraft}
                  onPickImage={(apply) => setPickerFor(() => apply)}
                  notify={notify}
                />
              </div>
            </div>

            {/* Everything the canvas doesn't surface — ids, icon names, link
                paths, timings. Collapsed by default so the canvas stays the
                primary surface. */}
            <details className="rounded-xl border border-neutral-200" open={showPreview}>
              <summary
                onClick={(e) => {
                  e.preventDefault();
                  setShowPreview((s) => !s);
                }}
                className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-neutral-600 hover:bg-neutral-50"
              >
                {showPreview ? '\u2013' : '+'} All fields (links, icons, timings)
              </summary>
              {showPreview && (
                <div className="grid grid-cols-2 gap-3 border-t border-neutral-100 p-4">
                  {Object.entries(draft).map(([k, v]) => renderField([k], k, v))}
                </div>
              )}
            </details>
          </div>
        )}
      </div>

      {pickerFor && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4">
          <div className="mt-8 w-full max-w-4xl rounded-2xl bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold text-[#08120B]">Choose an image</h3>
              <button
                onClick={() => setPickerFor(null)}
                className="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <MediaLibrary
              notify={notify}
              onPick={(url) => {
                pickerFor(url);
                setPickerFor(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// ── Field wrapper ───────────────────────────────────────────────────────────

const Field: React.FC<{
  label: string;
  children: React.ReactNode;
  wide?: boolean;
  muted?: boolean;
}> = ({ label, children, wide, muted }) => (
  <div className={`space-y-1 ${wide ? 'col-span-2' : ''}`}>
    <label
      className={`text-[10px] font-bold tracking-wider uppercase ${
        muted ? 'text-neutral-400' : 'text-neutral-500'
      }`}
    >
      {label}
    </label>
    {children}
  </div>
);
