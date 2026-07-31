import React, { useRef, useEffect, useState } from 'react';
import { ImagePlus, Plus, Trash2, ChevronUp, ChevronDown, Pencil } from 'lucide-react';

/**
 * INLINE EDITING PRIMITIVES
 *
 * These render content styled exactly as the website renders it, but editable
 * in place — click the headline in the banner and type. No separate form.
 *
 * EditableText uses contentEditable rather than swapping in an <input>, because
 * an input can't inherit the surrounding typography (gradient text, tracking,
 * line clamps) and the text would visibly jump on click. The trade-off is that
 * React must not re-render the node while it's focused, or the caret jumps to
 * the start on every keystroke — hence the `isFocused` guard and committing on
 * blur rather than on change.
 */

interface EditableTextProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
  as?: 'span' | 'p' | 'div';
}

export const EditableText: React.FC<EditableTextProps> = ({
  value,
  onChange,
  className = '',
  placeholder = 'Click to edit',
  multiline = false,
  as = 'span'
}) => {
  const ref = useRef<HTMLElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Only sync the DOM from props while unfocused. Doing it during typing would
  // reset the caret position on every keystroke.
  useEffect(() => {
    if (!isFocused && ref.current && ref.current.textContent !== value) {
      ref.current.textContent = value;
    }
  }, [value, isFocused]);

  const Tag = as as React.ElementType;

  return (
    <Tag
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      data-placeholder={placeholder}
      onFocus={() => setIsFocused(true)}
      onBlur={(e: React.FocusEvent<HTMLElement>) => {
        setIsFocused(false);
        const next = e.currentTarget.textContent ?? '';
        if (next !== value) onChange(next);
      }}
      onKeyDown={(e: React.KeyboardEvent) => {
        // Enter commits on single-line fields instead of inserting a newline.
        if (!multiline && e.key === 'Enter') {
          e.preventDefault();
          (e.target as HTMLElement).blur();
        }
        if (e.key === 'Escape') {
          if (ref.current) ref.current.textContent = value;
          (e.target as HTMLElement).blur();
        }
      }}
      className={`${className} editable-text cursor-text rounded-sm outline-none transition
        hover:bg-[#0F7B3A]/10 hover:ring-1 hover:ring-[#0F7B3A]/30
        focus:bg-white/95 focus:text-[#08120B] focus:ring-2 focus:ring-[#0F7B3A]
        empty:before:text-current empty:before:opacity-40 empty:before:content-[attr(data-placeholder)]`}
    />
  );
};

/**
 * Wraps an editable text node with a pencil badge that appears on hover, so
 * it's obvious which parts of a section can be clicked. Without it the only
 * affordance was a faint hover tint, which people miss entirely.
 */
export const WithEditIcon: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = ''
}) => (
  <span className={`group/edit relative inline-block ${className}`}>
    {children}
    <span className="pointer-events-none absolute -top-1.5 -right-1.5 z-30 flex h-4 w-4 items-center justify-center rounded-full bg-[#0F7B3A] opacity-0 shadow transition group-hover/edit:opacity-100">
      <Pencil className="h-2.5 w-2.5 text-white" />
    </span>
  </span>
);

/**
 * Image with a hover overlay that opens the media library.
 * `onPick` receives a callback the picker calls with the chosen URL.
 */
export const EditableImage: React.FC<{
  src: string;
  alt?: string;
  className?: string;
  onPick: (apply: (url: string) => void) => void;
  onChange: (url: string) => void;
}> = ({ src, alt = '', className = '', onPick, onChange }) => (
  <div className="group/img relative h-full w-full">
    {src ? (
      <img src={src} alt={alt} className={className} />
    ) : (
      <div className={`${className} flex items-center justify-center bg-neutral-200`}>
        <ImagePlus className="h-5 w-5 text-neutral-400" />
      </div>
    )}
    <button
      onClick={() => onPick(onChange)}
      className="absolute inset-0 z-20 flex items-center justify-center bg-black/0 opacity-0 transition group-hover/img:bg-black/50 group-hover/img:opacity-100"
    >
      <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-[#08120B] shadow">
        <ImagePlus className="h-3.5 w-3.5" />
        Change image
      </span>
    </button>
  </div>
);

/**
 * Hover toolbar for one entry in a repeatable list — reorder and delete,
 * shown floating over the item rather than in a separate panel.
 */
export const ItemControls: React.FC<{
  index: number;
  total: number;
  onMove: (from: number, to: number) => void;
  onRemove: (index: number) => void;
  dark?: boolean;
}> = ({ index, total, onMove, onRemove, dark }) => (
  <div
    className={`absolute top-1.5 right-1.5 z-30 flex items-center gap-0.5 rounded-full p-0.5 opacity-0 shadow-lg transition group-hover/item:opacity-100 ${
      dark ? 'bg-black/80' : 'bg-white'
    }`}
  >
    <button
      onClick={() => index > 0 && onMove(index, index - 1)}
      disabled={index === 0}
      title="Move up"
      className={`rounded-full p-1 disabled:opacity-25 ${dark ? 'text-white hover:bg-white/20' : 'text-neutral-600 hover:bg-neutral-100'}`}
    >
      <ChevronUp className="h-3 w-3" />
    </button>
    <button
      onClick={() => index < total - 1 && onMove(index, index + 1)}
      disabled={index === total - 1}
      title="Move down"
      className={`rounded-full p-1 disabled:opacity-25 ${dark ? 'text-white hover:bg-white/20' : 'text-neutral-600 hover:bg-neutral-100'}`}
    >
      <ChevronDown className="h-3 w-3" />
    </button>
    <button
      onClick={() => onRemove(index)}
      title="Remove"
      className="rounded-full p-1 text-red-500 hover:bg-red-50"
    >
      <Trash2 className="h-3 w-3" />
    </button>
  </div>
);

/** Dashed "add another" tile matching the size of the items it appends to. */
export const AddItemButton: React.FC<{ label: string; onClick: () => void; className?: string }> = ({
  label,
  onClick,
  className = ''
}) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-neutral-300 py-3 text-xs font-semibold text-neutral-500 transition hover:border-[#0F7B3A] hover:bg-emerald-50 hover:text-[#0F7B3A] ${className}`}
  >
    <Plus className="h-3.5 w-3.5" />
    {label}
  </button>
);

/** Wrapper marking a hoverable, reorderable item. */
export const EditableItem: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`group/item relative ${className}`}>{children}</div>
);
