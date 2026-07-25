import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/permissions/permission_codes.dart';
import '../../../../core/permissions/permission_gate.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/confirm_dialog.dart';
import '../../../../core/widgets/empty_state_view.dart';
import '../../../../core/widgets/error_retry_view.dart';
import '../../../../core/widgets/loading_view.dart';
import '../combo_packs_list_controller.dart';
import '../coupons_list_controller.dart';
import '../offers_list_controller.dart';
import '../widgets/combo_pack_form_dialog.dart';
import '../widgets/coupon_form_dialog.dart';
import '../widgets/offer_form_dialog.dart';

class CouponsScreen extends StatefulWidget {
  const CouponsScreen({super.key});

  @override
  State<CouponsScreen> createState() => _CouponsScreenState();
}

class _CouponsScreenState extends State<CouponsScreen> with SingleTickerProviderStateMixin {
  late final TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Coupons', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w700)),
        const SizedBox(height: 12),
        TabBar(
          controller: _tabController,
          isScrollable: true,
          tabAlignment: TabAlignment.start,
          tabs: const [Tab(text: 'Coupons'), Tab(text: 'Offers'), Tab(text: 'Combo packs')],
        ),
        const SizedBox(height: 16),
        Expanded(
          child: TabBarView(
            controller: _tabController,
            children: const [_CouponsTab(), _OffersTab(), _ComboPacksTab()],
          ),
        ),
      ],
    );
  }
}

class _CouponsTab extends ConsumerWidget {
  const _CouponsTab();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(couponsListControllerProvider);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Align(
          alignment: Alignment.centerRight,
          child: PermissionGate(
            permission: PermissionCodes.couponsManage,
            child: FilledButton.icon(
              onPressed: () => showCouponFormDialog(context),
              icon: const Icon(Icons.add),
              label: const Text('New coupon'),
            ),
          ),
        ),
        const SizedBox(height: 12),
        Expanded(
          child: async.when(
            loading: () => const LoadingView(),
            error: (e, _) => ErrorRetryView(
              message: e.toString(),
              onRetry: () => ref.read(couponsListControllerProvider.notifier).refresh(),
            ),
            data: (coupons) {
              if (coupons.isEmpty) return const EmptyStateView(message: 'No coupons yet.');
              return ListView.separated(
                itemCount: coupons.length,
                separatorBuilder: (context, index) => const Divider(height: 1),
                itemBuilder: (context, index) {
                  final coupon = coupons[index];
                  final expired = coupon.expiresAt != null && coupon.expiresAt!.isBefore(DateTime.now());
                  final discount = coupon.discountType == 'percentage'
                      ? '${coupon.discountValue}%'
                      : Formatters.currency(coupon.discountValue);
                  return ListTile(
                    title: Text(coupon.code),
                    subtitle: Text(
                      '$discount off${coupon.minOrderValue != null ? ' · min ${Formatters.currency(coupon.minOrderValue)}' : ''}'
                      '${coupon.expiresAt != null ? ' · expires ${Formatters.date(coupon.expiresAt)}' : ''}',
                    ),
                    trailing: Wrap(
                      spacing: 4,
                      crossAxisAlignment: WrapCrossAlignment.center,
                      children: [
                        _StatusChip(label: expired ? 'Expired' : (coupon.isActive ? 'Active' : 'Disabled')),
                        PermissionGate(
                          permission: PermissionCodes.couponsManage,
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              IconButton(
                                tooltip: 'Edit',
                                icon: const Icon(Icons.edit_outlined, size: 18),
                                onPressed: () => showCouponFormDialog(context, existing: coupon),
                              ),
                              if (coupon.isActive)
                                IconButton(
                                  tooltip: 'Disable',
                                  icon: const Icon(Icons.block, size: 18),
                                  onPressed: () => ref.read(couponsListControllerProvider.notifier).disable(coupon.id),
                                ),
                              if (!expired)
                                IconButton(
                                  tooltip: 'Expire now',
                                  icon: const Icon(Icons.timer_off_outlined, size: 18),
                                  onPressed: () => ref.read(couponsListControllerProvider.notifier).expire(coupon.id),
                                ),
                              IconButton(
                                tooltip: 'Delete',
                                icon: const Icon(Icons.delete_outline, size: 18),
                                onPressed: () async {
                                  final confirmed = await showConfirmDialog(
                                    context,
                                    title: 'Delete coupon?',
                                    message: 'Delete "${coupon.code}"?',
                                    confirmLabel: 'Delete',
                                    destructive: true,
                                  );
                                  if (confirmed) await ref.read(couponsListControllerProvider.notifier).delete(coupon.id);
                                },
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  );
                },
              );
            },
          ),
        ),
      ],
    );
  }
}

class _OffersTab extends ConsumerWidget {
  const _OffersTab();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(offersListControllerProvider);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Align(
          alignment: Alignment.centerRight,
          child: PermissionGate(
            permission: PermissionCodes.couponsManage,
            child: FilledButton.icon(
              onPressed: () => showOfferFormDialog(context),
              icon: const Icon(Icons.add),
              label: const Text('New offer'),
            ),
          ),
        ),
        const SizedBox(height: 12),
        Expanded(
          child: async.when(
            loading: () => const LoadingView(),
            error: (e, _) => ErrorRetryView(
              message: e.toString(),
              onRetry: () => ref.read(offersListControllerProvider.notifier).refresh(),
            ),
            data: (offers) {
              if (offers.isEmpty) return const EmptyStateView(message: 'No offers yet.');
              return ListView.separated(
                itemCount: offers.length,
                separatorBuilder: (context, index) => const Divider(height: 1),
                itemBuilder: (context, index) {
                  final offer = offers[index];
                  return ListTile(
                    title: Text(offer.title),
                    subtitle: Text(
                      '${offer.type} · ${Formatters.date(offer.startDate)} – ${Formatters.date(offer.endDate)}',
                    ),
                    trailing: PermissionGate(
                      permission: PermissionCodes.couponsManage,
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Switch(
                            value: offer.active,
                            onChanged: (v) => ref.read(offersListControllerProvider.notifier).setActive(offer.id, v),
                          ),
                          IconButton(
                            tooltip: 'Edit',
                            icon: const Icon(Icons.edit_outlined, size: 18),
                            onPressed: () => showOfferFormDialog(context, existing: offer),
                          ),
                          IconButton(
                            tooltip: 'Delete',
                            icon: const Icon(Icons.delete_outline, size: 18),
                            onPressed: () async {
                              final confirmed = await showConfirmDialog(
                                context,
                                title: 'Delete offer?',
                                message: 'Delete "${offer.title}"?',
                                confirmLabel: 'Delete',
                                destructive: true,
                              );
                              if (confirmed) await ref.read(offersListControllerProvider.notifier).delete(offer.id);
                            },
                          ),
                        ],
                      ),
                    ),
                  );
                },
              );
            },
          ),
        ),
      ],
    );
  }
}

class _ComboPacksTab extends ConsumerWidget {
  const _ComboPacksTab();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(comboPacksListControllerProvider);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Align(
          alignment: Alignment.centerRight,
          child: PermissionGate(
            permission: PermissionCodes.couponsManage,
            child: FilledButton.icon(
              onPressed: () => showComboPackFormDialog(context),
              icon: const Icon(Icons.add),
              label: const Text('New combo pack'),
            ),
          ),
        ),
        const SizedBox(height: 12),
        Expanded(
          child: async.when(
            loading: () => const LoadingView(),
            error: (e, _) => ErrorRetryView(
              message: e.toString(),
              onRetry: () => ref.read(comboPacksListControllerProvider.notifier).refresh(),
            ),
            data: (packs) {
              if (packs.isEmpty) return const EmptyStateView(message: 'No combo packs yet.');
              return ListView.separated(
                itemCount: packs.length,
                separatorBuilder: (context, index) => const Divider(height: 1),
                itemBuilder: (context, index) {
                  final pack = packs[index];
                  return ListTile(
                    title: Text(pack.title),
                    subtitle: Text('${pack.items.length} items · ${pack.bundleType} · discount ${pack.discount}'),
                    trailing: PermissionGate(
                      permission: PermissionCodes.couponsManage,
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Switch(
                            value: pack.active,
                            onChanged: (v) =>
                                ref.read(comboPacksListControllerProvider.notifier).setActive(pack.id, v),
                          ),
                          IconButton(
                            tooltip: 'Edit',
                            icon: const Icon(Icons.edit_outlined, size: 18),
                            onPressed: () => showComboPackFormDialog(context, existing: pack),
                          ),
                          IconButton(
                            tooltip: 'Delete',
                            icon: const Icon(Icons.delete_outline, size: 18),
                            onPressed: () async {
                              final confirmed = await showConfirmDialog(
                                context,
                                title: 'Delete combo pack?',
                                message: 'Delete "${pack.title}"?',
                                confirmLabel: 'Delete',
                                destructive: true,
                              );
                              if (confirmed) {
                                await ref.read(comboPacksListControllerProvider.notifier).delete(pack.id);
                              }
                            },
                          ),
                        ],
                      ),
                    ),
                  );
                },
              );
            },
          ),
        ),
      ],
    );
  }
}

class _StatusChip extends StatelessWidget {
  final String label;

  const _StatusChip({required this.label});

  @override
  Widget build(BuildContext context) {
    final color = label == 'Active' ? Colors.green.shade700 : Colors.grey.shade700;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(color: color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(20)),
      child: Text(label, style: TextStyle(color: color, fontSize: 12)),
    );
  }
}
