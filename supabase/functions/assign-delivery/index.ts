// assign-delivery
//
// Picks the least-busy active delivery partner for an order, creates its
// delivery_assignments row, generates the delivery OTP, and notifies the
// customer. This is the ONLY place assignment logic lives — Flutter (and,
// later, an Admin Dashboard) just calls this function with an order_id.
//
// Idempotent: calling it again for an order that already has a live
// assignment just returns that assignment instead of creating a second one,
// so a client is always safe to call this opportunistically.
import { serviceClient, requireUser } from "../_shared/client.ts";
import { corsHeaders, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { STORE_LOCATION, distanceMeters, etaMinutesFor, randomOtp } from "../_shared/geo.ts";
import { isCallerAdmin } from "../_shared/admin.ts";

const ACTIVE_STATUSES = ["Accepted", "Partner Assigned", "Picked Up", "On The Way", "Near You"];
const TERMINAL_ORDER_STATUSES = ["Delivered", "Cancelled", "Refunded"];
// A partner can only be picked once the store has actually accepted, packed,
// and readied the order — never the moment it's placed. "Out For Delivery"
// stays assignable too so an already-assigned order's opportunistic re-check
// (see the customer app's DeliveryBootstrapNotifier) stays idempotent instead
// of erroring after pickup.
const ASSIGNABLE_ORDER_STATUSES = ["Ready", "Out For Delivery"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const user = await requireUser(req);
    if (!user) return errorResponse("Not authenticated.", 401);

    const { order_id } = await req.json();
    if (!order_id) return errorResponse("order_id is required.");

    const db = serviceClient();

    const { data: order, error: orderError } = await db
      .from("orders")
      .select("id, user_id, status, address_id, addresses ( latitude, longitude )")
      .eq("id", order_id)
      .maybeSingle();
    if (orderError) return errorResponse(orderError.message, 500);
    if (!order) return errorResponse("Order not found.", 404);

    // Ownership check — relaxed for Phase 18's admin roles (orders.manage
    // or delivery.manage) so the future Admin Dashboard can assign
    // delivery on a customer's behalf using this exact same function.
    if (order.user_id !== user.id && !(await isCallerAdmin(db, user.id, ["orders.manage", "delivery.manage"]))) {
      return errorResponse("Not authorized for this order.", 403);
    }

    if (TERMINAL_ORDER_STATUSES.includes(order.status)) {
      return errorResponse(`Order is already ${order.status} — nothing to assign.`, 409);
    }
    if (!ASSIGNABLE_ORDER_STATUSES.includes(order.status)) {
      return errorResponse(`Order is ${order.status} — delivery can only be assigned once it's Ready for pickup.`, 409);
    }

    const { data: existing } = await db
      .from("delivery_assignments")
      .select("*")
      .eq("order_id", order_id)
      .in("status", ACTIVE_STATUSES)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (existing) return jsonResponse({ assignment: existing, alreadyAssigned: true });

    const { data: partners, error: partnersError } = await db
      .from("delivery_partners")
      .select("*")
      .eq("is_active", true);
    if (partnersError) return errorResponse(partnersError.message, 500);
    if (!partners || partners.length === 0) return errorResponse("No delivery partners available.", 503);

    const { data: activeAssignments } = await db
      .from("delivery_assignments")
      .select("partner_id")
      .in("status", ACTIVE_STATUSES);
    const loadByPartner = new Map<string, number>();
    for (const a of activeAssignments ?? []) {
      loadByPartner.set(a.partner_id, (loadByPartner.get(a.partner_id) ?? 0) + 1);
    }
    const partner = [...partners].sort(
      (a, b) => (loadByPartner.get(a.id) ?? 0) - (loadByPartner.get(b.id) ?? 0),
    )[0];

    const destination = order.addresses as { latitude: number | null; longitude: number | null } | null;
    let etaMinutes: number | null = null;
    let distance: number | null = null;
    if (destination?.latitude != null && destination?.longitude != null) {
      distance = distanceMeters(STORE_LOCATION, { lat: destination.latitude, lng: destination.longitude });
      etaMinutes = etaMinutesFor(distance);
    }

    const { data: assignment, error: assignError } = await db
      .from("delivery_assignments")
      .insert({
        order_id,
        partner_id: partner.id,
        status: "Partner Assigned",
        eta_minutes: etaMinutes,
        distance_meters: distance,
      })
      .select()
      .single();
    if (assignError) return errorResponse(assignError.message, 500);

    const otpCode = randomOtp(4);
    await db.from("delivery_otps").insert({
      order_id,
      assignment_id: assignment.id,
      otp_code: otpCode,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });

    await db.from("orders").update({ delivery_partner_id: partner.id, delivery_otp: otpCode }).eq("id", order_id);

    await db.from("notifications").insert({
      user_id: order.user_id,
      type: "delivery_update",
      title: "Delivery Partner Assigned",
      message: `${partner.name} has been assigned to deliver your order.`,
      data: { order_id, assignment_id: assignment.id },
    });

    return jsonResponse({ assignment, partner, otp_code: otpCode });
  } catch (e) {
    return errorResponse(e instanceof Error ? e.message : "Unexpected error.", 500);
  }
});
