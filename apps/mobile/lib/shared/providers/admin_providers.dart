import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../services/admin_service.dart';

/// Riverpod entry point for [AdminService] — proves the Phase 18 backend is
/// "Riverpod compatible" as required. Phase 19 adds a full repository/
/// provider/screen layer and `features/admin/` module on top of this; the
/// only consumer today is the narrow product-photo-upload screen added
/// after Phase 18, which needs a real "am I an admin" check to gate itself.
final adminServiceProvider = Provider<AdminService>((ref) => AdminService());

/// Self-check only — reads the caller's own `admin_users` row, which RLS
/// already allows (see phase18_admin.sql). Returns false for any regular
/// customer with no admin_users row at all, so this is safe to use for
/// gating whether an admin-only entry point even appears in the UI.
final isAdminProvider = FutureProvider.autoDispose<bool>((ref) async {
  final user = Supabase.instance.client.auth.currentUser;
  if (user == null) return false;
  try {
    final row = await Supabase.instance.client
        .from('admin_users')
        .select('is_active')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();
    return row != null;
  } catch (_) {
    return false;
  }
});
