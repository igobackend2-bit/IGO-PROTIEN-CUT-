// Shared RBAC + audit-log helpers for every admin-* Edge Function. This is
// the ONE place permission gating and audit logging are implemented — each
// admin-* function calls requireAdmin() then logAudit() rather than
// re-deriving either, per the "no duplicated business logic" mandate.
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serviceClient, requireUser } from "./client.ts";
import { errorResponse } from "./cors.ts";

export class AdminAuthError extends Error {
  status: number;
  constructor(message: string, status = 403) {
    super(message);
    this.status = status;
  }
}

export interface AdminContext {
  db: SupabaseClient;
  userId: string;
  roleName: string;
}

/**
 * Verifies the caller is authenticated AND holds the given permission,
 * resolved via the single `admin_has_permission` Postgres function (the
 * same one available to any future RLS policy) rather than re-implementing
 * the role→permission lookup here.
 */
export async function requireAdmin(req: Request, permission: string): Promise<AdminContext> {
  const user = await requireUser(req);
  if (!user) throw new AdminAuthError("Not authenticated.", 401);

  const db = serviceClient();

  const { data: allowed, error } = await db.rpc("admin_has_permission", {
    p_user_id: user.id,
    p_permission: permission,
  });
  if (error) throw new AdminAuthError(error.message, 500);
  if (!allowed) throw new AdminAuthError("You don't have permission to do this.", 403);

  const { data: adminRow } = await db
    .from("admin_users")
    .select("admin_roles ( name )")
    .eq("user_id", user.id)
    .maybeSingle();
  const roleName = (adminRow?.admin_roles as unknown as { name?: string } | null)?.name ?? "unknown";

  return { db, userId: user.id, roleName };
}

export async function logAudit(
  db: SupabaseClient,
  params: {
    adminUserId: string;
    role: string;
    action: string;
    entityType: string;
    entityId?: string | null;
    details?: Record<string, unknown>;
  },
) {
  await db.from("audit_logs").insert({
    admin_user_id: params.adminUserId,
    role: params.role,
    action: params.action,
    entity_type: params.entityType,
    entity_id: params.entityId ?? null,
    details: params.details ?? {},
  });
}

/**
 * Non-throwing admin check for functions that are primarily customer-
 * facing (Phase 17's delivery functions) but also need to let a staff
 * member act on someone else's order — e.g. assigning/re-estimating a
 * delivery from the future Admin Dashboard. Returns false (never throws)
 * so callers can fall back to their normal ownership check.
 */
export async function isCallerAdmin(db: SupabaseClient, userId: string, anyOfPermissions: string[]): Promise<boolean> {
  for (const permission of anyOfPermissions) {
    const { data } = await db.rpc("admin_has_permission", { p_user_id: userId, p_permission: permission });
    if (data === true) return true;
  }
  return false;
}

/**
 * Calls another Edge Function, forwarding the ORIGINAL caller's own
 * Authorization header — not the service role key — so the callee's own
 * auth/ownership logic runs exactly as it would for a direct call. This is
 * how admin-orders/admin-delivery reuse assign-delivery/estimate-eta
 * verbatim instead of re-implementing partner assignment or ETA math.
 */
export async function invokeEdgeFunction(req: Request, name: string, body: unknown) {
  const url = `${Deno.env.get("SUPABASE_URL")}/functions/v1/${name}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: req.headers.get("Authorization") ?? "",
      apikey: Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new AdminAuthError(data?.error ?? `${name} failed.`, res.status);
  return data;
}

/** Uniform error → Response mapping shared by every admin-* function. */
export function handleAdminError(e: unknown): Response {
  if (e instanceof AdminAuthError) return errorResponse(e.message, e.status);
  return errorResponse(e instanceof Error ? e.message : "Unexpected error.", 500);
}
