// admin-coupons
//
// Admin CRUD over the existing Phase 15 `coupons` / `offers` / `combo_packs`
// tables — no new promotions schema, no new pricing logic. Checkout's
// CouponRepository keeps validating exactly the same rows this writes.
import { corsHeaders, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { requireAdmin, logAudit, handleAdminError } from "../_shared/admin.ts";

const PERMISSION = "coupons.manage";

const COUPON_FIELDS = [
  "code", "description", "discount_type", "discount_value", "min_order_value",
  "is_active", "expires_at", "usage_limit", "one_time_use", "first_order_only",
  "product_id", "category", "user_id",
];

const OFFER_FIELDS = [
  "type", "title", "description", "discount_type", "discount_value",
  "start_date", "end_date", "priority", "active", "banner_image_url",
  "coupon_code", "min_order_value", "product_id", "category",
  "total_quantity", "remaining_quantity",
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

    const { db, userId, roleName } = await requireAdmin(req, PERMISSION);

    switch (action) {
      case "listCoupons": {
        const { data, error } = await db.from("coupons").select("*").order("created_at", { ascending: false });
        if (error) return errorResponse(error.message, 500);
        return jsonResponse({ coupons: data });
      }

      case "createCoupon": {
        const payload = pick(body, COUPON_FIELDS);
        if (!payload.code) return errorResponse("code is required.");
        payload.code = String(payload.code).trim().toUpperCase();
        const { data, error } = await db.from("coupons").insert(payload).select().single();
        if (error) return errorResponse(error.message, 500);
        await logAudit(db, { adminUserId: userId, role: roleName, action: "coupon.created", entityType: "coupon", entityId: data.id, details: payload });
        return jsonResponse({ coupon: data });
      }

      case "updateCoupon": {
        if (!body.id) return errorResponse("id is required.");
        const payload = pick(body, COUPON_FIELDS);
        const { data, error } = await db.from("coupons").update(payload).eq("id", body.id).select().single();
        if (error) return errorResponse(error.message, 500);
        await logAudit(db, { adminUserId: userId, role: roleName, action: "coupon.updated", entityType: "coupon", entityId: body.id, details: payload });
        return jsonResponse({ coupon: data });
      }

      case "disableCoupon": {
        if (!body.id) return errorResponse("id is required.");
        const { data, error } = await db.from("coupons").update({ is_active: false }).eq("id", body.id).select().single();
        if (error) return errorResponse(error.message, 500);
        await logAudit(db, { adminUserId: userId, role: roleName, action: "coupon.disabled", entityType: "coupon", entityId: body.id });
        return jsonResponse({ coupon: data });
      }

      case "expireCoupon": {
        if (!body.id) return errorResponse("id is required.");
        const { data, error } = await db.from("coupons").update({ expires_at: new Date().toISOString() }).eq("id", body.id).select().single();
        if (error) return errorResponse(error.message, 500);
        await logAudit(db, { adminUserId: userId, role: roleName, action: "coupon.expired", entityType: "coupon", entityId: body.id });
        return jsonResponse({ coupon: data });
      }

      case "deleteCoupon": {
        if (!body.id) return errorResponse("id is required.");
        const { error } = await db.from("coupons").delete().eq("id", body.id);
        if (error) return errorResponse(error.message, 500);
        await logAudit(db, { adminUserId: userId, role: roleName, action: "coupon.deleted", entityType: "coupon", entityId: body.id });
        return jsonResponse({ deleted: true });
      }

      case "listOffers": {
        const { data, error } = await db.from("offers").select("*").order("priority", { ascending: false });
        if (error) return errorResponse(error.message, 500);
        return jsonResponse({ offers: data });
      }

      case "createOffer": {
        const payload = pick(body, OFFER_FIELDS);
        if (!payload.title || !payload.type || !payload.start_date || !payload.end_date) {
          return errorResponse("type, title, start_date and end_date are required.");
        }
        const { data, error } = await db.from("offers").insert(payload).select().single();
        if (error) return errorResponse(error.message, 500);
        await logAudit(db, { adminUserId: userId, role: roleName, action: "offer.created", entityType: "offer", entityId: data.id, details: payload });
        return jsonResponse({ offer: data });
      }

      case "updateOffer": {
        if (!body.id) return errorResponse("id is required.");
        const payload = pick(body, OFFER_FIELDS);
        const { data, error } = await db.from("offers").update(payload).eq("id", body.id).select().single();
        if (error) return errorResponse(error.message, 500);
        await logAudit(db, { adminUserId: userId, role: roleName, action: "offer.updated", entityType: "offer", entityId: body.id, details: payload });
        return jsonResponse({ offer: data });
      }

      case "setOfferActive": {
        if (!body.id || body.active === undefined) return errorResponse("id and active are required.");
        const { data, error } = await db.from("offers").update({ active: body.active }).eq("id", body.id).select().single();
        if (error) return errorResponse(error.message, 500);
        await logAudit(db, { adminUserId: userId, role: roleName, action: body.active ? "offer.activated" : "offer.deactivated", entityType: "offer", entityId: body.id });
        return jsonResponse({ offer: data });
      }

      case "deleteOffer": {
        if (!body.id) return errorResponse("id is required.");
        const { error } = await db.from("offers").delete().eq("id", body.id);
        if (error) return errorResponse(error.message, 500);
        await logAudit(db, { adminUserId: userId, role: roleName, action: "offer.deleted", entityType: "offer", entityId: body.id });
        return jsonResponse({ deleted: true });
      }

      case "listComboPacks": {
        const { data, error } = await db.from("combo_packs").select("*, combo_pack_items (*)").order("created_at", { ascending: false });
        if (error) return errorResponse(error.message, 500);
        return jsonResponse({ comboPacks: data });
      }

      case "createComboPack": {
        if (!body.title || !Array.isArray(body.items) || body.items.length === 0) {
          return errorResponse("title and a non-empty items array are required.");
        }
        const { data: pack, error: packError } = await db
          .from("combo_packs")
          .insert({
            title: body.title,
            description: body.description ?? null,
            discount: body.discount ?? 0,
            bundle_type: body.bundleType ?? "fixed",
            pick_count: body.pickCount ?? null,
            banner_image_url: body.bannerImageUrl ?? null,
            active: body.active ?? true,
          })
          .select()
          .single();
        if (packError) return errorResponse(packError.message, 500);

        const items = (body.items as Array<{ productId: string; quantity?: number }>).map((i) => ({
          combo_pack_id: pack.id,
          product_id: i.productId,
          quantity: i.quantity ?? 1,
        }));
        const { error: itemsError } = await db.from("combo_pack_items").insert(items);
        if (itemsError) return errorResponse(itemsError.message, 500);

        await logAudit(db, { adminUserId: userId, role: roleName, action: "combo_pack.created", entityType: "combo_pack", entityId: pack.id, details: { itemCount: items.length } });
        return jsonResponse({ comboPack: pack });
      }

      case "updateComboPack": {
        if (!body.id) return errorResponse("id is required.");
        const payload = pick(body, ["title", "description", "discount", "bundle_type", "pick_count", "banner_image_url"]);
        const { data, error } = await db.from("combo_packs").update(payload).eq("id", body.id).select().single();
        if (error) return errorResponse(error.message, 500);
        await logAudit(db, { adminUserId: userId, role: roleName, action: "combo_pack.updated", entityType: "combo_pack", entityId: body.id, details: payload });
        return jsonResponse({ comboPack: data });
      }

      case "setComboPackActive": {
        if (!body.id || body.active === undefined) return errorResponse("id and active are required.");
        const { data, error } = await db.from("combo_packs").update({ active: body.active }).eq("id", body.id).select().single();
        if (error) return errorResponse(error.message, 500);
        await logAudit(db, { adminUserId: userId, role: roleName, action: body.active ? "combo_pack.activated" : "combo_pack.deactivated", entityType: "combo_pack", entityId: body.id });
        return jsonResponse({ comboPack: data });
      }

      case "deleteComboPack": {
        if (!body.id) return errorResponse("id is required.");
        const { error } = await db.from("combo_packs").delete().eq("id", body.id);
        if (error) return errorResponse(error.message, 500);
        await logAudit(db, { adminUserId: userId, role: roleName, action: "combo_pack.deleted", entityType: "combo_pack", entityId: body.id });
        return jsonResponse({ deleted: true });
      }

      default:
        return errorResponse(`Unknown action: ${action}`);
    }
  } catch (e) {
    return handleAdminError(e);
  }
});
