// admin-products
//
// Product catalog, categories and review-moderation management for the
// future Admin Dashboard. Products stay a plain table (no new product
// module) — this only adds the privileged write path on top of it,
// gated per-action so e.g. inventory staff with only `products.view`
// can browse but not edit.
import { corsHeaders, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { requireAdmin, logAudit, handleAdminError } from "../_shared/admin.ts";

const PERMISSION_BY_ACTION: Record<string, string> = {
  list: "products.view",
  get: "products.view",
  create: "products.manage",
  update: "products.manage",
  delete: "products.manage",
  publish: "products.manage",
  unpublish: "products.manage",
  listCategories: "products.view",
  createCategory: "products.manage",
  updateCategory: "products.manage",
  deleteCategory: "products.manage",
  moderateReview: "reviews.moderate",
};

const PRODUCT_FIELDS = [
  "name", "description", "price", "image_url", "category", "weight",
  "protein_per_100g", "fat_per_100g", "storage_instruction", "brand",
  "is_available", "image_urls", "ingredients", "cooking_tips", "recipe_ideas",
  "stock_quantity", "low_stock_threshold",
];

function pick(body: Record<string, unknown>, fields: string[]) {
  const out: Record<string, unknown> = {};
  for (const f of fields) if (body[f] !== undefined) out[f] = body[f];
  return out;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const action = body.action as string;
    const permission = PERMISSION_BY_ACTION[action];
    if (!permission) return errorResponse(`Unknown action: ${action}`);

    const { db, userId, roleName } = await requireAdmin(req, permission);

    switch (action) {
      case "list": {
        let query = db.from("products").select("*", { count: "exact" }).order("created_at", { ascending: false });
        if (body.category) query = query.eq("category", body.category);
        if (body.isAvailable !== undefined) query = query.eq("is_available", body.isAvailable);
        if (body.search) query = query.ilike("name", `%${body.search}%`);
        const limit = Math.min(Number(body.limit) || 50, 200);
        const offset = Number(body.offset) || 0;
        const { data, error, count } = await query.range(offset, offset + limit - 1);
        if (error) return errorResponse(error.message, 500);
        return jsonResponse({ products: data, total: count });
      }

      case "get": {
        if (!body.id) return errorResponse("id is required.");
        const { data, error } = await db.from("products").select("*").eq("id", body.id).maybeSingle();
        if (error) return errorResponse(error.message, 500);
        return jsonResponse({ product: data });
      }

      case "create": {
        const payload = pick(body, PRODUCT_FIELDS);
        if (!payload.name || payload.price === undefined) return errorResponse("name and price are required.");
        const { data, error } = await db.from("products").insert(payload).select().single();
        if (error) return errorResponse(error.message, 500);
        await logAudit(db, { adminUserId: userId, role: roleName, action: "product.created", entityType: "product", entityId: data.id, details: payload });
        return jsonResponse({ product: data });
      }

      case "update": {
        if (!body.id) return errorResponse("id is required.");
        const payload = pick(body, PRODUCT_FIELDS);
        const { data, error } = await db.from("products").update(payload).eq("id", body.id).select().single();
        if (error) return errorResponse(error.message, 500);
        await logAudit(db, { adminUserId: userId, role: roleName, action: "product.updated", entityType: "product", entityId: body.id, details: payload });
        return jsonResponse({ product: data });
      }

      case "delete": {
        if (!body.id) return errorResponse("id is required.");
        const { error } = await db.from("products").delete().eq("id", body.id);
        if (error) return errorResponse(error.message, 500);
        await logAudit(db, { adminUserId: userId, role: roleName, action: "product.deleted", entityType: "product", entityId: body.id });
        return jsonResponse({ deleted: true });
      }

      case "publish":
      case "unpublish": {
        if (!body.id) return errorResponse("id is required.");
        const isAvailable = action === "publish";
        const { data, error } = await db.from("products").update({ is_available: isAvailable }).eq("id", body.id).select().single();
        if (error) return errorResponse(error.message, 500);
        await logAudit(db, { adminUserId: userId, role: roleName, action: `product.${action}ed`, entityType: "product", entityId: body.id });
        return jsonResponse({ product: data });
      }

      case "listCategories": {
        const { data, error } = await db.from("categories").select("*").order("display_order");
        if (error) return errorResponse(error.message, 500);
        return jsonResponse({ categories: data });
      }

      case "createCategory": {
        if (!body.name) return errorResponse("name is required.");
        const { data, error } = await db
          .from("categories")
          .insert({ name: body.name, emoji: body.emoji ?? null, display_order: body.displayOrder ?? 0 })
          .select()
          .single();
        if (error) return errorResponse(error.message, 500);
        await logAudit(db, { adminUserId: userId, role: roleName, action: "category.created", entityType: "category", entityId: data.id, details: body });
        return jsonResponse({ category: data });
      }

      case "updateCategory": {
        if (!body.id) return errorResponse("id is required.");
        const payload = pick(body, ["name", "emoji", "display_order", "is_active"]);
        const { data, error } = await db.from("categories").update(payload).eq("id", body.id).select().single();
        if (error) return errorResponse(error.message, 500);
        await logAudit(db, { adminUserId: userId, role: roleName, action: "category.updated", entityType: "category", entityId: body.id, details: payload });
        return jsonResponse({ category: data });
      }

      case "deleteCategory": {
        if (!body.id) return errorResponse("id is required.");
        const { error } = await db.from("categories").delete().eq("id", body.id);
        if (error) return errorResponse(error.message, 500);
        await logAudit(db, { adminUserId: userId, role: roleName, action: "category.deleted", entityType: "category", entityId: body.id });
        return jsonResponse({ deleted: true });
      }

      case "moderateReview": {
        // product_reviews.id is bigint, not uuid — pass it through as-is
        // rather than assuming a uuid shape.
        if (body.reviewId === undefined) return errorResponse("reviewId is required.");
        const isHidden = body.isHidden !== false;
        const { data, error } = await db.from("product_reviews").update({ is_hidden: isHidden }).eq("id", body.reviewId).select().single();
        if (error) return errorResponse(error.message, 500);
        await logAudit(db, { adminUserId: userId, role: roleName, action: isHidden ? "review.hidden" : "review.unhidden", entityType: "product_review", entityId: String(body.reviewId) });
        return jsonResponse({ review: data });
      }

      default:
        return errorResponse(`Unknown action: ${action}`);
    }
  } catch (e) {
    return handleAdminError(e);
  }
});
