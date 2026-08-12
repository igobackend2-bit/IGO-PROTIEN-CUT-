import React, { useState, useEffect, useCallback } from 'react';
import { Save, Search, Flame, Sun, Star, Info } from 'lucide-react';
import { listMerchandising, saveMerchandising, MerchRow } from '../../lib/api/websiteAdmin';

/**
 * MERCHANDISING — list price and homepage placement, per product.
 *
 * `price` is owned by the Flutter admin and shown read-only, so there's exactly
 * one place a selling price is set. What lives here is website-only
 * merchandising:
 *
 *   Was price   the struck-through list price on cards and combo banners.
 *               Leave blank for no discount — that's the correct default, and
 *               why every product used to render "₹649 ₹649 0% OFF".
 *   Bestseller  adds it to the Top Picks rail
 *   Fresh today adds it to Today's Fresh Stock
 *   Flash deal  adds it to the Flash Deals countdown rail
 */

interface MerchandisingTabProps {
  notify: (msg: string, kind?: 'ok' | 'err') => void;
}

export const MerchandisingTab: React.FC<MerchandisingTabProps> = ({ notify }) => {
  const [rows, setRows] = useState<MerchRow[] | null>(null);
  const [search, setSearch] = useState('');
  const [drafts, setDrafts] = useState<Record<string, MerchRow>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [onlyChanged, setOnlyChanged] = useState(false);

  const load = useCallback(async () => {
    const res = await listMerchandising();
    if (!res.ok) {
      notify(res.error ?? 'Could not load products.', 'err');
      setRows([]);
      return;
    }
    setRows(res.data ?? []);
    setDrafts(Object.fromEntries((res.data ?? []).map((r) => [r.product_id, r])));
  }, [notify]);

  useEffect(() => {
    void load();
  }, [load]);

  if (rows === null) {
    return <p className="py-16 text-center text-sm text-neutral-500">Loading products…</p>;
  }

  const isDirty = (id: string) => {
    const original = rows.find((r) => r.product_id === id);
    return original && JSON.stringify(original) !== JSON.stringify(drafts[id]);
  };

  const update = (id: string, patch: Partial<MerchRow>) =>
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const save = async (id: string) => {
    const d = drafts[id];
    if (!d) return;

    if (d.original_price !== null && d.original_price <= d.price) {
      notify('"Was" price must be higher than the selling price to show a discount.', 'err');
      return;
    }

    setSavingId(id);
    const res = await saveMerchandising({
      product_id: d.product_id,
      original_price: d.original_price,
      is_best_seller: d.is_best_seller,
      is_today_fresh: d.is_today_fresh,
      is_flash_offer: d.is_flash_offer
    });
    setSavingId(null);

    if (!res.ok) {
      notify(res.error ?? 'Could not save.', 'err');
      return;
    }
    notify('Saved.');
    void load();
  };

  const visible = rows
    .filter((r) => (search.trim() ? r.product_name.toLowerCase().includes(search.toLowerCase()) : true))
    .filter((r) => (onlyChanged ? isDirty(r.product_id) : true));

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-[#0A1F12]">Pricing badges & homepage placement</h2>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-neutral-600">
          Selling prices are set in the main admin dashboard and shown here read-only. What you
          control here is the struck-through &ldquo;was&rdquo; price and which homepage rails each
          product appears in.
        </p>
      </div>

      <div className="flex items-start gap-2.5 rounded-xl border border-blue-200 bg-blue-50 p-3.5">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
        <p className="text-xs leading-relaxed text-blue-900">
          Leave <strong>Was price</strong> blank for no discount. Set it above the selling price and
          the strikethrough plus a calculated &ldquo;N% OFF&rdquo; badge appear on product cards and
          the combo banner.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="w-full rounded-lg border border-neutral-300 py-2 pr-3 pl-9 text-sm focus:border-[#0F7B3A] focus:outline-none"
          />
        </div>
        <button
          onClick={() => setOnlyChanged((s) => !s)}
          className={`rounded-full px-3 py-2 text-xs font-semibold ${
            onlyChanged
              ? 'bg-[#0F7B3A] text-white'
              : 'border border-neutral-300 text-neutral-600 hover:bg-neutral-50'
          }`}
        >
          Unsaved only
        </button>
        <span className="text-xs text-neutral-500">{visible.length} shown</span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-neutral-200">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-[10px] tracking-wider text-neutral-500 uppercase">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">Price</th>
              <th className="p-3">Was price</th>
              <th className="p-3">Discount</th>
              <th className="p-3 text-center">Bestseller</th>
              <th className="p-3 text-center">Fresh today</th>
              <th className="p-3 text-center">Flash deal</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => {
              const d = drafts[row.product_id] ?? row;
              const pct =
                d.original_price && d.original_price > d.price
                  ? Math.round((1 - d.price / d.original_price) * 100)
                  : 0;
              const dirty = isDirty(row.product_id);

              return (
                <tr
                  key={row.product_id}
                  className={`border-t border-neutral-100 ${dirty ? 'bg-amber-50/50' : ''}`}
                >
                  <td className="p-3 font-semibold text-[#0A1F12]">{row.product_name}</td>
                  <td className="p-3 text-neutral-500">₹{row.price}</td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={d.original_price ?? ''}
                      placeholder="—"
                      onChange={(e) =>
                        update(row.product_id, {
                          original_price: e.target.value === '' ? null : Number(e.target.value)
                        })
                      }
                      className="w-24 rounded border border-neutral-300 px-2 py-1.5 text-sm focus:border-[#0F7B3A] focus:outline-none"
                    />
                  </td>
                  <td className="p-3">
                    {pct > 0 ? (
                      <span className="rounded-full bg-[#D4AF37] px-2 py-0.5 text-[10px] font-black text-[#0A1F12]">
                        {pct}% OFF
                      </span>
                    ) : (
                      <span className="text-xs text-neutral-300">none</span>
                    )}
                  </td>

                  <Toggle
                    on={d.is_best_seller}
                    onClick={() => update(row.product_id, { is_best_seller: !d.is_best_seller })}
                    icon={Star}
                  />
                  <Toggle
                    on={d.is_today_fresh}
                    onClick={() => update(row.product_id, { is_today_fresh: !d.is_today_fresh })}
                    icon={Sun}
                  />
                  <Toggle
                    on={d.is_flash_offer}
                    onClick={() => update(row.product_id, { is_flash_offer: !d.is_flash_offer })}
                    icon={Flame}
                  />

                  <td className="p-3 text-right">
                    <button
                      onClick={() => void save(row.product_id)}
                      disabled={!dirty || savingId === row.product_id}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#0F7B3A] px-3 py-1.5 text-xs font-bold text-white disabled:opacity-30"
                    >
                      <Save className="h-3 w-3" />
                      {savingId === row.product_id ? '…' : 'Save'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {visible.length === 0 && (
        <p className="py-10 text-center text-sm text-neutral-500">No products match.</p>
      )}
    </div>
  );
};

const Toggle: React.FC<{
  on: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
}> = ({ on, onClick, icon: Icon }) => (
  <td className="p-3 text-center">
    <button
      onClick={onClick}
      className={`inline-flex h-7 w-7 items-center justify-center rounded-full transition ${
        on ? 'bg-[#0F7B3A] text-white' : 'bg-neutral-100 text-neutral-300 hover:bg-neutral-200'
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  </td>
);
