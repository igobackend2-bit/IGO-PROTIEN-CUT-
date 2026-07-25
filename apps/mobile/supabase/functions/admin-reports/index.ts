// admin-reports
//
// Structured, exportable rows over the same tables admin-analytics reads —
// this is the "give me every row" export counterpart to analytics'
// "give me the aggregate" summaries. Returns JSON rows always, plus a ready
// -to-download CSV string when `format: 'csv'` is requested. PDF rendering
// itself is left to the Admin Dashboard (this project already renders
// PDFs client-side for invoices via the `pdf` package, not server-side) —
// the `columns`/`rows` shape returned here is exactly what a PDF table
// renderer would need, so nothing about this format is CSV-specific.
import { corsHeaders, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { requireAdmin, logAudit, handleAdminError } from "../_shared/admin.ts";
import { toCsv } from "../_shared/csv.ts";

const PERMISSION = "reports.generate";
const REPORT_TYPES = ["sales", "inventory", "orders", "delivery", "payments", "customer"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    if (body.action !== "generate") return errorResponse(`Unknown action: ${body.action}`);

    const reportType = body.reportType as string;
    if (!REPORT_TYPES.includes(reportType)) return errorResponse(`reportType must be one of: ${REPORT_TYPES.join(", ")}`);

    const { db, userId, roleName } = await requireAdmin(req, PERMISSION);

    const dateFrom = body.dateFrom ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const dateTo = body.dateTo ?? new Date().toISOString();

    let columns: string[] = [];
    let rows: Array<Record<string, unknown>> = [];

    switch (reportType) {
      case "sales": {
        columns = ["order_id", "order_date", "product_name", "quantity", "unit_price", "line_total"];
        const { data, error } = await db
          .from("order_items")
          .select("order_id, quantity, price, products ( name ), orders!inner ( created_at, status )")
          .gte("orders.created_at", dateFrom)
          .lte("orders.created_at", dateTo)
          .neq("orders.status", "Cancelled");
        if (error) return errorResponse(error.message, 500);
        rows = (data ?? []).map((r) => ({
          order_id: r.order_id,
          order_date: (r.orders as unknown as { created_at: string }).created_at,
          product_name: (r.products as unknown as { name: string } | null)?.name ?? "Unknown",
          quantity: r.quantity,
          unit_price: r.price,
          line_total: Number(r.price) * Number(r.quantity),
        }));
        break;
      }

      case "inventory": {
        columns = ["id", "name", "category", "stock_quantity", "low_stock_threshold", "is_available"];
        const { data, error } = await db.from("products").select(columns.join(",")).order("stock_quantity");
        if (error) return errorResponse(error.message, 500);
        rows = data ?? [];
        break;
      }

      case "orders": {
        columns = ["id", "created_at", "status", "user_id", "total_price", "payment_method", "delivery_slot"];
        const { data, error } = await db.from("orders").select(columns.join(",")).gte("created_at", dateFrom).lte("created_at", dateTo).order("created_at", { ascending: false });
        if (error) return errorResponse(error.message, 500);
        rows = data ?? [];
        break;
      }

      case "delivery": {
        columns = ["assignment_id", "order_id", "partner_name", "status", "assigned_at", "picked_up_at", "delivered_at", "eta_minutes"];
        const { data, error } = await db
          .from("delivery_assignments")
          .select("id, order_id, status, assigned_at, picked_up_at, delivered_at, eta_minutes, delivery_partners ( name )")
          .gte("assigned_at", dateFrom)
          .lte("assigned_at", dateTo);
        if (error) return errorResponse(error.message, 500);
        rows = (data ?? []).map((r) => ({
          assignment_id: r.id,
          order_id: r.order_id,
          partner_name: (r.delivery_partners as unknown as { name: string } | null)?.name ?? "Unknown",
          status: r.status,
          assigned_at: r.assigned_at,
          picked_up_at: r.picked_up_at,
          delivered_at: r.delivered_at,
          eta_minutes: r.eta_minutes,
        }));
        break;
      }

      case "payments": {
        columns = ["id", "order_id", "amount", "status", "payment_method", "refund_status", "refund_amount", "created_at"];
        const { data, error } = await db.from("payments").select(columns.join(",")).gte("created_at", dateFrom).lte("created_at", dateTo).order("created_at", { ascending: false });
        if (error) return errorResponse(error.message, 500);
        rows = data ?? [];
        break;
      }

      case "customer": {
        columns = ["user_id", "full_name", "phone_number", "order_count", "total_spent", "joined_at"];
        const { data: profiles, error: profilesError } = await db.from("profiles").select("id, full_name, phone_number, created_at");
        if (profilesError) return errorResponse(profilesError.message, 500);
        const { data: orders, error: ordersError } = await db.from("orders").select("user_id, total_price, status");
        if (ordersError) return errorResponse(ordersError.message, 500);

        const byUser = new Map<string, { count: number; spent: number }>();
        for (const o of orders ?? []) {
          const entry = byUser.get(o.user_id) ?? { count: 0, spent: 0 };
          entry.count += 1;
          if (o.status === "Delivered") entry.spent += Number(o.total_price);
          byUser.set(o.user_id, entry);
        }
        rows = (profiles ?? []).map((p) => ({
          user_id: p.id,
          full_name: p.full_name,
          phone_number: p.phone_number,
          order_count: byUser.get(p.id)?.count ?? 0,
          total_spent: byUser.get(p.id)?.spent ?? 0,
          joined_at: p.created_at,
        }));
        break;
      }
    }

    await logAudit(db, {
      adminUserId: userId,
      role: roleName,
      action: "report.generated",
      entityType: "report",
      details: { reportType, dateFrom, dateTo, format: body.format ?? "json", rowCount: rows.length },
    });

    if (body.format === "csv") {
      return jsonResponse({ reportType, columns, rowCount: rows.length, csv: toCsv(rows, columns) });
    }
    return jsonResponse({ reportType, columns, rows });
  } catch (e) {
    return handleAdminError(e);
  }
});
