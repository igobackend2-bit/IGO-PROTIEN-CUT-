import 'package:flutter_test/flutter_test.dart';

import 'package:protein_cuts_admin/core/permissions/permission_codes.dart';

void main() {
  test('permission codes match the seeded Phase 18 RBAC set', () {
    expect(PermissionCodes.all.length, 17);
    expect(PermissionCodes.all.toSet().length, 17);
  });
}
