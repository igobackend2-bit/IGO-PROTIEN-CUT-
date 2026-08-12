// update-location
//
// Meant to be called by the future Delivery Partner App (or a manual test
// call — see the migration/README) once per GPS ping. Nothing in this
// Protein Cuts Flutter app calls this today: there is no real delivery
// partner device yet, and fabricating fake movement from the customer app
// would mean showing invented tracking data, which this project avoids
// throughout. The customer app only ever *listens* to the rows this
// function writes, via Supabase Realtime.
//
// Derives the fine-grained delivery status (Picked Up / On The Way / Near
// You) from real distance-to-destination math — never set directly by a
// client — and syncs `orders.status` to "Out For Delivery" the moment a
// partner picks up, which reuses the existing Phase 11 order-status
// notification trigger for free.
import { serviceClient, requireUser } from "../_shared/client.ts";
import { corsHeaders, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { distanceMeters, etaMinutesFor, NEAR_YOU_THRESHOLD_METERS } from "../_shared/geo.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // No delivery-partner role exists yet, so any authenticated caller is
    // accepted for now — the one check to tighten once the Delivery
    // Partner App ships with its own partner-scoped auth.
    const user = await requireUser(req);
    if (!user) return errorResponse("Not authenticated.", 401);

    const { assignment_id, lat, lng, picked_up } = await req.json();
    if (!assignment_id || typeof lat !== "number" || typeof lng !== "number") {
      return errorResponse("assignment_id, lat and lng are required.");
    }

    const db = serviceClient();

    const { data: assignment, error: assignmentError } = await db
      .from("delivery_assignments")
      .select("*, orders ( id, user_id, address_id, addresses ( latitude, longitude ) )")
      .eq("id", assignment_id)
      .maybeSingle();
    if (assignmentError) return errorResponse(assignmentError.message, 500);
    if (!assignment) return errorResponse("Assignment not found.", 404);
    if (["Delivered", "Cancelled", "Failed"].includes(assignment.status)) {
      return errorResponse(`Assignment is already ${assignment.status}.`, 409);
    }

    const { error: locationError } = await db
      .from("delivery_locations")
      .insert({ assignment_id, lat, lng });
    if (locationError) return errorResponse(locationError.message, 500);

    const order = assignment.orders as { id: string; user_id: string; addresses: { latitude: number | null; longitude: number | null } | null };
    const destination = order?.addresses;

    let distance: number | null = null;
    let etaMinutes: number | null = null;
    if (destination?.latitude != null && destination?.longitude != null) {
      distance = distanceMeters({ lat, lng }, { lat: destination.latitude, lng: destination.longitude });
      etaMinutes = etaMinutesFor(distance);
    }

    const updates: Record<string, unknown> = { eta_minutes: etaMinutes, distance_meters: distance };
    let notifyTitle: string | null = null;
    let notifyMessage: string | null = null;

    const wasPickedUp = assignment.picked_up_at != null;
    if (picked_up === true && !wasPickedUp) {
      updates.status = "Picked Up";
      updates.picked_up_at = new Date().toISOString();
      notifyTitle = "OTP Required";
      notifyMessage = "Your delivery partner has picked up your order. Keep your delivery OTP ready.";

      // Reuses the existing orders table + Phase 11 trigger — no duplicate
      // "Out For Delivery" notification logic here.
      await db.from("orders").update({ status: "Out For Delivery" }).eq("id", order.id);
    } else if (wasPickedUp && distance != null && distance <= NEAR_YOU_THRESHOLD_METERS) {
      if (assignment.status !== "Near You") {
        updates.status = "Near You";
        notifyTitle = "Your Delivery Partner is Near You";
        notifyMessage = "Your order will arrive any minute — please be available.";
      }
    } else if (wasPickedUp && assignment.status === "Picked Up") {
      updates.status = "On The Way";
    }

    const { data: updated, error: updateError } = await db
      .from("delivery_assignments")
      .update(updates)
      .eq("id", assignment_id)
      .select()
      .single();
    if (updateError) return errorResponse(updateError.message, 500);

    if (notifyTitle) {
      await db.from("notifications").insert({
        user_id: order.user_id,
        type: "delivery_update",
        title: notifyTitle,
        message: notifyMessage,
        data: { order_id: order.id, assignment_id },
      });
    }

    return jsonResponse({ assignment: updated });
  } catch (e) {
    return errorResponse(e instanceof Error ? e.message : "Unexpected error.", 500);
  }
});
