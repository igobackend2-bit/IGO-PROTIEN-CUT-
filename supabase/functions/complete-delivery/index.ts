// complete-delivery
//
// Marks the delivery assignment Delivered and flips `orders.status` to
// "Delivered" through the existing orders table — which reuses the Phase 11
// notification trigger (and every other Delivered-triggered flow already
// built, e.g. Phase 13 loyalty cashback) instead of duplicating any of it
// here. Hard-refuses unless the order's OTP has already been verified.
import { serviceClient, requireUser } from "../_shared/client.ts";
import { corsHeaders, jsonResponse, errorResponse } from "../_shared/cors.ts";

const ACTIVE_STATUSES = ["Accepted", "Partner Assigned", "Picked Up", "On The Way", "Near You"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const user = await requireUser(req);
    if (!user) return errorResponse("Not authenticated.", 401);

    const { order_id } = await req.json();
    if (!order_id) return errorResponse("order_id is required.");

    const db = serviceClient();

    const { data: order, error: orderError } = await db.from("orders").select("id, user_id, status").eq("id", order_id).maybeSingle();
    if (orderError) return errorResponse(orderError.message, 500);
    if (!order) return errorResponse("Order not found.", 404);
    if (order.user_id !== user.id) return errorResponse("Not authorized for this order.", 403);

    if (order.status === "Delivered") return jsonResponse({ completed: true, alreadyDelivered: true });

    const { data: otpRow } = await db.from("delivery_otps").select("is_verified").eq("order_id", order_id).maybeSingle();
    if (!otpRow?.is_verified) return errorResponse("Delivery OTP has not been verified yet.", 403);

    const { data: assignment, error: assignmentError } = await db
      .from("delivery_assignments")
      .select("*")
      .eq("order_id", order_id)
      .in("status", ACTIVE_STATUSES)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (assignmentError) return errorResponse(assignmentError.message, 500);
    if (!assignment) return errorResponse("No active delivery assignment found for this order.", 404);

    await db
      .from("delivery_assignments")
      .update({ status: "Delivered", delivered_at: new Date().toISOString() })
      .eq("id", assignment.id);

    await db.from("orders").update({ status: "Delivered" }).eq("id", order_id);

    return jsonResponse({ completed: true, alreadyDelivered: false });
  } catch (e) {
    return errorResponse(e instanceof Error ? e.message : "Unexpected error.", 500);
  }
});
