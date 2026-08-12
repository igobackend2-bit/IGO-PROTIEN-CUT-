import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../utils/app_colors.dart';
import '../../domain/entities/delivery_slot.dart';
import '../providers/checkout_providers.dart';

class DeliverySlotStep extends ConsumerStatefulWidget {
  const DeliverySlotStep({super.key});

  @override
  ConsumerState<DeliverySlotStep> createState() => _DeliverySlotStepState();
}

class _DeliverySlotStepState extends ConsumerState<DeliverySlotStep> {
  String _dayFilter = 'Today';

  @override
  Widget build(BuildContext context) {
    final checkoutState = ref.watch(checkoutProvider);
    final notifier = ref.read(checkoutProvider.notifier);
    final daySlots = checkoutState.slots.where((s) => s.dayLabel == _dayFilter).toList();
    final availableToday = checkoutState.slots.where((s) => s.dayLabel == 'Today' && s.isAvailable).isNotEmpty;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text('Choose a delivery slot', style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
        const SizedBox(height: 14),
        Row(
          children: [
            _dayChip('Today', enabled: availableToday),
            const SizedBox(width: 10),
            _dayChip('Tomorrow', enabled: true),
          ],
        ),
        const SizedBox(height: 16),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 2.6,
          ),
          itemCount: daySlots.length,
          itemBuilder: (context, index) {
            final slot = daySlots[index];
            final isSelected = checkoutState.selectedSlot?.id == slot.id;
            return _SlotTile(
              slot: slot,
              isSelected: isSelected,
              onTap: slot.isAvailable ? () => notifier.selectSlot(slot) : null,
            );
          },
        ),
      ],
    );
  }

  Widget _dayChip(String label, {required bool enabled}) {
    final isSelected = _dayFilter == label;
    return GestureDetector(
      onTap: enabled ? () => setState(() => _dayFilter = label) : null,
      child: Opacity(
        opacity: enabled ? 1 : 0.4,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
          decoration: BoxDecoration(
            gradient: isSelected ? AppColors.primaryGradient : null,
            color: isSelected ? null : AppColors.surfaceLight,
            borderRadius: BorderRadius.circular(20),
          ),
          child: Text(
            label,
            style: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.w700, color: isSelected ? Colors.white : AppColors.textSecondary),
          ),
        ),
      ),
    );
  }
}

class _SlotTile extends StatelessWidget {
  final DeliverySlot slot;
  final bool isSelected;
  final VoidCallback? onTap;

  const _SlotTile({required this.slot, required this.isSelected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Opacity(
        opacity: slot.isAvailable ? 1 : 0.4,
        child: Container(
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: isSelected ? AppColors.primary.withOpacity(0.1) : Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: isSelected ? AppColors.primary : AppColors.divider, width: isSelected ? 1.5 : 1),
          ),
          child: Text(
            slot.timeRangeLabel,
            textAlign: TextAlign.center,
            style: GoogleFonts.outfit(
              fontSize: 12.5,
              fontWeight: FontWeight.w700,
              color: isSelected ? AppColors.primary : (slot.isAvailable ? AppColors.textPrimary : AppColors.textHint),
            ),
          ),
        ),
      ),
    );
  }
}
