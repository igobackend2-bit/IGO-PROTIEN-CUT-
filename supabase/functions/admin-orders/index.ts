// admin-orders
//
// Order lifecycle management + refund approval. Every status change is a
// plain `orders` table update, so it fires the exact same Phase 11
// notification trigger (and, on cancel, the Phase 17 assignment-sync
// trigger) a customer-driven change would — no duplicate notification
// logic lives here. "Assign Delivery" doesn't reassign partners itself;
// it forwards the caller's own token into the existing assign-delivery
// function (Phase 17), which now recognizes admin callers too.
import { corsHeaders, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { requireAdmin, logAudit, handleAdminError, invokeEdgeFunction } from "../_shared/admin.ts";

const PERMISSION_BY_ACTION: Record<string, string> = {
  list: "orders.view",
  get: "orders.view",
  accept: "orders.manage",
  reject: "orders.manage",
  pack: "orders.manage",
  ready: "orders.manage",
  cancel: "orders.manage",
  assignDelivery: "orders.manage",
  refund: "payments.manage",
};

const TRANSITIONS: Record<string, { from: string[]; to: string }> = {
  accept: { from: ["Pending"], to: "Accepted" },
  pack: { from: ["Accepted"], to: "Packing" },
  ready: { from: ["Packing"], to: "Ready" },
  reject: { from: ["Pending", "Accepted"], to: "Cancelled" },
  cancel: { from: ["Pending", "Accepted", "Packing", "Ready", "Out For Delivery"], to: "Cancelled" },
};

const ORDER_SELECT = `
  id, user_id, total_price, status, created_at, delivery_slot, payment_method,
  coupon_code, discount_amount, delivery_fee, tax_amount, address_id,
  delivery_partner_id, delivery_otp, cancelled_at, cancel_reason,
  addresses ( full_name, phone, house, street, area, landmark, city, state, pincode ),
  order_items ( id, quantity, price, product_id, products ( id, name, image_url ) )
`;

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
        let query = db.from("orders").select(ORDER_SELECT, { count: "exact" }).order("created_at", { ascending: false });
        if (body.status) query = query.eq("status", body.status);
        if (body.userId) query = query.eq("user_id", body.userId);
        if (body.dateFrom) query = query.gte("created_at", body.dateFrom);
        if (body.dateTo) query = query.lte("created_at", body.dateTo);
        const limit = Math.min(Number(body.limit) || 50, 200);
        const offset = Number(body.offset) || 0;
        const { data, error, count } = await query.range(offset, offset + limit - 1);
        if (error) return errorResponse(error.message, 500);
        return jsonResponse({ orders: data, total: count });
      }

      case "get": {
        if (!body.orderId) return errorResponse("orderId is required.");
        const { data, error } = await db.from("orders").select(ORDER_SELECT).eq("id", body.orderId).maybeSingle();
        if (error) return errorResponse(error.message, 500);
        if (!data) return errorResponse("Order not found.", 404);
        const { data: payments } = await db.from("payments").select("*").eq("order_id", body.orderId);
        return jsonResponse({ order: data, payments: payments ?? [] });
      }

      case "accept":
      case "pack":
      case "ready":
      case "reject":
      case "cancel": {
        if (!body.orderId) return errorResponse("orderId is required.");
        const transition = TRANSITIONS[action];

        const { data: order, error: orderError } = await db.from("orders").select("id, status").eq("id", body.orderId).maybeSingle();
        if (orderError) return errorResponse(orderError.message, 500);
        if (!order) return errorResponse("Order not found.", 404);
        if (!transition.from.includes(order.status)) {
          return errorResponse(`Order is ${order.status} — can't ${action} from there.`, 409);
        }

        const updates: Record<string, unknown> = { status: transition.to };
        if (transition.to === "Cancelled") {
          updates.cancelled_at = new Date().toISOString();
          const label = action === "reject" ? "Rejected by store" : "Cancelled by store";
          updates.cancel_reason = body.reason ? `${label}: ${body.reason}` : label;
        }

        const { data: updated, error } = await db.from("orders").update(updates).eq("id", body.orderId).select().single();
        if (error) return errorResponse(error.message, 500);

        await logAudit(db, {
          adminUserId: userId,
          role: roleName,
          action: `order.${action}`,
          entityType: "order",
          entityId: body.orderId,
          details: { from: order.status, to: transition.to, reason: body.reason ?? null },
        });
        return jsonResponse({ order: updated });
      }

      case "assignDelivery": {
        if (!body.orderId) return errorResponse("orderId is required.");
        const result = await invokeEdgeFunction(req, "assign-delivery", { order_id: body.orderId });
        await logAudit(db, { adminUserId: userId, role: roleName, action: "order.assign_delivery", entityType: "order", entityId: body.orderId, details: result });
        return jsonResponse(result);
      }

      case "refund": {
        if (!body.paymentId) return errorResponse("paymentId is required.");
        const { data: payment, error: paymentError } = await db.from("payments").select("*").eq("id", body.paymentId).maybeSingle();
        if (paymentError) return errorResponse(paymentError.message, 500);
        if (!payment) return errorResponse("Payment not found.", 404);
        if (payment.refund_status === "Completed") return jsonResponse({ payment, alreadyRefunded: true });

        const refundAmount = body.amount !== undefined ? Number(body.amount) : payment.amount;
        const { data: updatedPayment, error } = await db
          .from("payments")
          .update({
            status: "Refunded",
            refund_status: "Completed",
            refund_amount: refundAmount,
            refund_reason: payment.refund_reason ?? body.reason ?? "Refunded by store",
            refund_requested_at: payment.refund_requested_at ?? new Date().toISOString(),
            refund_completed_at: new Date().toISOString(),
          })
          .eq("id", body.paymentId)
          .select()
          .single();
        if (error) return errorResponse(error.message, 500);

        await db.from("orders").update({ status: "Refunded" }).eq("id", payment.order_id);

        await logAudit(db, {
          adminUserId: userId,
          role: roleName,
          action: "payment.refunded",
          entityType: "payment",
          entityId: body.paymentId,
          details: { amount: refundAmount, orderId: payment.order_id },
        });
        return jsonResponse({ payment: updatedPayment });
      }

      default:
        return errorResponse(`Unknown action: ${action}`);
    }
  } catch (e) {
    return handleAdminError(e);
  }
});
