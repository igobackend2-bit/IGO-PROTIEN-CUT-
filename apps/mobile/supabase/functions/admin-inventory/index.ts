// admin-inventory
//
// Stock in/out/adjustment against `products.stock_quantity`, all funneled
// through the single `apply_inventory_change` Postgres function so the
// running total and the `inventory_history` ledger can never drift apart.
import { corsHeaders, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { requireAdmin, logAudit, handleAdminError } from "../_shared/admin.ts";

const PERMISSION_BY_ACTION: Record<string, string> = {
  listLowStock: "inventory.view",
  listOutOfStock: "inventory.view",
  history: "inventory.view",
  stockIn: "inventory.manage",
  stockOut: "inventory.manage",
  adjustment: "inventory.manage",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const action = body.action as string;
    const permission = PERMISSION_BY_ACTION[action];
    if (!permission) return errorResponse(`Unknown action: ${action}`);

    const { db, userId, roleName } = await requireAdmin(req, permission);

    switch (action) {
      case "listLowStock": {
        const { data, error } = await db
          .from("products")
          .select("id, name, stock_quantity, low_stock_threshold, category")
          .gt("stock_quantity", 0)
          .order("stock_quantity", { ascending: true });
        if (error) return errorResponse(error.message, 500);
        const lowStock = (data ?? []).filter((p) => p.stock_quantity <= p.low_stock_threshold);
        return jsonResponse({ products: lowStock });
      }

      case "listOutOfStock": {
        const { data, error } = await db
          .from("products")
          .select("id, name, stock_quantity, category")
          .eq("stock_quantity", 0);
        if (error) return errorResponse(error.message, 500);
        return jsonResponse({ products: data });
      }

      case "history": {
        if (!body.productId) return errorResponse("productId is required.");
        const limit = Math.min(Number(body.limit) || 50, 200);
        const offset = Number(body.offset) || 0;
        const { data, error } = await db
          .from("inventory_history")
          .select("*")
          .eq("product_id", body.productId)
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1);
        if (error) return errorResponse(error.message, 500);
        return jsonResponse({ history: data });
      }

      case "stockIn":
      case "stockOut": {
        if (!body.productId || !body.quantity) return errorResponse("productId and a positive quantity are required.");
        const quantity = Math.abs(Number(body.quantity));
        if (!Number.isFinite(quantity) || quantity <= 0) return errorResponse("quantity must be a positive number.");

        if (action === "stockOut") {
          const { data: current } = await db.from("products").select("stock_quantity").eq("id", body.productId).maybeSingle();
          if (!current) return errorResponse("Product not found.", 404);
          if (current.stock_quantity < quantity) {
            return errorResponse(`Only ${current.stock_quantity} in stock — can't remove ${quantity}.`, 409);
          }
        }

        const delta = action === "stockIn" ? quantity : -quantity;
        const { data: product, error } = await db.rpc("apply_inventory_change", {
          p_product_id: body.productId,
          p_change_type: action === "stockIn" ? "stock_in" : "stock_out",
          p_quantity_change: delta,
          p_reason: body.reason ?? null,
          p_performed_by: userId,
        });
        if (error) return errorResponse(error.message, 500);

        await logAudit(db, {
          adminUserId: userId,
          role: roleName,
          action: `inventory.${action}`,
          entityType: "product",
          entityId: body.productId,
          details: { quantity: delta, reason: body.reason ?? null },
        });
        return jsonResponse({ product });
      }

      case "adjustment": {
        if (!body.productId || body.newStock === undefined) return errorResponse("productId and newStock are required.");
        const newStock = Number(body.newStock);
        if (!Number.isFinite(newStock) || newStock < 0) return errorResponse("newStock must be zero or a positive number.");

        const { data: current, error: currentError } = await db.from("products").select("stock_quantity").eq("id", body.productId).maybeSingle();
        if (currentError) return errorResponse(currentError.message, 500);
        if (!current) return errorResponse("Product not found.", 404);

        const delta = newStock - current.stock_quantity;
        const { data: product, error } = await db.rpc("apply_inventory_change", {
          p_product_id: body.productId,
          p_change_type: "adjustment",
          p_quantity_change: delta,
          p_reason: body.reason ?? null,
          p_performed_by: userId,
        });
        if (error) return errorResponse(error.message, 500);

        await logAudit(db, {
          adminUserId: userId,
          role: roleName,
          action: "inventory.adjustment",
          entityType: "product",
          entityId: body.productId,
          details: { from: current.stock_quantity, to: newStock, reason: body.reason ?? null },
        });
        return jsonResponse({ product });
      }

      default:
        return errorResponse(`Unknown action: ${action}`);
    }
  } catch (e) {
    return handleAdminError(e);
  }
});
