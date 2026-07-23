// admin-delivery
//
// Fleet-wide delivery visibility and reassignment. Reuses Phase 17's
// estimate-eta verbatim for ETA refreshes (forwarding the admin's own
// token, which that function now recognizes) instead of re-implementing
// the distance/ETA math a second time. Partner assignment logic itself
// still lives only in assign-delivery — this function's "reassign" just
// swaps which partner an existing assignment points at.
import { corsHeaders, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { requireAdmin, logAudit, handleAdminError, invokeEdgeFunction } from "../_shared/admin.ts";

const PERMISSION_BY_ACTION: Record<string, string> = {
  list: "delivery.view",
  get: "delivery.view",
  liveStatus: "delivery.view",
  listPartners: "delivery.view",
  createPartner: "delivery.manage",
  updatePartner: "delivery.manage",
  setPartnerActive: "delivery.manage",
  reassign: "delivery.manage",
  refreshEta: "delivery.manage",
};

const ASSIGNMENT_SELECT = "*, delivery_partners (*), orders ( id, user_id, status, total_price )";

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
        let query = db.from("delivery_assignments").select(ASSIGNMENT_SELECT, { count: "exact" }).order("created_at", { ascending: false });
        if (body.status) query = query.eq("status", body.status);
        if (body.partnerId) query = query.eq("partner_id", body.partnerId);
        const limit = Math.min(Number(body.limit) || 50, 200);
        const offset = Number(body.offset) || 0;
        const { data, error, count } = await query.range(offset, offset + limit - 1);
        if (error) return errorResponse(error.message, 500);
        return jsonResponse({ assignments: data, total: count });
      }

      case "get": {
        if (!body.assignmentId) return errorResponse("assignmentId is required.");
        const { data, error } = await db.from("delivery_assignments").select(ASSIGNMENT_SELECT).eq("id", body.assignmentId).maybeSingle();
        if (error) return errorResponse(error.message, 500);
        return jsonResponse({ assignment: data });
      }

      case "liveStatus": {
        if (!body.assignmentId) return errorResponse("assignmentId is required.");
        const limit = Math.min(Number(body.limit) || 20, 100);
        const [{ data: assignment, error: assignmentError }, { data: locations, error: locationsError }] = await Promise.all([
          db.from("delivery_assignments").select(ASSIGNMENT_SELECT).eq("id", body.assignmentId).maybeSingle(),
          db.from("delivery_locations").select("*").eq("assignment_id", body.assignmentId).order("recorded_at", { ascending: false }).limit(limit),
        ]);
        if (assignmentError) return errorResponse(assignmentError.message, 500);
        if (locationsError) return errorResponse(locationsError.message, 500);
        return jsonResponse({ assignment, locations });
      }

      case "listPartners": {
        const { data, error } = await db.from("delivery_partners").select("*").order("name");
        if (error) return errorResponse(error.message, 500);
        return jsonResponse({ partners: data });
      }

      case "createPartner": {
        if (!body.name || !body.phone) return errorResponse("name and phone are required.");
        const { data, error } = await db
          .from("delivery_partners")
          .insert({
            name: body.name,
            phone: body.phone,
            vehicle_number: body.vehicleNumber ?? null,
            vehicle_type: body.vehicleType ?? null,
            photo_url: body.photoUrl ?? null,
            rating: body.rating ?? 5.0,
            is_active: body.isActive ?? true,
          })
          .select()
          .single();
        if (error) return errorResponse(error.message, 500);
        await logAudit(db, { adminUserId: userId, role: roleName, action: "delivery_partner.created", entityType: "delivery_partner", entityId: data.id, details: body });
        return jsonResponse({ partner: data });
      }

      case "updatePartner": {
        if (!body.partnerId) return errorResponse("partnerId is required.");
        const payload: Record<string, unknown> = {};
        for (const [key, column] of [
          ["name", "name"], ["phone", "phone"], ["vehicleNumber", "vehicle_number"],
          ["vehicleType", "vehicle_type"], ["photoUrl", "photo_url"], ["rating", "rating"],
        ] as const) {
          if (body[key] !== undefined) payload[column] = body[key];
        }
        const { data, error } = await db.from("delivery_partners").update(payload).eq("id", body.partnerId).select().single();
        if (error) return errorResponse(error.message, 500);
        await logAudit(db, { adminUserId: userId, role: roleName, action: "delivery_partner.updated", entityType: "delivery_partner", entityId: body.partnerId, details: payload });
        return jsonResponse({ partner: data });
      }

      case "setPartnerActive": {
        if (!body.partnerId || body.isActive === undefined) return errorResponse("partnerId and isActive are required.");
        const { data, error } = await db.from("delivery_partners").update({ is_active: body.isActive }).eq("id", body.partnerId).select().single();
        if (error) return errorResponse(error.message, 500);
        await logAudit(db, { adminUserId: userId, role: roleName, action: body.isActive ? "delivery_partner.activated" : "delivery_partner.deactivated", entityType: "delivery_partner", entityId: body.partnerId });
        return jsonResponse({ partner: data });
      }

      case "reassign": {
        if (!body.assignmentId || !body.newPartnerId) return errorResponse("assignmentId and newPartnerId are required.");
        const { data: assignment, error: assignmentError } = await db.from("delivery_assignments").select("*, orders ( user_id )").eq("id", body.assignmentId).maybeSingle();
        if (assignmentError) return errorResponse(assignmentError.message, 500);
        if (!assignment) return errorResponse("Assignment not found.", 404);
        if (["Delivered", "Cancelled", "Failed"].includes(assignment.status)) {
          return errorResponse(`Assignment is already ${assignment.status} — can't reassign.`, 409);
        }

        const previousPartnerId = assignment.partner_id;
        const { data: updated, error } = await db.from("delivery_assignments").update({ partner_id: body.newPartnerId }).eq("id", body.assignmentId).select().single();
        if (error) return errorResponse(error.message, 500);

        await db.from("orders").update({ delivery_partner_id: body.newPartnerId }).eq("id", assignment.order_id);

        const orderUserId = (assignment.orders as { user_id?: string } | null)?.user_id;
        if (orderUserId) {
          await db.from("notifications").insert({
            user_id: orderUserId,
            type: "delivery_update",
            title: "Delivery Partner Updated",
            message: "A new delivery partner has been assigned to your order.",
            data: { order_id: assignment.order_id, assignment_id: assignment.id },
          });
        }

        await logAudit(db, {
          adminUserId: userId,
          role: roleName,
          action: "delivery.reassigned",
          entityType: "delivery_assignment",
          entityId: body.assignmentId,
          details: { from: previousPartnerId, to: body.newPartnerId },
        });
        return jsonResponse({ assignment: updated });
      }

      case "refreshEta": {
        if (!body.orderId) return errorResponse("orderId is required.");
        const result = await invokeEdgeFunction(req, "estimate-eta", { order_id: body.orderId });
        return jsonResponse(result);
      }

      default:
        return errorResponse(`Unknown action: ${action}`);
    }
  } catch (e) {
    return handleAdminError(e);
  }
});
