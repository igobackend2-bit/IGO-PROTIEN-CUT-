import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'permissions_controller.dart';

/// Hides [child] entirely unless the current admin holds [permission] (or
/// any of [anyOf] when set). Falls back to [fallback] (defaults to nothing)
/// while permissions are still loading or when denied, so unauthorized
/// actions never even render rather than rendering disabled.
class PermissionGate extends ConsumerWidget {
  final String? permission;
  final List<String>? anyOf;
  final Widget child;
  final Widget fallback;

  const PermissionGate({
    super.key,
    this.permission,
    this.anyOf,
    required this.child,
    this.fallback = const SizedBox.shrink(),
  }) : assert(permission != null || anyOf != null);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final permissions = ref.watch(permissionsControllerProvider).value ?? const {};
    final allowed = anyOf != null
        ? anyOf!.any(permissions.contains)
        : permissions.contains(permission);
    return allowed ? child : fallback;
  }
}
