// admin-support
//
// Gives Phase 16's "agent messages are expected to be inserted by real
// staff" a real, permission-checked API instead of only raw dashboard SQL.
// Replying and changing status both reuse `ticket_messages` /
// `support_tickets` directly, so the existing Phase 16 notification
// triggers (new agent message, staff-driven status change) fire exactly as
// they already do — nothing duplicated here.
import { corsHeaders, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { requireAdmin, logAudit, handleAdminError } from "../_shared/admin.ts";

const PERMISSION = "support.manage";
const VALID_STATUSES = ["Open", "In Progress", "Waiting", "Resolved", "Closed"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const action = body.action as string;

    const { db, userId, roleName } = await requireAdmin(req, PERMISSION);

    switch (action) {
      case "listTickets": {
        let query = db.from("support_tickets").select("*, profiles ( full_name )", { count: "exact" }).order("updated_at", { ascending: false });
        if (body.status) query = query.eq("status", body.status);
        if (body.category) query = query.eq("category", body.category);
        const limit = Math.min(Number(body.limit) || 50, 200);
        const offset = Number(body.offset) || 0;
        const { data, error, count } = await query.range(offset, offset + limit - 1);
        if (error) return errorResponse(error.message, 500);
        return jsonResponse({ tickets: data, total: count });
      }

      case "getTicket": {
        if (!body.ticketId) return errorResponse("ticketId is required.");
        const [{ data: ticket, error: ticketError }, { data: messages, error: messagesError }] = await Promise.all([
          db.from("support_tickets").select("*, profiles ( full_name )").eq("id", body.ticketId).maybeSingle(),
          db.from("ticket_messages").select("*").eq("ticket_id", body.ticketId).order("created_at"),
        ]);
        if (ticketError) return errorResponse(ticketError.message, 500);
        if (messagesError) return errorResponse(messagesError.message, 500);
        if (!ticket) return errorResponse("Ticket not found.", 404);
        return jsonResponse({ ticket, messages });
      }

      case "reply": {
        if (!body.ticketId || !body.message) return errorResponse("ticketId and message are required.");
        const { data: ticket } = await db.from("support_tickets").select("status").eq("id", body.ticketId).maybeSingle();
        if (!ticket) return errorResponse("Ticket not found.", 404);

        const { data, error } = await db
          .from("ticket_messages")
          .insert({ ticket_id: body.ticketId, sender: "agent", message: body.message, attachment: body.attachment ?? null })
          .select()
          .single();
        if (error) return errorResponse(error.message, 500);

        // A reply on a resolved/closed ticket reopens it — mirrors the
        // existing customer-reply-reopens-a-waiting-ticket behavior.
        if (ticket.status === "Resolved") {
          await db.from("support_tickets").update({ status: "In Progress" }).eq("id", body.ticketId);
        }

        await logAudit(db, { adminUserId: userId, role: roleName, action: "ticket.replied", entityType: "support_ticket", entityId: body.ticketId });
        return jsonResponse({ message: data });
      }

      case "setStatus": {
        if (!body.ticketId || !body.status) return errorResponse("ticketId and status are required.");
        if (!VALID_STATUSES.includes(body.status)) return errorResponse(`status must be one of: ${VALID_STATUSES.join(", ")}`);

        const { data, error } = await db.from("support_tickets").update({ status: body.status }).eq("id", body.ticketId).select().single();
        if (error) return errorResponse(error.message, 500);

        await logAudit(db, { adminUserId: userId, role: roleName, action: "ticket.status_changed", entityType: "support_ticket", entityId: body.ticketId, details: { status: body.status } });
        return jsonResponse({ ticket: data });
      }

      case "listFaqs": {
        const { data, error } = await db.from("faq_items").select("*").order("category").order("priority", { ascending: false });
        if (error) return errorResponse(error.message, 500);
        return jsonResponse({ faqs: data });
      }

      case "createFaq": {
        if (!body.category || !body.question || !body.answer) return errorResponse("category, question and answer are required.");
        const { data, error } = await db
          .from("faq_items")
          .insert({ category: body.category, question: body.question, answer: body.answer, priority: body.priority ?? 0 })
          .select()
          .single();
        if (error) return errorResponse(error.message, 500);
        await logAudit(db, { adminUserId: userId, role: roleName, action: "faq.created", entityType: "faq_item", entityId: data.id });
        return jsonResponse({ faq: data });
      }

      case "updateFaq": {
        if (!body.id) return errorResponse("id is required.");
        const payload: Record<string, unknown> = {};
        for (const key of ["category", "question", "answer", "priority"]) if (body[key] !== undefined) payload[key] = body[key];
        const { data, error } = await db.from("faq_items").update(payload).eq("id", body.id).select().single();
        if (error) return errorResponse(error.message, 500);
        await logAudit(db, { adminUserId: userId, role: roleName, action: "faq.updated", entityType: "faq_item", entityId: body.id, details: payload });
        return jsonResponse({ faq: data });
      }

      case "deleteFaq": {
        if (!body.id) return errorResponse("id is required.");
        const { error } = await db.from("faq_items").delete().eq("id", body.id);
        if (error) return errorResponse(error.message, 500);
        await logAudit(db, { adminUserId: userId, role: roleName, action: "faq.deleted", entityType: "faq_item", entityId: body.id });
        return jsonResponse({ deleted: true });
      }

      default:
        return errorResponse(`Unknown action: ${action}`);
    }
  } catch (e) {
    return handleAdminError(e);
  }
});
