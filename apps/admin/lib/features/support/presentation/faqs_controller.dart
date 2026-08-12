import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../domain/support_ticket.dart';
import 'support_providers.dart';

class FaqsController extends AsyncNotifier<List<Faq>> {
  @override
  Future<List<Faq>> build() => ref.watch(supportRepositoryProvider).listFaqs();

  Future<void> refresh() async {
    ref.invalidateSelf();
    await future;
  }

  Future<void> delete(String id) async {
    await ref.read(supportRepositoryProvider).deleteFaq(id);
    await refresh();
  }
}

final faqsControllerProvider = AsyncNotifierProvider<FaqsController, List<Faq>>(FaqsController.new);
