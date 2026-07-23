import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../services/admin_service.dart';

/// Riverpod entry point for [AdminService] — proves the Phase 18 backend is
/// "Riverpod compatible" as required, without building the repository/
/// provider/screen layers a real Admin Dashboard would need. Phase 19 adds
/// those (and a proper `features/admin/` module) on top of this; nothing
/// in the current app reads this provider.
final adminServiceProvider = Provider<AdminService>((ref) => AdminService());
