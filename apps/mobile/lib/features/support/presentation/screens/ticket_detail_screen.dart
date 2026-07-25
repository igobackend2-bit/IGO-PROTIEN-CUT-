import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../utils/app_colors.dart';
import '../../../../utils/id_format.dart';
import '../../../orders/presentation/screens/order_detail_screen.dart';
import '../../domain/entities/ticket_message.dart';
import '../providers/support_providers.dart';
import '../widgets/chat_bubble.dart';
import '../widgets/contact_options.dart';
import '../widgets/ticket_status_badge.dart';
import '../widgets/ticket_timeline.dart';

class TicketDetailScreen extends ConsumerStatefulWidget {
  final String ticketId;
  const TicketDetailScreen({super.key, required this.ticketId});

  @override
  ConsumerState<TicketDetailScreen> createState() => _TicketDetailScreenState();
}

class _TicketDetailScreenState extends ConsumerState<TicketDetailScreen> {
  final _controller = TextEditingController();
  final _scrollController = ScrollController();
  bool _showTimeline = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(ticketComposerProvider(widget.ticketId).notifier).markRead();
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    if (!_scrollController.hasClients) return;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!_scrollController.hasClients) return;
      _scrollController.animateTo(_scrollController.position.maxScrollExtent, duration: const Duration(milliseconds: 250), curve: Curves.easeOut);
    });
  }

  Future<void> _send() async {
    final text = _controller.text;
    if (text.trim().isEmpty) return;
    _controller.clear();
    await ref.read(ticketComposerProvider(widget.ticketId).notifier).send(text);
    _scrollToBottom();
  }

  Future<void> _handleClose() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text('Close this ticket?', style: GoogleFonts.outfit(fontWeight: FontWeight.w700)),
        content: Text("You won't be able to reply once it's closed. You can always raise a new ticket.", style: GoogleFonts.outfit(fontSize: 13)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: Text('Close Ticket', style: GoogleFonts.outfit(color: AppColors.error, fontWeight: FontWeight.w700))),
        ],
      ),
    );
    if (confirmed != true) return;
    final ok = await ref.read(ticketComposerProvider(widget.ticketId).notifier).close();
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(ok ? 'Ticket closed.' : 'Could not close this ticket.', style: GoogleFonts.outfit()), behavior: SnackBarBehavior.floating),
    );
  }

  @override
  Widget build(BuildContext context) {
    final ticketAsync = ref.watch(ticketStreamProvider(widget.ticketId));
    final messagesAsync = ref.watch(ticketMessagesStreamProvider(widget.ticketId));
    final composer = ref.watch(ticketComposerProvider(widget.ticketId));

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        titleSpacing: 0,
        title: ticketAsync.when(
          data: (ticket) => ticket == null
              ? Text('Ticket', style: GoogleFonts.outfit(fontWeight: FontWeight.w700, color: Colors.white))
              : Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(ticket.subject, style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.w700, color: Colors.white), maxLines: 1, overflow: TextOverflow.ellipsis),
                    Text(ticket.category.label, style: GoogleFonts.outfit(fontSize: 11, color: Colors.white70)),
                  ],
                ),
          loading: () => Text('Ticket', style: GoogleFonts.outfit(fontWeight: FontWeight.w700, color: Colors.white)),
          error: (_, __) => Text('Ticket', style: GoogleFonts.outfit(fontWeight: FontWeight.w700, color: Colors.white)),
        ),
        backgroundColor: AppColors.primary,
        elevation: 0,
        actions: [
          IconButton(icon: const Icon(Icons.timeline_rounded, color: Colors.white), onPressed: () => setState(() => _showTimeline = !_showTimeline)),
          ticketAsync.maybeWhen(
            data: (ticket) => ticket != null && ticket.canClose
                ? IconButton(icon: const Icon(Icons.close_rounded, color: Colors.white), tooltip: 'Close Ticket', onPressed: _handleClose)
                : const SizedBox.shrink(),
            orElse: () => const SizedBox.shrink(),
          ),
        ],
      ),
      body: ticketAsync.when(
        data: (ticket) {
          if (ticket == null) return Center(child: Text('Ticket not found.', style: GoogleFonts.outfit()));

          return Column(
            children: [
              if (ticket.orderId != null || _showTimeline)
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
                  child: Column(
                    children: [
                      if (ticket.orderId != null)
                        InkWell(
                          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => OrderDetailScreen(orderId: ticket.orderId!))),
                          borderRadius: BorderRadius.circular(12),
                          child: Container(
                            width: double.infinity,
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                            decoration: BoxDecoration(color: AppColors.surfaceLight, borderRadius: BorderRadius.circular(12)),
                            child: Row(
                              children: [
                                const Icon(Icons.receipt_long_rounded, size: 16, color: AppColors.primary),
                                const SizedBox(width: 8),
                                Expanded(child: Text('Regarding Order #${shortId(ticket.orderId!)}', style: GoogleFonts.outfit(fontSize: 12.5, fontWeight: FontWeight.w700, color: AppColors.primary))),
                                const Icon(Icons.chevron_right_rounded, size: 18, color: AppColors.primary),
                              ],
                            ),
                          ),
                        ),
                      if (_showTimeline) ...[
                        const SizedBox(height: 10),
                        TicketTimeline(status: ticket.status, isReturn: ticket.isReturn),
                      ],
                      const SizedBox(height: 10),
                    ],
                  ),
                ),
              Expanded(
                child: messagesAsync.when(
                  data: (messages) {
                    final all = <TicketMessage>[...messages, ...composer.optimistic];
                    if (all.isEmpty) {
                      return Center(child: Text('Say hello — a support agent will reply here.', style: GoogleFonts.outfit(fontSize: 12.5, color: AppColors.textHint)));
                    }
                    _scrollToBottom();
                    return ListView.builder(
                      controller: _scrollController,
                      padding: const EdgeInsets.all(16),
                      itemCount: all.length,
                      itemBuilder: (context, index) {
                        final message = all[index];
                        final isPending = index >= messages.length;
                        return ChatBubble(message: message, isPending: isPending);
                      },
                    );
                  },
                  loading: () => const Center(child: CircularProgressIndicator(color: AppColors.primary)),
                  error: (_, __) => Center(child: Text("Couldn't load messages.", style: GoogleFonts.outfit(fontSize: 12.5, color: AppColors.textSecondary))),
                ),
              ),
              if (ticket.canReply)
                _Composer(controller: _controller, isSending: composer.isSending, onSend: _send)
              else
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  color: Colors.white,
                  child: Column(
                    children: [
                      TicketStatusBadge(status: ticket.status, isReturn: ticket.isReturn),
                      const SizedBox(height: 10),
                      Text('This ticket is closed. Need more help?', style: GoogleFonts.outfit(fontSize: 12, color: AppColors.textSecondary)),
                      const SizedBox(height: 10),
                      ContactOptionsRow(orderId: ticket.orderId),
                    ],
                  ),
                ),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator(color: AppColors.primary)),
        error: (_, __) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.wifi_off_rounded, size: 48, color: AppColors.error),
              const SizedBox(height: 12),
              Text("Couldn't load this ticket.", style: GoogleFonts.outfit(fontSize: 13, color: AppColors.textSecondary)),
              const SizedBox(height: 12),
              TextButton(onPressed: () => ref.invalidate(ticketStreamProvider(widget.ticketId)), child: const Text('Retry')),
            ],
          ),
        ),
      ),
    );
  }
}

class _Composer extends StatelessWidget {
  final TextEditingController controller;
  final bool isSending;
  final VoidCallback onSend;
  const _Composer({required this.controller, required this.isSending, required this.onSend});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Container(
        padding: const EdgeInsets.fromLTRB(12, 10, 12, 10),
        decoration: BoxDecoration(color: Colors.white, boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 8, offset: const Offset(0, -2))]),
        child: Row(
          children: [
            Expanded(
              child: TextField(
                controller: controller,
                minLines: 1,
                maxLines: 4,
                textCapitalization: TextCapitalization.sentences,
                style: GoogleFonts.outfit(fontSize: 13.5),
                decoration: InputDecoration(
                  hintText: 'Type a message…',
                  hintStyle: GoogleFonts.outfit(fontSize: 13, color: AppColors.textHint),
                  filled: true,
                  fillColor: AppColors.surfaceLight,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(24), borderSide: BorderSide.none),
                ),
              ),
            ),
            const SizedBox(width: 8),
            GestureDetector(
              onTap: isSending ? null : onSend,
              child: Container(
                width: 42,
                height: 42,
                decoration: const BoxDecoration(gradient: AppColors.primaryGradient, shape: BoxShape.circle),
                child: isSending
                    ? const Padding(padding: EdgeInsets.all(11), child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Icon(Icons.send_rounded, color: Colors.white, size: 18),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
