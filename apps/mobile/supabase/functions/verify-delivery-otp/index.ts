// verify-delivery-otp
//
// The sole place an OTP can be marked verified. `complete-delivery` refuses
// to run unless this has already succeeded for the order, so "delivery
// completes only after OTP verification" is enforced server-side rather
// than by trusting client call order.
import { serviceClient, requireUser } from "../_shared/client.ts";
import { corsHeaders, jsonResponse, errorResponse } from "../_shared/cors.ts";

const MAX_ATTEMPTS = 5;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const user = await requireUser(req);
    if (!user) return errorResponse("Not authenticated.", 401);

    const { order_id, otp_code } = await req.json();
    if (!order_id || !otp_code) return errorResponse("order_id and otp_code are required.");

    const db = serviceClient();

    const { data: order, error: orderError } = await db.from("orders").select("id, user_id").eq("id", order_id).maybeSingle();
    if (orderError) return errorResponse(orderError.message, 500);
    if (!order) return errorResponse("Order not found.", 404);
    if (order.user_id !== user.id) return errorResponse("Not authorized for this order.", 403);

    const { data: otpRow, error: otpError } = await db.from("delivery_otps").select("*").eq("order_id", order_id).maybeSingle();
    if (otpError) return errorResponse(otpError.message, 500);
    if (!otpRow) return errorResponse("No delivery OTP found for this order yet.", 404);

    if (otpRow.is_verified) return jsonResponse({ verified: true, alreadyVerified: true });

    if (otpRow.expires_at && new Date(otpRow.expires_at).getTime() < Date.now()) {
      return errorResponse("This OTP has expired. Please contact support.", 410);
    }

    if (otpRow.attempts >= MAX_ATTEMPTS) {
      return errorResponse("Too many incorrect attempts. Please contact support.", 429);
    }

    if (String(otp_code).trim() !== otpRow.otp_code) {
      const { data: bumped } = await db
        .from("delivery_otps")
        .update({ attempts: otpRow.attempts + 1 })
        .eq("id", otpRow.id)
        .select("attempts")
        .single();
      const remaining = Math.max(0, MAX_ATTEMPTS - (bumped?.attempts ?? otpRow.attempts + 1));
      return errorResponse(`Incorrect OTP. ${remaining} attempt(s) remaining.`, 400);
    }

    await db.from("delivery_otps").update({ is_verified: true, verified_at: new Date().toISOString() }).eq("id", otpRow.id);

    return jsonResponse({ verified: true, alreadyVerified: false });
  } catch (e) {
    return errorResponse(e instanceof Error ? e.message : "Unexpected error.", 500);
  }
});
