// admin-users
//
// Customer directory (read-only lookups over `profiles`/`orders`) plus
// RBAC administration — granting/revoking admin roles is deliberately
// gated behind `roles.manage`, which only `super_admin` and `admin` hold
// (see phase18_admin.sql's seed grants), so operational staff can view
// customers but never make themselves or anyone else an admin.
import { corsHeaders, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { requireAdmin, logAudit, handleAdminError } from "../_shared/admin.ts";

const PERMISSION_BY_ACTION: Record<string, string> = {
  list: "users.view",
  get: "users.view",
  listRoles: "roles.manage",
  listAdmins: "roles.manage",
  grantRole: "roles.manage",
  revokeRole: "roles.manage",
};

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
        let query = db.from("profiles").select("*", { count: "exact" }).order("created_at", { ascending: false });
        if (body.search) query = query.or(`full_name.ilike.%${body.search}%,phone_number.ilike.%${body.search}%`);
        const limit = Math.min(Number(body.limit) || 50, 200);
        const offset = Number(body.offset) || 0;
        const { data, error, count } = await query.range(offset, offset + limit - 1);
        if (error) return errorResponse(error.message, 500);
        return jsonResponse({ users: data, total: count });
      }

      case "get": {
        if (!body.userId) return errorResponse("userId is required.");
        const { data: profile, error: profileError } = await db.from("profiles").select("*").eq("id", body.userId).maybeSingle();
        if (profileError) return errorResponse(profileError.message, 500);
        if (!profile) return errorResponse("User not found.", 404);

        const { data: authUser } = await db.auth.admin.getUserById(body.userId);
        const { data: orders } = await db.from("orders").select("id, total_price, status, created_at").eq("user_id", body.userId).order("created_at", { ascending: false });
        const totalSpent = (orders ?? []).filter((o) => o.status === "Delivered").reduce((sum, o) => sum + Number(o.total_price), 0);

        return jsonResponse({
          profile,
          email: authUser?.user?.email ?? null,
          orderCount: orders?.length ?? 0,
          totalSpent,
          recentOrders: (orders ?? []).slice(0, 10),
        });
      }

      case "listRoles": {
        const { data: roles, error } = await db.from("admin_roles").select("*, admin_role_permissions ( admin_permissions ( code, description ) )").order("name");
        if (error) return errorResponse(error.message, 500);
        return jsonResponse({ roles });
      }

      case "listAdmins": {
        const { data, error } = await db
          .from("admin_users")
          .select("user_id, is_active, created_at, admin_roles ( id, name )")
          .order("created_at", { ascending: false });
        if (error) return errorResponse(error.message, 500);
        return jsonResponse({ admins: data });
      }

      case "grantRole": {
        if (!body.userId || !body.roleName) return errorResponse("userId and roleName are required.");
        const { data: role, error: roleError } = await db.from("admin_roles").select("id").eq("name", body.roleName).maybeSingle();
        if (roleError) return errorResponse(roleError.message, 500);
        if (!role) return errorResponse(`Unknown role: ${body.roleName}`, 400);

        const { data, error } = await db
          .from("admin_users")
          .upsert({ user_id: body.userId, role_id: role.id, is_active: true, created_by: userId }, { onConflict: "user_id" })
          .select("*, admin_roles ( name )")
          .single();
        if (error) return errorResponse(error.message, 500);

        await logAudit(db, { adminUserId: userId, role: roleName, action: "admin_role.granted", entityType: "admin_user", entityId: body.userId, details: { roleName: body.roleName } });
        return jsonResponse({ admin: data });
      }

      case "revokeRole": {
        if (!body.userId) return errorResponse("userId is required.");
        if (body.userId === userId) return errorResponse("You can't revoke your own admin access.", 400);
        const { data, error } = await db.from("admin_users").update({ is_active: false }).eq("user_id", body.userId).select().single();
        if (error) return errorResponse(error.message, 500);
        await logAudit(db, { adminUserId: userId, role: roleName, action: "admin_role.revoked", entityType: "admin_user", entityId: body.userId });
        return jsonResponse({ admin: data });
      }

      default:
        return errorResponse(`Unknown action: ${action}`);
    }
  } catch (e) {
    return handleAdminError(e);
  }
});
