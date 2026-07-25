import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/empty_state_view.dart';
import '../../../../core/widgets/error_retry_view.dart';
import '../../../../core/widgets/loading_view.dart';
import '../../domain/delivery_repository.dart';
import '../delivery_providers.dart';

void showLiveStatusDialog(BuildContext context, String assignmentId) {
  showDialog(
    context: context,
    builder: (context) => _LiveStatusDialog(assignmentId: assignmentId),
  );
}

final _liveStatusProvider = FutureProvider.autoDispose.family<LiveStatusResult, String>((ref, assignmentId) {
  return ref.watch(deliveryRepositoryProvider).liveStatus(assignmentId);
});

class _LiveStatusDialog extends ConsumerWidget {
  final String assignmentId;

  const _LiveStatusDialog({required this.assignmentId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(_liveStatusProvider(assignmentId));

    return Dialog(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 480, maxHeight: 520),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Live delivery status', style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: 16),
              Expanded(
                child: async.when(
                  loading: () => const LoadingView(),
                  error: (e, _) => ErrorRetryView(
                    message: e.toString(),
                    onRetry: () => ref.invalidate(_liveStatusProvider(assignmentId)),
                  ),
                  data: (result) {
                    if (result.locations.isEmpty) {
                      return const EmptyStateView(message: 'No location updates yet.');
                    }
                    return ListView.separated(
                      itemCount: result.locations.length,
                      separatorBuilder: (context, index) => const Divider(height: 1),
                      itemBuilder: (context, index) {
                        final loc = result.locations[index];
                        return ListTile(
                          dense: true,
                          contentPadding: EdgeInsets.zero,
                          leading: const Icon(Icons.location_on_outlined),
                          title: Text(loc.lat != null && loc.lng != null ? '${loc.lat}, ${loc.lng}' : 'Unknown location'),
                          subtitle: Text(Formatters.dateTime(loc.recordedAt)),
                        );
                      },
                    );
                  },
                ),
              ),
              const SizedBox(height: 12),
              Align(
                alignment: Alignment.centerRight,
                child: TextButton(onPressed: () => Navigator.of(context).pop(), child: const Text('Close')),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
