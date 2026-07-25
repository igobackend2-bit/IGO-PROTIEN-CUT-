class RolePermission {
  final String code;
  final String? description;

  const RolePermission({required this.code, this.description});

  factory RolePermission.fromJson(Map<String, dynamic> json) => RolePermission(
        code: json['code']?.toString() ?? '',
        description: json['description']?.toString(),
      );
}

class AdminRole {
  final String id;
  final String name;
  final String? description;
  final List<RolePermission> permissions;

  const AdminRole({
    required this.id,
    required this.name,
    this.description,
    required this.permissions,
  });

  factory AdminRole.fromJson(Map<String, dynamic> json) {
    final grants = (json['admin_role_permissions'] as List?) ?? const [];
    final permissions = grants
        .map((g) {
          final permission = g is Map ? g['admin_permissions'] : null;
          return permission is Map ? RolePermission.fromJson(Map<String, dynamic>.from(permission)) : null;
        })
        .whereType<RolePermission>()
        .toList();
    return AdminRole(
      id: json['id'].toString(),
      name: json['name']?.toString() ?? '',
      description: json['description']?.toString(),
      permissions: permissions,
    );
  }
}

class AdminUserEntry {
  final String userId;
  final bool isActive;
  final DateTime? createdAt;
  final String? roleId;
  final String? roleName;

  const AdminUserEntry({
    required this.userId,
    required this.isActive,
    this.createdAt,
    this.roleId,
    this.roleName,
  });

  factory AdminUserEntry.fromJson(Map<String, dynamic> json) {
    final role = json['admin_roles'];
    return AdminUserEntry(
      userId: json['user_id']?.toString() ?? '',
      isActive: json['is_active'] as bool? ?? false,
      createdAt: DateTime.tryParse(json['created_at']?.toString() ?? ''),
      roleId: role is Map ? role['id']?.toString() : null,
      roleName: role is Map ? role['name']?.toString() : null,
    );
  }
}
