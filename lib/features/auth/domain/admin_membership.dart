/// The current user's row in `admin_users` (see
/// supabase/migrations/phase18_admin.sql) — presence + `isActive` is the
/// entire gate for whether a signed-in Supabase user may enter the admin
/// shell. Role name/permissions are resolved separately via the
/// `admin_has_permission` RPC (PermissionsController), since `admin_roles`
/// itself isn't client-readable.
class AdminMembership {
  final String userId;
  final String roleId;
  final bool isActive;

  const AdminMembership({
    required this.userId,
    required this.roleId,
    required this.isActive,
  });

  factory AdminMembership.fromJson(Map<String, dynamic> json) => AdminMembership(
        userId: json['user_id'] as String,
        roleId: json['role_id'] as String,
        isActive: json['is_active'] as bool? ?? false,
      );
}
