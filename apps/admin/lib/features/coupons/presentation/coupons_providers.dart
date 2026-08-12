import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/providers/core_providers.dart';
import '../data/coupons_repository_impl.dart';
import '../domain/coupons_repository.dart';

final couponsRepositoryProvider = Provider<CouponsRepository>((ref) {
  return CouponsRepositoryImpl(ref.watch(edgeFunctionClientProvider));
});
