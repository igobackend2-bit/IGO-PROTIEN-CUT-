import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/confirm_dialog.dart';
import '../../../../core/widgets/empty_state_view.dart';
import '../../../../core/widgets/error_retry_view.dart';
import '../../../../core/widgets/loading_view.dart';
import '../../../products/domain/category.dart';
import '../../../products/presentation/categories_controller.dart';
import '../../domain/notification_entry.dart';
import '../notifications_providers.dart';

enum _TargetMode { broadcast, user, category }

class NotificationsScreen extends ConsumerStatefulWidget {
  const NotificationsScreen({super.key});

  @override
  ConsumerState<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends ConsumerState<NotificationsScreen> {
  final _formKey = GlobalKey<FormState>();
  final _title = TextEditingController();
  final _message = TextEditingController();
  final _userId = TextEditingController();
  _TargetMode _mode = _TargetMode.broadcast;
  String? _category;
  bool _sending = false;

  @override
  void dispose() {
    _title.dispose();
    _message.dispose();
    _userId.dispose();
    super.dispose();
  }

  Future<void> _send() async {
    if (!_formKey.currentState!.validate()) return;
    if (_mode == _TargetMode.category && _category == null) return;

    final confirmed = await showConfirmDialog(
      context,
      title: 'Send notification?',
      message: switch (_mode) {
        _TargetMode.broadcast => 'This sends to every customer. Continue?',
        _TargetMode.user => 'Send to user "${_userId.text.trim()}"?',
        _TargetMode.category => 'Send to customers who bought from "$_category"?',
      },
    );
    if (!confirmed) return;

    setState(() => _sending = true);
    try {
      final repo = ref.read(notificationsRepositoryProvider);
      int? sent;
      switch (_mode) {
        case _TargetMode.broadcast:
          sent = await repo.broadcast(title: _title.text.trim(), message: _message.text.trim());
        case _TargetMode.user:
          await repo.targetUser(
            userId: _userId.text.trim(),
            title: _title.text.trim(),
            message: _message.text.trim(),
          );
        case _TargetMode.category:
          sent = await repo.targetCategory(
            category: _category!,
            title: _title.text.trim(),
            message: _message.text.trim(),
          );
      }
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(sent != null ? 'Sent to $sent recipient(s).' : 'Sent.')),
        );
        _title.clear();
        _message.clear();
        _userId.clear();
      }
      ref.read(notificationsHistoryControllerProvider.notifier).refresh();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final categories = ref.watch(categoriesControllerProvider).value ?? const [];
    final historyAsync = ref.watch(notificationsHistoryControllerProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Notifications', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w700)),
        const SizedBox(height: 16),
        Expanded(
          child: LayoutBuilder(
            builder: (context, constraints) {
              final stacked = constraints.maxWidth < 900;
              final compose = _composeCard(context, categories);
              final history = _historyCard(context, historyAsync);
              if (stacked) {
                return SingleChildScrollView(
                  child: Column(children: [compose, const SizedBox(height: 16), SizedBox(height: 400, child: history)]),
                );
              }
              return Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(child: compose),
                  const SizedBox(width: 16),
                  Expanded(child: history),
                ],
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _composeCard(BuildContext context, List<ProductCategory> categories) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Compose', style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 16),
              SegmentedButton<_TargetMode>(
                segments: const [
                  ButtonSegment(value: _TargetMode.broadcast, label: Text('Broadcast')),
                  ButtonSegment(value: _TargetMode.user, label: Text('User')),
                  ButtonSegment(value: _TargetMode.category, label: Text('Category')),
                ],
                selected: {_mode},
                onSelectionChanged: (s) => setState(() => _mode = s.first),
              ),
              const SizedBox(height: 16),
              if (_mode == _TargetMode.user)
                Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: TextFormField(
                    controller: _userId,
                    decoration: const InputDecoration(labelText: 'Customer user ID'),
                    validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
                  ),
                ),
              if (_mode == _TargetMode.category)
                Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: DropdownButtonFormField<String>(
                    initialValue: _category,
                    decoration: const InputDecoration(labelText: 'Category'),
                    items: [for (final c in categories) DropdownMenuItem(value: c.name, child: Text(c.name))],
                    onChanged: (v) => setState(() => _category = v),
                  ),
                ),
              TextFormField(
                controller: _title,
                decoration: const InputDecoration(labelText: 'Title'),
                validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _message,
                maxLines: 4,
                decoration: const InputDecoration(labelText: 'Message'),
                validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
              ),
              const SizedBox(height: 16),
              FilledButton.icon(
                onPressed: _sending ? null : _send,
                icon: _sending
                    ? const SizedBox(height: 16, width: 16, child: CircularProgressIndicator(strokeWidth: 2))
                    : const Icon(Icons.send),
                label: const Text('Send'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _historyCard(BuildContext context, AsyncValue<List<NotificationEntry>> historyAsync) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Recent sends', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 12),
            Expanded(
              child: historyAsync.when(
                loading: () => const LoadingView(),
                error: (e, _) => ErrorRetryView(
                  message: e.toString(),
                  onRetry: () => ref.read(notificationsHistoryControllerProvider.notifier).refresh(),
                ),
                data: (entries) {
                  if (entries.isEmpty) return const EmptyStateView(message: 'No notifications sent yet.');
                  return ListView.separated(
                    itemCount: entries.length,
                    separatorBuilder: (context, index) => const Divider(height: 1),
                    itemBuilder: (context, index) {
                      final entry = entries[index];
                      return ListTile(
                        dense: true,
                        contentPadding: EdgeInsets.zero,
                        title: Text(entry.title),
                        subtitle: Text(
                          entry.message,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        trailing: Text(Formatters.dateTime(entry.createdAt)),
                      );
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
