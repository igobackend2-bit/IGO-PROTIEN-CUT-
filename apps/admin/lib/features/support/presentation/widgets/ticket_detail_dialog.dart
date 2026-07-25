import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/error_retry_view.dart';
import '../../../../core/widgets/loading_view.dart';
import '../../domain/support_repository.dart';
import '../../domain/support_ticket.dart';
import '../support_providers.dart';

final _ticketDetailProvider = FutureProvider.autoDispose.family<TicketDetail, String>((ref, ticketId) {
  return ref.watch(supportRepositoryProvider).getTicket(ticketId);
});

void showTicketDetailDialog(BuildContext context, String ticketId, {VoidCallback? onChanged}) {
  showDialog(
    context: context,
    builder: (context) => _TicketDetailDialog(ticketId: ticketId, onChanged: onChanged),
  );
}

class _TicketDetailDialog extends ConsumerStatefulWidget {
  final String ticketId;
  final VoidCallback? onChanged;

  const _TicketDetailDialog({required this.ticketId, this.onChanged});

  @override
  ConsumerState<_TicketDetailDialog> createState() => _TicketDetailDialogState();
}

class _TicketDetailDialogState extends ConsumerState<_TicketDetailDialog> {
  final _replyController = TextEditingController();
  bool _sending = false;

  @override
  void dispose() {
    _replyController.dispose();
    super.dispose();
  }

  Future<void> _sendReply() async {
    final text = _replyController.text.trim();
    if (text.isEmpty) return;
    setState(() => _sending = true);
    try {
      await ref.read(supportRepositoryProvider).reply(ticketId: widget.ticketId, message: text);
      _replyController.clear();
      ref.invalidate(_ticketDetailProvider(widget.ticketId));
      widget.onChanged?.call();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  Future<void> _changeStatus(String status) async {
    try {
      await ref.read(supportRepositoryProvider).setStatus(widget.ticketId, status);
      ref.invalidate(_ticketDetailProvider(widget.ticketId));
      widget.onChanged?.call();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    }
  }

  @override
  Widget build(BuildContext context) {
    final async = ref.watch(_ticketDetailProvider(widget.ticketId));

    return Dialog(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 560, maxHeight: 660),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: async.when(
            loading: () => const LoadingView(),
            error: (e, _) => ErrorRetryView(
              message: e.toString(),
              onRetry: () => ref.invalidate(_ticketDetailProvider(widget.ticketId)),
            ),
            data: (detail) => _buildContent(context, detail),
          ),
        ),
      ),
    );
  }

  Widget _buildContent(BuildContext context, TicketDetail detail) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Text(detail.ticket.subject ?? 'Support ticket', style: Theme.of(context).textTheme.titleLarge),
            ),
            DropdownButton<String>(
              value: detail.ticket.status,
              items: [for (final s in TicketStatus.all) DropdownMenuItem(value: s, child: Text(s))],
              onChanged: (v) {
                if (v != null) _changeStatus(v);
              },
            ),
          ],
        ),
        Text(
          '${detail.ticket.customerName ?? 'Customer'} · ${detail.ticket.category ?? 'General'}',
          style: Theme.of(context).textTheme.bodySmall,
        ),
        const SizedBox(height: 16),
        Expanded(
          child: ListView.builder(
            itemCount: detail.messages.length,
            itemBuilder: (context, index) {
              final message = detail.messages[index];
              final isAgent = message.sender == 'agent';
              return Align(
                alignment: isAgent ? Alignment.centerRight : Alignment.centerLeft,
                child: Container(
                  margin: const EdgeInsets.symmetric(vertical: 4),
                  padding: const EdgeInsets.all(10),
                  constraints: const BoxConstraints(maxWidth: 360),
                  decoration: BoxDecoration(
                    color: isAgent
                        ? Theme.of(context).colorScheme.primaryContainer
                        : Theme.of(context).colorScheme.surfaceContainerHighest,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(message.message),
                      const SizedBox(height: 4),
                      Text(Formatters.dateTime(message.createdAt), style: Theme.of(context).textTheme.labelSmall),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: TextField(
                controller: _replyController,
                decoration: const InputDecoration(hintText: 'Type a reply…'),
                onSubmitted: (_) => _sendReply(),
              ),
            ),
            const SizedBox(width: 8),
            IconButton.filled(
              onPressed: _sending ? null : _sendReply,
              icon: _sending
                  ? const SizedBox(height: 16, width: 16, child: CircularProgressIndicator(strokeWidth: 2))
                  : const Icon(Icons.send),
            ),
          ],
        ),
      ],
    );
  }
}
