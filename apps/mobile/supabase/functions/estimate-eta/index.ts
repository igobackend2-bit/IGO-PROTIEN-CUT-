// estimate-eta
//
// On-demand ETA refresh — used right after assignment (before any GPS ping
// exists, falling back to the store's location) and any other time a
// client wants a fresh number without waiting for the next location ping.
// Writes the result back onto delivery_assignments so every Realtime
// listener picks it up the same way update-location's estimate does.
import { serviceClient, requireUser } from "../_shared/client.ts";
import { corsHeaders, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { STORE_LOCATION, distanceMeters, etaMinutesFor } from "../_shared/geo.ts";
import { isCallerAdmin } from "../_shared/admin.ts";

const ACTIVE_STATUSES = ["Accepted", "Partner Assigned", "Picked Up", "On The Way", "Near You"];

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
      .select("id, user_id, addresses ( latitude, longitude )")
      .eq("id", order_id)
      .maybeSingle();
    if (orderError) return errorResponse(orderError.message, 500);
    if (!order) return errorResponse("Order not found.", 404);
    if (order.user_id !== user.id && !(await isCallerAdmin(db, user.id, ["orders.manage", "delivery.manage"]))) {
      return errorResponse("Not authorized for this order.", 403);
    }

    const destination = order.addresses as { latitude: number | null; longitude: number | null } | null;
    if (destination?.latitude == null || destination?.longitude == null) {
      return errorResponse("This order's delivery address has no coordinates yet.", 422);
    }

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

    const { data: lastLocation } = await db
      .from("delivery_locations")
      .select("lat, lng")
      .eq("assignment_id", assignment.id)
      .order("recorded_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const currentPosition = lastLocation ?? STORE_LOCATION;
    const distance = distanceMeters(currentPosition, { lat: destination.latitude, lng: destination.longitude });
    const etaMinutes = etaMinutesFor(distance);

    await db.from("delivery_assignments").update({ eta_minutes: etaMinutes, distance_meters: distance }).eq("id", assignment.id);

    return jsonResponse({ eta_minutes: etaMinutes, distance_meters: distance });
  } catch (e) {
    return errorResponse(e instanceof Error ? e.message : "Unexpected error.", 500);
  }
});
