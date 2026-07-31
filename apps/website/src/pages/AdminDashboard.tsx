import React, { useState, useEffect, useCallback } from 'react';
import {
  Image as ImageIcon,
  Scale,
  Search,
  Users,
  ExternalLink,
  RefreshCw,
  Download,
  Trash2,
  Check,
  X,
  AlertCircle,
  Save,
  Home,
  LayoutGrid,
  FolderOpen,
  BookOpen,
  FileText,
  LogOut,
  Tag
} from 'lucide-react';
import { signOut } from '../lib/api/auth';
import { MediaLibrary } from '../components/admin/MediaLibrary';
import { ContentEditor } from '../components/admin/ContentEditor';
import { MerchandisingTab } from '../components/admin/MerchandisingTab';
import { Product } from '../types';
import {
  listSiteContent,
  upsertSiteContent,
  setSiteContentActive,
  deleteSiteContent,
  listVariants,
  setVariantPriceOverride,
  setVariantActive,
  listSeo,
  saveSeo,
  listLeads,
  setLeadStatus,
  deleteLead,
  leadsToCsv,
  SiteContentRow,
  VariantAdminRow,
  SeoRow,
  LeadRow
} from '../lib/api/websiteAdmin';

/**
 * WEBSITE CONTENT ADMIN
 *
 * Scope is deliberately narrow. Products, pricing, stock, orders, delivery,
 * customers, coupons, offers, combos, support, notifications, analytics,
 * reports and roles all live in the Flutter admin dashboard and are NOT
 * duplicated here — two editors for one field is how prices drift apart.
 *
 * What remains is the handful of things the Flutter admin has no screen for,
 * all stored in website-owned `igo_*` tables:
 *   Banners   igo_site_content
 *   Weights   igo_product_variants
 *   SEO       igo_product_web_meta
 *   Leads     igo_leads
 *
 * Access is gated in App.tsx on an active row in the app's `admin_users`
 * table, and again by RLS on every table below.
 */

const ADMIN_DASHBOARD_URL = 'https://protein-cuts-admin.vercel.app/';

type Tab =
  | 'homepage'
  | 'sections'
  | 'plans'
  | 'pages'
  | 'merch'
  | 'media'
  | 'banners'
  | 'weights'
  | 'seo'
  | 'leads';

const TABS: { id: Tab; label: string; icon: typeof ImageIcon }[] = [
  { id: 'homepage', label: 'Homepage', icon: Home },
  { id: 'sections', label: 'Sections', icon: LayoutGrid },
  { id: 'plans', label: 'Plans & Recipes', icon: BookOpen },
  { id: 'pages', label: 'Pages & SEO', icon: FileText },
  { id: 'media', label: 'Media', icon: FolderOpen },
  { id: 'banners', label: 'Banners', icon: ImageIcon },
  { id: 'merch', label: 'Pricing & Badges', icon: Tag },
  { id: 'weights', label: 'Weight Options', icon: Scale },
  { id: 'seo', label: 'Product SEO', icon: Search },
  { id: 'leads', label: 'Leads', icon: Users }
];

interface AdminDashboardProps {
  products: Product[];
  onNavigate: (path: string) => void;
  onRefreshProducts: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  onNavigate,
  onRefreshProducts
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('homepage');
  const [toast, setToast] = useState<{ msg: string; kind: 'ok' | 'err' } | null>(null);

  const notify = useCallback((msg: string, kind: 'ok' | 'err' = 'ok') => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 3000);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-[#08120B]">Website Content</h1>
          <p className="text-sm text-neutral-600 mt-1 max-w-2xl">
            Banners, weight options, SEO and enquiries — the parts of the site the main admin
            dashboard doesn&apos;t cover.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            View store
          </button>
          <button
            onClick={async () => {
              await signOut();
              onNavigate('/');
            }}
            className="flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
          <button
            onClick={onRefreshProducts}
            className="flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh catalog
          </button>
          <a
            href={ADMIN_DASHBOARD_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-full bg-[#0F7B3A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0c6630]"
          >
            Main admin dashboard
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>

      {/* Where-to-go-for-what. Prevents someone hunting for Orders in here. */}
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <p className="text-sm text-amber-900">
          <strong>Products, prices, stock, orders, customers, coupons and offers</strong> are managed
          in the{' '}
          <a href={ADMIN_DASHBOARD_URL} target="_blank" rel="noreferrer" className="underline font-semibold">
            main admin dashboard
          </a>
          , which the mobile app shares. Changes there appear on this website automatically.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex items-center gap-2 overflow-x-auto border-b border-neutral-200 pb-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${
                isActive
                  ? 'bg-[#0F7B3A] text-white'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'homepage' && (
        <ContentEditor
          keyPrefix="home."
          title="Homepage content"
          description="Hero headlines, promo carousel, category circles, Instagram strip, stats and banners. Changes go live as soon as you save."
          notify={notify}
        />
      )}

      {activeTab === 'sections' && (
        <ContentEditor
          keyPrefix="sections."
          title="Page sections"
          description="Trust cards, the comparison table, certifications, How It Works, Our Farms and promo tiles. Certifications and the comparison table were previously duplicated across several files — editing them here updates every place they appear."
          notify={notify}
        />
      )}

      {activeTab === 'plans' && (
        <ContentEditor
          keyPrefix="plans."
          title="Plans, recipes & guides"
          description="Subscription plans, signature recipes and the Cook It Right guides. Ingredients and steps are editable as add/remove lists."
          notify={notify}
        />
      )}

      {activeTab === 'pages' && (
        <ContentEditor
          keyPrefix="pages."
          title="Static pages"
          description="About, B2B, Careers and Contact copy. Each page is a list of heading/body sections you can add to."
          notify={notify}
        />
      )}

      {activeTab === 'pages' && (
        <div className="mt-6">
          <ContentEditor
            keyPrefix="seo."
            title="Page SEO"
            description="Browser title, meta description and social share image for each page. These are what Google and WhatsApp previews use."
            notify={notify}
          />
        </div>
      )}

      {activeTab === 'merch' && <MerchandisingTab notify={notify} />}

      {activeTab === 'media' && <MediaLibrary notify={notify} />}

      {activeTab === 'banners' && <BannersTab notify={notify} />}
      {activeTab === 'weights' && <WeightsTab notify={notify} />}
      {activeTab === 'seo' && <SeoTab notify={notify} productCount={products.length} />}
      {activeTab === 'leads' && <LeadsTab notify={notify} />}

      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg ${
            toast.kind === 'ok' ? 'bg-[#0F7B3A]' : 'bg-red-600'
          }`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
};

// ── Shared bits ─────────────────────────────────────────────────────────────

type Notify = (msg: string, kind?: 'ok' | 'err') => void;

const Loading = () => <p className="py-12 text-center text-neutral-500">Loading…</p>;

const Empty = ({ children }: { children: React.ReactNode }) => (
  <p className="py-12 text-center text-neutral-500">{children}</p>
);

// ── Banners ─────────────────────────────────────────────────────────────────

const BannersTab: React.FC<{ notify: Notify }> = ({ notify }) => {
  const [rows, setRows] = useState<SiteContentRow[] | null>(null);
  const [newKey, setNewKey] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newImage, setNewImage] = useState('');
  const [newLink, setNewLink] = useState('');

  const load = useCallback(async () => {
    const res = await listSiteContent();
    if (!res.ok) {
      notify(res.error ?? 'Could not load content.', 'err');
      setRows([]);
      return;
    }
    setRows(res.data ?? []);
  }, [notify]);

  useEffect(() => {
    void load();
  }, [load]);

  const create = async () => {
    if (!newKey.trim() || !newTitle.trim()) {
      notify('A key and a title are required.', 'err');
      return;
    }
    const res = await upsertSiteContent({
      key: newKey.trim(),
      content_type: 'banner',
      payload: { title: newTitle.trim(), image: newImage.trim(), link: newLink.trim() },
      is_active: true,
      display_order: (rows?.length ?? 0) + 1
    });
    if (!res.ok) {
      notify(res.error ?? 'Could not save.', 'err');
      return;
    }
    setNewKey('');
    setNewTitle('');
    setNewImage('');
    setNewLink('');
    notify('Banner saved.');
    void load();
  };

  if (rows === null) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-neutral-200 p-5">
        <h2 className="mb-4 font-bold text-[#08120B]">Add a banner</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="Key — e.g. home.hero"
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Title"
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
          <input
            value={newImage}
            onChange={(e) => setNewImage(e.target.value)}
            placeholder="Image URL"
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
          <input
            value={newLink}
            onChange={(e) => setNewLink(e.target.value)}
            placeholder="Link — e.g. /offers"
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          onClick={create}
          className="mt-4 flex items-center gap-2 rounded-full bg-[#0F7B3A] px-5 py-2 text-sm font-semibold text-white"
        >
          <Save className="h-4 w-4" />
          Save banner
        </button>
        <p className="mt-2 text-xs text-neutral-500">
          The key must be unique. Re-using an existing key updates that banner instead of creating a
          second one.
        </p>
      </div>

      {rows.length === 0 ? (
        <Empty>No banners yet. Add one above.</Empty>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-200">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left text-xs uppercase text-neutral-500">
              <tr>
                <th className="p-3">Key</th>
                <th className="p-3">Title</th>
                <th className="p-3">Order</th>
                <th className="p-3">Active</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-neutral-100">
                  <td className="p-3 font-mono text-xs">{row.key}</td>
                  <td className="p-3">{String(row.payload?.title ?? '—')}</td>
                  <td className="p-3">{row.display_order}</td>
                  <td className="p-3">
                    <button
                      onClick={async () => {
                        const res = await setSiteContentActive(row.id, !row.is_active);
                        if (!res.ok) notify(res.error ?? 'Failed.', 'err');
                        else void load();
                      }}
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        row.is_active
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-neutral-100 text-neutral-500'
                      }`}
                    >
                      {row.is_active ? <Check className="inline h-3 w-3" /> : <X className="inline h-3 w-3" />}
                      <span className="ml-1">{row.is_active ? 'Live' : 'Hidden'}</span>
                    </button>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={async () => {
                        const res = await deleteSiteContent(row.id);
                        if (!res.ok) notify(res.error ?? 'Failed.', 'err');
                        else {
                          notify('Deleted.');
                          void load();
                        }
                      }}
                      className="text-neutral-400 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ── Weights ─────────────────────────────────────────────────────────────────

const WeightsTab: React.FC<{ notify: Notify }> = ({ notify }) => {
  const [rows, setRows] = useState<VariantAdminRow[] | null>(null);
  const [search, setSearch] = useState('');
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    const res = await listVariants();
    if (!res.ok) {
      notify(res.error ?? 'Could not load weight options.', 'err');
      setRows([]);
      return;
    }
    setRows(res.data ?? []);
  }, [notify]);

  useEffect(() => {
    void load();
  }, [load]);

  if (rows === null) return <Loading />;

  const filtered = search.trim()
    ? rows.filter((r) => (r.product_name ?? '').toLowerCase().includes(search.toLowerCase()))
    : rows;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
        Prices are calculated as <strong>base price × multiplier</strong>, where the base price comes
        from the main admin dashboard. Changing a price there updates every weight here
        automatically. Set an override only when one weight needs an exact figure — clear it to go
        back to automatic.
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search products…"
        className="w-full max-w-sm rounded-lg border border-neutral-300 px-3 py-2 text-sm"
      />

      {filtered.length === 0 ? (
        <Empty>No weight options found.</Empty>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-200">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left text-xs uppercase text-neutral-500">
              <tr>
                <th className="p-3">Product</th>
                <th className="p-3">Weight</th>
                <th className="p-3">Base</th>
                <th className="p-3">×</th>
                <th className="p-3">Shown price</th>
                <th className="p-3">Override</th>
                <th className="p-3">Active</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const calculated = Math.round((row.product_price ?? 0) * row.price_multiplier);
                const shown = row.price_override ?? calculated;
                return (
                  <tr key={row.id} className="border-t border-neutral-100">
                    <td className="p-3 font-semibold">{row.product_name}</td>
                    <td className="p-3">{row.label}</td>
                    <td className="p-3 text-neutral-500">₹{row.product_price}</td>
                    <td className="p-3 text-neutral-500">{row.price_multiplier}</td>
                    <td className="p-3 font-bold">
                      ₹{shown}
                      {row.price_override !== null && (
                        <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                          FIXED
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <input
                          value={drafts[row.id] ?? (row.price_override?.toString() ?? '')}
                          onChange={(e) => setDrafts({ ...drafts, [row.id]: e.target.value })}
                          placeholder="auto"
                          className="w-20 rounded border border-neutral-300 px-2 py-1 text-xs"
                        />
                        <button
                          onClick={async () => {
                            const raw = drafts[row.id] ?? '';
                            const value = raw.trim() === '' ? null : Number(raw);
                            if (value !== null && Number.isNaN(value)) {
                              notify('Enter a number, or leave blank for automatic.', 'err');
                              return;
                            }
                            const res = await setVariantPriceOverride(row.id, value);
                            if (!res.ok) notify(res.error ?? 'Failed.', 'err');
                            else {
                              notify(value === null ? 'Back to automatic pricing.' : 'Price fixed.');
                              void load();
                            }
                          }}
                          className="rounded bg-neutral-800 px-2 py-1 text-xs font-bold text-white"
                        >
                          Set
                        </button>
                      </div>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={async () => {
                          const res = await setVariantActive(row.id, !row.is_active);
                          if (!res.ok) notify(res.error ?? 'Failed.', 'err');
                          else void load();
                        }}
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          row.is_active
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-neutral-100 text-neutral-500'
                        }`}
                      >
                        {row.is_active ? 'Shown' : 'Hidden'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ── SEO ─────────────────────────────────────────────────────────────────────

const SeoTab: React.FC<{ notify: Notify; productCount: number }> = ({ notify }) => {
  const [rows, setRows] = useState<SeoRow[] | null>(null);
  const [search, setSearch] = useState('');
  const [drafts, setDrafts] = useState<Record<string, Partial<SeoRow>>>({});

  const load = useCallback(async () => {
    const res = await listSeo();
    if (!res.ok) {
      notify(res.error ?? 'Could not load SEO data.', 'err');
      setRows([]);
      return;
    }
    setRows(res.data ?? []);
  }, [notify]);

  useEffect(() => {
    void load();
  }, [load]);

  if (rows === null) return <Loading />;

  const filtered = search.trim()
    ? rows.filter((r) => (r.product_name ?? '').toLowerCase().includes(search.toLowerCase()))
    : rows;

  return (
    <div className="space-y-4">
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search products…"
        className="w-full max-w-sm rounded-lg border border-neutral-300 px-3 py-2 text-sm"
      />

      <div className="space-y-3">
        {filtered.slice(0, 60).map((row) => {
          const draft = drafts[row.product_id] ?? {};
          return (
            <div key={row.product_id} className="rounded-xl border border-neutral-200 p-4">
              <p className="mb-3 font-bold text-[#08120B]">{row.product_name}</p>
              <div className="grid gap-3 md:grid-cols-3">
                <input
                  value={draft.slug ?? row.slug ?? ''}
                  onChange={(e) =>
                    setDrafts({ ...drafts, [row.product_id]: { ...draft, slug: e.target.value } })
                  }
                  placeholder="URL slug"
                  className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                />
                <input
                  value={draft.seo_title ?? row.seo_title ?? ''}
                  onChange={(e) =>
                    setDrafts({
                      ...drafts,
                      [row.product_id]: { ...draft, seo_title: e.target.value }
                    })
                  }
                  placeholder="SEO title"
                  className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                />
                <input
                  value={draft.seo_description ?? row.seo_description ?? ''}
                  onChange={(e) =>
                    setDrafts({
                      ...drafts,
                      [row.product_id]: { ...draft, seo_description: e.target.value }
                    })
                  }
                  placeholder="Meta description"
                  className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                />
              </div>
              <button
                onClick={async () => {
                  const res = await saveSeo({
                    product_id: row.product_id,
                    slug: draft.slug ?? row.slug ?? null,
                    seo_title: draft.seo_title ?? row.seo_title ?? null,
                    seo_description: draft.seo_description ?? row.seo_description ?? null
                  });
                  if (!res.ok) notify(res.error ?? 'Failed.', 'err');
                  else notify('SEO saved.');
                }}
                className="mt-3 rounded-full bg-[#0F7B3A] px-4 py-1.5 text-xs font-semibold text-white"
              >
                Save
              </button>
            </div>
          );
        })}
      </div>

      {filtered.length > 60 && (
        <p className="text-center text-sm text-neutral-500">
          Showing the first 60 of {filtered.length}. Use search to narrow it down.
        </p>
      )}
    </div>
  );
};

// ── Leads ───────────────────────────────────────────────────────────────────

const LeadsTab: React.FC<{ notify: Notify }> = ({ notify }) => {
  const [rows, setRows] = useState<LeadRow[] | null>(null);

  const load = useCallback(async () => {
    const res = await listLeads();
    if (!res.ok) {
      notify(res.error ?? 'Could not load leads.', 'err');
      setRows([]);
      return;
    }
    setRows(res.data ?? []);
  }, [notify]);

  useEffect(() => {
    void load();
  }, [load]);

  if (rows === null) return <Loading />;

  const download = () => {
    const csv = leadsToCsv(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `igo-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (rows.length === 0) return <Empty>No enquiries yet.</Empty>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-600">
          <strong>{rows.length}</strong> {rows.length === 1 ? 'enquiry' : 'enquiries'}
        </p>
        <button
          onClick={download}
          className="flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-neutral-200">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-xs uppercase text-neutral-500">
            <tr>
              <th className="p-3">Received</th>
              <th className="p-3">Type</th>
              <th className="p-3">Name</th>
              <th className="p-3">Contact</th>
              <th className="p-3">City</th>
              <th className="p-3">Status</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((lead) => (
              <tr key={lead.id} className="border-t border-neutral-100 align-top">
                <td className="p-3 whitespace-nowrap text-xs text-neutral-500">
                  {new Date(lead.created_at).toLocaleDateString('en-IN')}
                </td>
                <td className="p-3 capitalize">{lead.lead_type}</td>
                <td className="p-3 font-semibold">{lead.full_name ?? '—'}</td>
                <td className="p-3 text-xs">
                  {lead.email && <div>{lead.email}</div>}
                  {lead.phone && <div className="text-neutral-500">{lead.phone}</div>}
                </td>
                <td className="p-3">{lead.city ?? '—'}</td>
                <td className="p-3">
                  <select
                    value={lead.status}
                    onChange={async (e) => {
                      const res = await setLeadStatus(lead.id, e.target.value);
                      if (!res.ok) notify(res.error ?? 'Failed.', 'err');
                      else void load();
                    }}
                    className="rounded border border-neutral-300 px-2 py-1 text-xs"
                  >
                    <option>New</option>
                    <option>In Discussion</option>
                    <option>Closed</option>
                  </select>
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={async () => {
                      const res = await deleteLead(lead.id);
                      if (!res.ok) notify(res.error ?? 'Failed.', 'err');
                      else {
                        notify('Lead deleted.');
                        void load();
                      }
                    }}
                    className="text-neutral-400 hover:text-red-600"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
