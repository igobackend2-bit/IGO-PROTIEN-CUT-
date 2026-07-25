import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

import '../../../../models/subscription_schedule.dart';
import '../../../../utils/app_colors.dart';
import '../../../address/presentation/providers/address_providers.dart';
import '../../domain/entities/subscription.dart';
import '../../domain/entities/subscription_history_entry.dart';
import '../providers/subscription_providers.dart';
import '../widgets/schedule_picker.dart';
import '../widgets/subscription_states.dart';

class SubscriptionDetailScreen extends ConsumerStatefulWidget {
  final String subscriptionId;
  const SubscriptionDetailScreen({super.key, required this.subscriptionId});

  @override
  ConsumerState<SubscriptionDetailScreen> createState() => _SubscriptionDetailScreenState();
}

class _SubscriptionDetailScreenState extends ConsumerState<SubscriptionDetailScreen> {
  Subscription? _subscription;
  List<SubscriptionHistoryEntry> _history = const [];
  bool _isLoading = true;
  Object? _error;
  bool _isActing = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final repository = ref.read(subscriptionRepositoryProvider);
      final results = await Future.wait([
        repository.fetchSubscriptionById(widget.subscriptionId),
        repository.fetchHistory(widget.subscriptionId),
      ]);
      if (!mounted) return;
      setState(() {
        _subscription = results[0] as Subscription?;
        _history = results[1] as List<SubscriptionHistoryEntry>;
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _error = e;
      });
    }
  }

  Future<void> _runAction(Future<void> Function() action, {String? successMessage}) async {
    setState(() => _isActing = true);
    try {
      await action();
      ref.invalidate(subscriptionListProvider);
      await _load();
      if (!mounted) return;
      if (successMessage != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(successMessage, style: GoogleFonts.outfit()), backgroundColor: AppColors.success, behavior: SnackBarBehavior.floating),
        );
      }
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Something went wrong. Please try again.', style: GoogleFonts.outfit()), backgroundColor: AppColors.error, behavior: SnackBarBehavior.floating),
      );
    } finally {
      if (mounted) setState(() => _isActing = false);
    }
  }

  Future<void> _handlePause() => _runAction(
        () => ref.read(subscriptionRepositoryProvider).pause(_subscription!.id),
        successMessage: 'Subscription paused.',
      );

  Future<void> _handleResume() => _runAction(
        () => ref.read(subscriptionRepositoryProvider).resume(_subscription!.id, nextDelivery: DateTime.now().add(const Duration(days: 1))),
        successMessage: 'Subscription resumed.',
      );

  Future<void> _handleSkip() => _runAction(
        () => ref.read(subscriptionRepositoryProvider).skipNextDelivery(_subscription!),
        successMessage: 'Next delivery skipped.',
      );

  Future<void> _handleCancel() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text('Cancel Subscription?', style: GoogleFonts.outfit(fontWeight: FontWeight.w700)),
        content: Text("This can't be undone — you'll need to create a new subscription to resume.", style: GoogleFonts.outfit(color: AppColors.textSecondary)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Keep Subscription')),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: Text('Cancel It', style: GoogleFonts.outfit(color: AppColors.error, fontWeight: FontWeight.w700))),
        ],
      ),
    );
    if (confirmed != true) return;
    await _runAction(() => ref.read(subscriptionRepositoryProvider).cancel(_subscription!.id), successMessage: 'Subscription cancelled.');
  }

  Future<void> _handleEditQuantity() async {
    final controller = TextEditingController(text: '${_subscription!.quantity}');
    final result = await showDialog<int>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text('Edit Quantity', style: GoogleFonts.outfit(fontWeight: FontWeight.w700)),
        content: TextField(controller: controller, keyboardType: TextInputType.number, autofocus: true),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          TextButton(
            onPressed: () {
              final value = int.tryParse(controller.text);
              Navigator.pop(ctx, value != null && value > 0 ? value : null);
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
    if (result == null) return;
    await _runAction(() => ref.read(subscriptionRepositoryProvider).updateSubscription(_subscription!.id, quantity: result), successMessage: 'Quantity updated.');
  }

  Future<void> _handleChangeAddress() async {
    final addresses = ref.read(addressListProvider).addresses;
    if (addresses.isEmpty) return;
    final result = await showModalBottomSheet<String>(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Change Delivery Address', style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w800)),
              const SizedBox(height: 12),
              ...addresses.map((a) => ListTile(
                    contentPadding: EdgeInsets.zero,
                    title: Text('${a.addressType.label} • ${a.fullName}', style: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.w700)),
                    subtitle: Text(a.formattedOneLine, style: GoogleFonts.outfit(fontSize: 11, color: AppColors.textSecondary), maxLines: 2, overflow: TextOverflow.ellipsis),
                    onTap: () => Navigator.pop(ctx, a.id),
                  )),
            ],
          ),
        ),
      ),
    );
    if (result == null) return;
    await _runAction(() => ref.read(subscriptionRepositoryProvider).updateSubscription(_subscription!.id, addressId: result), successMessage: 'Address updated.');
  }

  Future<void> _handleChangeSlot() async {
    final result = await showModalBottomSheet<String>(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Change Delivery Slot', style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w800)),
              const SizedBox(height: 12),
              ...subscriptionDeliverySlots.map((slot) => ListTile(
                    contentPadding: EdgeInsets.zero,
                    title: Text(slot, style: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.w600)),
                    trailing: slot == _subscription!.deliverySlot ? const Icon(Icons.check_rounded, color: AppColors.primary) : null,
                    onTap: () => Navigator.pop(ctx, slot),
                  )),
            ],
          ),
        ),
      ),
    );
    if (result == null) return;
    await _runAction(() => ref.read(subscriptionRepositoryProvider).updateSubscription(_subscription!.id, deliverySlot: result), successMessage: 'Delivery slot updated.');
  }

  Future<void> _handleEditSchedule() async {
    final current = _subscription!;
    var config = ScheduleConfig(scheduleType: current.scheduleType, interval: current.interval, weekdays: current.weekdays, startDate: current.nextDelivery);
    final result = await showModalBottomSheet<ScheduleConfig>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom, left: 20, right: 20, top: 20),
        child: SafeArea(
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Edit Schedule', style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w800)),
                const SizedBox(height: 16),
                SchedulePicker(initial: config, onChanged: (c) => config = c),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: () => Navigator.pop(ctx, config),
                    style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
                    child: Text('Save Schedule', style: GoogleFonts.outfit(fontWeight: FontWeight.w700)),
                  ),
                ),
                const SizedBox(height: 12),
              ],
            ),
          ),
        ),
      ),
    );
    if (result == null) return;
    await _runAction(
      () => ref.read(subscriptionRepositoryProvider).updateSubscription(
            current.id,
            scheduleType: result.scheduleType,
            weekdays: result.scheduleType == ScheduleType.custom ? result.weekdays : null,
            interval: result.interval,
            nextDelivery: result.startDate,
          ),
      successMessage: 'Schedule updated.',
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Subscription', style: GoogleFonts.outfit(fontWeight: FontWeight.w700, color: Colors.white)),
        backgroundColor: AppColors.primary,
        elevation: 0,
      ),
      body: _isLoading
          ? const SubscriptionSkeleton()
          : _error != null
              ? SubscriptionErrorState(onRetry: _load)
              : _subscription == null
                  ? const SubscriptionEmptyState(title: 'Subscription not found', message: 'It may have been removed.')
                  : _buildBody(_subscription!),
    );
  }

  Widget _buildBody(Subscription s) {
    final product = s.product;
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.divider)),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(child: Text(product.name, style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.w800))),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(color: AppColors.primary.withOpacity(0.1), borderRadius: BorderRadius.circular(20)),
                    child: Text(s.status.label, style: GoogleFonts.outfit(fontSize: 10.5, fontWeight: FontWeight.w700, color: AppColors.primary)),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              _infoRow('Quantity', '${s.quantity}'),
              _infoRow('Frequency', s.scheduleDescription),
              if (s.status == SubscriptionStatus.active) _infoRow('Next Delivery', DateFormat('dd MMM yyyy').format(s.nextDelivery)),
              _infoRow('Delivery Slot', s.deliverySlot ?? '—'),
              _infoRow('Payment Method', s.paymentMethod),
              if (s.address != null) _infoRow('Address', s.address!.formattedOneLine),
            ],
          ),
        ),
        const SizedBox(height: 16),
        if (s.status == SubscriptionStatus.active || s.status == SubscriptionStatus.paused) ...[
          Text('Manage', style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
          const SizedBox(height: 10),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              if (s.status == SubscriptionStatus.active) _actionChip('Pause', Icons.pause_circle_outline_rounded, _handlePause),
              if (s.status == SubscriptionStatus.paused) _actionChip('Resume', Icons.play_circle_outline_rounded, _handleResume),
              if (s.status == SubscriptionStatus.active) _actionChip('Skip Next', Icons.skip_next_rounded, _handleSkip),
              _actionChip('Edit Quantity', Icons.edit_outlined, _handleEditQuantity),
              _actionChip('Edit Schedule', Icons.calendar_month_outlined, _handleEditSchedule),
              _actionChip('Change Address', Icons.location_on_outlined, _handleChangeAddress),
              _actionChip('Change Slot', Icons.access_time_rounded, _handleChangeSlot),
              _actionChip('Cancel', Icons.cancel_outlined, _handleCancel, isDestructive: true),
            ],
          ),
          const SizedBox(height: 20),
        ],
        Text('History', style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
        const SizedBox(height: 10),
        if (_history.isEmpty)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 24),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.divider)),
            child: Center(child: Text('No activity yet.', style: GoogleFonts.outfit(fontSize: 12.5, color: AppColors.textSecondary))),
          )
        else
          ..._history.map((h) => Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.divider)),
                child: Row(
                  children: [
                    Expanded(child: Text(h.label, style: GoogleFonts.outfit(fontSize: 12.5, fontWeight: FontWeight.w600))),
                    Text(DateFormat('dd MMM, hh:mm a').format(h.createdAt), style: GoogleFonts.outfit(fontSize: 10.5, color: AppColors.textHint)),
                  ],
                ),
              )),
      ],
    );
  }

  Widget _infoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: GoogleFonts.outfit(fontSize: 12, color: AppColors.textSecondary)),
          Flexible(child: Text(value, textAlign: TextAlign.right, style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.w700))),
        ],
      ),
    );
  }

  Widget _actionChip(String label, IconData icon, VoidCallback onTap, {bool isDestructive = false}) {
    final color = isDestructive ? AppColors.error : AppColors.primary;
    return GestureDetector(
      onTap: _isActing ? null : onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(color: color.withOpacity(0.08), borderRadius: BorderRadius.circular(20), border: Border.all(color: color.withOpacity(0.3))),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 14, color: color),
            const SizedBox(width: 6),
            Text(label, style: GoogleFonts.outfit(fontSize: 11.5, fontWeight: FontWeight.w700, color: color)),
          ],
        ),
      ),
    );
  }
}
