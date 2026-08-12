// admin-analytics
//
// Real aggregate queries over orders/order_items/products/payments/
// subscriptions — every number is computed from actual rows, nothing is a
// placeholder or fabricated. Results are cached in `analytics_cache` for
// 15 minutes so repeated dashboard loads don't re-run the aggregation on
// every request (there's no cron in this project to precompute it ahead of
// time — same "compute on demand" pattern used everywhere else).
import { corsHeaders, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { requireAdmin, logAudit, handleAdminError } from "../_shared/admin.ts";

const PERMISSION = "analytics.view";
const CACHE_TTL_MS = 15 * 60 * 1000;

function rangeFor(period: string): { from: Date; to: Date } {
  const to = new Date();
  const from = new Date(to);
  if (period === "daily") from.setDate(from.getDate() - 1);
  else if (period === "weekly") from.setDate(from.getDate() - 7);
  else from.setDate(from.getDate() - 30); // monthly
  return { from, to };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const action = body.action as string;
    if (action !== "summary") return errorResponse(`Unknown action: ${action}`);

    const period = (body.period as string) ?? "daily";
    if (!["daily", "weekly", "monthly"].includes(period)) return errorResponse("period must be daily, weekly or monthly.");

    const { db, userId, roleName } = await requireAdmin(req, PERMISSION);
    const cacheKey = `summary_${period}`;

    if (!body.forceRefresh) {
      const { data: cached } = await db.from("analytics_cache").select("*").eq("metric_key", cacheKey).maybeSingle();
      if (cached && new Date(cached.expires_at) > new Date()) {
        return jsonResponse({ ...cached.data, cached: true, computedAt: cached.computed_at });
      }
    }

    const { from, to } = rangeFor(period);
    const fromIso = from.toISOString();
    const toIso = to.toISOString();

    const [ordersRes, itemsRes, refundsRes, newCustomersRes, subsActiveRes, subsNewRes] = await Promise.all([
      db.from("orders").select("id, user_id, status, total_price, created_at").gte("created_at", fromIso).lte("created_at", toIso),
      db
        .from("order_items")
        .select("quantity, price, product_id, products ( name, category ), orders!inner ( status, created_at )")
        .gte("orders.created_at", fromIso)
        .lte("orders.created_at", toIso)
        .neq("orders.status", "Cancelled"),
      db.from("payments").select("refund_amount").eq("refund_status", "Completed").gte("refund_completed_at", fromIso).lte("refund_completed_at", toIso),
      db.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", fromIso).lte("created_at", toIso),
      db.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", "active"),
      db.from("subscriptions").select("id", { count: "exact", head: true }).gte("created_at", fromIso).lte("created_at", toIso),
    ]);

    if (ordersRes.error) return errorResponse(ordersRes.error.message, 500);
    if (itemsRes.error) return errorResponse(itemsRes.error.message, 500);

    const orders = ordersRes.data ?? [];
    // "Revenue" = committed sales — placed orders that weren't cancelled or
    // refunded, regardless of current fulfillment stage.
    const revenueOrders = orders.filter((o) => o.status !== "Cancelled" && o.status !== "Refunded");
    const revenue = revenueOrders.reduce((sum, o) => sum + Number(o.total_price), 0);
    const uniqueCustomers = new Set(orders.map((o) => o.user_id)).size;

    const productTotals = new Map<string, { productId: string; name: string; quantity: number; revenue: number }>();
    const categoryTotals = new Map<string, { category: string; quantity: number; revenue: number }>();
    for (const row of itemsRes.data ?? []) {
      const product = row.products as unknown as { name: string; category: string } | null;
      const lineRevenue = Number(row.price) * Number(row.quantity);

      const productEntry = productTotals.get(row.product_id) ?? { productId: row.product_id, name: product?.name ?? "Unknown", quantity: 0, revenue: 0 };
      productEntry.quantity += row.quantity;
      productEntry.revenue += lineRevenue;
      productTotals.set(row.product_id, productEntry);

      const category = product?.category ?? "Uncategorized";
      const categoryEntry = categoryTotals.get(category) ?? { category, quantity: 0, revenue: 0 };
      categoryEntry.quantity += row.quantity;
      categoryEntry.revenue += lineRevenue;
      categoryTotals.set(category, categoryEntry);
    }

    const topProducts = [...productTotals.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 10);
    const topCategories = [...categoryTotals.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 10);

    const refundRows = refundsRes.data ?? [];
    const refunds = { count: refundRows.length, amount: refundRows.reduce((sum, r) => sum + Number(r.refund_amount ?? 0), 0) };

    const result = {
      period,
      from: fromIso,
      to: toIso,
      sales: { orderCount: orders.length, revenue },
      customers: { active: uniqueCustomers, new: newCustomersRes.count ?? 0 },
      topProducts,
      topCategories,
      refunds,
      subscriptions: { active: subsActiveRes.count ?? 0, newInPeriod: subsNewRes.count ?? 0 },
    };

    const expiresAt = new Date(Date.now() + CACHE_TTL_MS).toISOString();
    await db.from("analytics_cache").upsert({ metric_key: cacheKey, period, data: result, expires_at: expiresAt, computed_at: new Date().toISOString() });

    await logAudit(db, { adminUserId: userId, role: roleName, action: "analytics.viewed", entityType: "analytics", entityId: cacheKey, details: { period } });

    return jsonResponse({ ...result, cached: false });
  } catch (e) {
    return handleAdminError(e);
  }
});
