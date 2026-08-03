import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, Check, Plus, AlertCircle } from 'lucide-react';
import { listMerchandising, saveMerchandising, MerchRow } from '../../lib/api/websiteAdmin';

/**
 * RAIL PRODUCT PICKER — choose which products appear in a homepage rail.
 *
 * The rails (Top Picks, Today's Fresh Stock, Flash Deals) are driven by flags
 * on igo_product_web_meta, not by a hand-ordered list. That's deliberate: a
 * product removed from the catalog can't leave a dangling reference behind.
 *
 * This surfaces those flags where you'd expect to find them — next to the rail
 * heading you're editing — instead of making you go hunting in a separate tab.
 * The same flags are also editable in Pricing & Badges; both write the same
 * column, so they can't disagree.
 */

type RailFlag = 'is_best_seller' | 'is_today_fresh' | 'is_flash_offer';

interface RailProductPickerProps {
  flag: RailFlag;
  railName: string;
  notify: (msg: string, kind?: 'ok' | 'err') => void;
}

export const RailProductPicker: React.FC<RailProductPickerProps> = ({
  flag,
  railName,
  notify
}) => {
  const [rows, setRows] = useState<MerchRow[] | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await listMerchandising();
    if (!res.ok) {
      notify(res.error ?? 'Could not load products.', 'err');
      setRows([]);
      return;
    }
    setRows(res.data ?? []);
  }, [notify]);

  useEffect(() => {
    void load();
  }, [load]);

  const toggle = async (row: MerchRow, next: boolean) => {
    setBusyId(row.product_id);
    const res = await saveMerchandising({
      product_id: row.product_id,
      original_price: row.original_price,
      is_best_seller: flag === 'is_best_seller' ? next : row.is_best_seller,
      is_today_fresh: flag === 'is_today_fresh' ? next : row.is_today_fresh,
      is_flash_offer: flag === 'is_flash_offer' ? next : row.is_flash_offer
    });
    setBusyId(null);

    if (!res.ok) {
      notify(res.error ?? 'Could not update.', 'err');
      return;
    }
    notify(next ? `Added to ${railName}.` : `Removed from ${railName}.`);
    void load();
  };

  if (rows === null) {
    return <p className="py-6 text-center text-xs text-neutral-400">Loading products…</p>;
  }

  const selected = rows.filter((r) => r[flag]);
  const candidates = rows
    .filter((r) => !r[flag])
    .filter((r) => (search.trim() ? r.product_name.toLowerCase().includes(search.toLowerCase()) : true));

  return (
    <div className="space-y-3 rounded-xl border border-neutral-200 bg-neutral-50/60 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold tracking-wide text-neutral-700 uppercase">
            Products in this rail
          </p>
          <p className="mt-0.5 text-[11px] text-neutral-500">
            {selected.length} product{selected.length === 1 ? '' : 's'} shown on the homepage
          </p>
        </div>
        <button
          onClick={() => setPickerOpen(true)}
          className="flex items-center gap-1.5 rounded-full bg-[#0F7B3A] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#0B5C2A]"
        >
          <Plus className="h-3.5 w-3.5" />
          Add products
        </button>
      </div>

      {selected.length === 0 ? (
        <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-[11px] leading-relaxed text-amber-900">
            No products selected, so this rail is <strong>hidden on the site</strong>. Add at least
            one for it to appear.
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {selected.map((row) => (
            <span
              key={row.product_id}
              className="group inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white py-1.5 pr-1.5 pl-3 text-xs font-semibold text-neutral-700"
            >
              {row.product_name}
              <span className="text-[10px] font-normal text-neutral-400">₹{row.price}</span>
              <button
                onClick={() => void toggle(row, false)}
                disabled={busyId === row.product_id}
                title={`Remove from ${railName}`}
                className="rounded-full p-1 text-neutral-300 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Add-products modal */}
      {pickerOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4">
          <div className="mt-12 flex max-h-[70vh] w-full max-w-lg flex-col rounded-2xl bg-white">
            <div className="flex items-center justify-between border-b border-neutral-100 p-4">
              <div>
                <h3 className="font-bold text-[#0A1F12]">Add to {railName}</h3>
                <p className="text-[11px] text-neutral-500">Click a product to add it</p>
              </div>
              <button
                onClick={() => {
                  setPickerOpen(false);
                  setSearch('');
                }}
                className="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="border-b border-neutral-100 p-3">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products…"
                  className="w-full rounded-lg border border-neutral-300 py-2 pr-3 pl-9 text-sm focus:border-[#0F7B3A] focus:outline-none"
                />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-2">
              {candidates.length === 0 ? (
                <p className="py-8 text-center text-sm text-neutral-400">
                  {search ? 'No products match.' : 'Every product is already in this rail.'}
                </p>
              ) : (
                candidates.map((row) => (
                  <button
                    key={row.product_id}
                    onClick={() => void toggle(row, true)}
                    disabled={busyId === row.product_id}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left hover:bg-neutral-50 disabled:opacity-40"
                  >
                    <span className="text-sm font-semibold text-neutral-700">
                      {row.product_name}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="text-xs text-neutral-400">₹{row.price}</span>
                      <Check className="h-4 w-4 text-[#0F7B3A] opacity-0 group-hover:opacity-100" />
                    </span>
                  </button>
                ))
              )}
            </div>

            <div className="border-t border-neutral-100 p-3">
              <button
                onClick={() => {
                  setPickerOpen(false);
                  setSearch('');
                }}
                className="w-full rounded-full bg-neutral-900 py-2.5 text-sm font-bold text-white"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="text-[10px] leading-relaxed text-neutral-400">
        Changes here save immediately — no need to press Save. Product names and prices come from
        the main admin dashboard.
      </p>
    </div>
  );
};
