// admin-notifications
//
// Sends through the exact same `notifications` table every existing
// trigger and NotificationService already reads — no parallel messaging
// system. Every row this writes is tagged `data.sent_by = 'admin'` so a
// future dashboard can distinguish admin-authored messages from the
// system-generated ones without a schema change.
import { corsHeaders, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { requireAdmin, logAudit, handleAdminError } from "../_shared/admin.ts";

const PERMISSION = "notifications.send";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const action = body.action as string;

    const { db, userId, roleName } = await requireAdmin(req, PERMISSION);

    switch (action) {
      case "broadcast": {
        if (!body.title || !body.message) return errorResponse("title and message are required.");
        const { data: profiles, error: profilesError } = await db.from("profiles").select("id");
        if (profilesError) return errorResponse(profilesError.message, 500);

        const rows = (profiles ?? []).map((p) => ({
          user_id: p.id,
          type: "general_announcement",
          title: body.title,
          message: body.message,
          data: { sent_by: "admin", admin_user_id: userId },
        }));
        if (rows.length > 0) {
          const { error } = await db.from("notifications").insert(rows);
          if (error) return errorResponse(error.message, 500);
        }

        await logAudit(db, { adminUserId: userId, role: roleName, action: "notification.broadcast", entityType: "notification", details: { title: body.title, recipients: rows.length } });
        return jsonResponse({ sent: rows.length });
      }

      case "targetUser": {
        if (!body.userId || !body.title || !body.message) return errorResponse("userId, title and message are required.");
        const { data, error } = await db
          .from("notifications")
          .insert({
            user_id: body.userId,
            type: "general_announcement",
            title: body.title,
            message: body.message,
            data: { sent_by: "admin", admin_user_id: userId },
          })
          .select()
          .single();
        if (error) return errorResponse(error.message, 500);

        await logAudit(db, { adminUserId: userId, role: roleName, action: "notification.targeted", entityType: "notification", entityId: data.id, details: { userId: body.userId, title: body.title } });
        return jsonResponse({ notification: data });
      }

      case "targetCategory": {
        if (!body.category || !body.title || !body.message) return errorResponse("category, title and message are required.");

        // Real segment: customers who have actually bought from this
        // category before — not a fabricated audience.
        const { data: rows, error: lookupError } = await db
          .from("order_items")
          .select("orders!inner(user_id), products!inner(category)")
          .eq("products.category", body.category);
        if (lookupError) return errorResponse(lookupError.message, 500);

        const userIds = [...new Set((rows ?? []).map((r) => (r.orders as unknown as { user_id: string }).user_id))];
        const notifications = userIds.map((uid) => ({
          user_id: uid,
          type: "general_announcement",
          title: body.title,
          message: body.message,
          data: { sent_by: "admin", admin_user_id: userId, category: body.category },
        }));
        if (notifications.length > 0) {
          const { error } = await db.from("notifications").insert(notifications);
          if (error) return errorResponse(error.message, 500);
        }

        await logAudit(db, { adminUserId: userId, role: roleName, action: "notification.target_category", entityType: "notification", details: { category: body.category, recipients: notifications.length } });
        return jsonResponse({ sent: notifications.length });
      }

      case "history": {
        const limit = Math.min(Number(body.limit) || 50, 200);
        const { data, error } = await db
          .from("notifications")
          .select("*")
          .contains("data", { sent_by: "admin" })
          .order("created_at", { ascending: false })
          .limit(limit);
        if (error) return errorResponse(error.message, 500);
        return jsonResponse({ notifications: data });
      }

      default:
        return errorResponse(`Unknown action: ${action}`);
    }
  } catch (e) {
    return handleAdminError(e);
  }
});
