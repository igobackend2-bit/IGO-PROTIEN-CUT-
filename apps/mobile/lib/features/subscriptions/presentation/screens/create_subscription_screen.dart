import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../models/product_model.dart';
import '../../../../models/subscription_schedule.dart';
import '../../../../utils/app_colors.dart';
import '../../../address/presentation/providers/address_providers.dart';
import '../../../address/presentation/screens/address_form_screen.dart';
import '../../../checkout/domain/entities/payment_method_option.dart';
import '../providers/subscription_providers.dart';
import '../widgets/schedule_picker.dart';

class CreateSubscriptionScreen extends ConsumerStatefulWidget {
  final Product product;
  final int initialQuantity;

  const CreateSubscriptionScreen({super.key, required this.product, this.initialQuantity = 1});

  @override
  ConsumerState<CreateSubscriptionScreen> createState() => _CreateSubscriptionScreenState();
}

class _CreateSubscriptionScreenState extends ConsumerState<CreateSubscriptionScreen> {
  late int _quantity = widget.initialQuantity;
  String? _addressId;
  String _deliverySlot = subscriptionDeliverySlots.first;
  PaymentMethodOption _paymentMethod = PaymentMethodOption.cashOnDelivery;
  late ScheduleConfig _schedule = ScheduleConfig(
    scheduleType: ScheduleType.weekly,
    interval: 1,
    weekdays: const [],
    startDate: DateTime.now().add(const Duration(days: 1)),
  );
  bool _isSubmitting = false;
  bool _initializedAddress = false;

  Future<void> _submit() async {
    if (_addressId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Please select a delivery address.', style: GoogleFonts.outfit()), backgroundColor: AppColors.error, behavior: SnackBarBehavior.floating),
      );
      return;
    }
    if (_schedule.scheduleType == ScheduleType.custom && _schedule.weekdays.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Please select at least one delivery day.', style: GoogleFonts.outfit()), backgroundColor: AppColors.error, behavior: SnackBarBehavior.floating),
      );
      return;
    }

    setState(() => _isSubmitting = true);
    try {
      await ref.read(subscriptionRepositoryProvider).createSubscription(
            productId: widget.product.id,
            addressId: _addressId,
            quantity: _quantity,
            variantId: widget.product.weight,
            scheduleType: _schedule.scheduleType,
            weekdays: _schedule.scheduleType == ScheduleType.custom ? _schedule.weekdays : null,
            interval: _schedule.interval,
            startDate: _schedule.startDate,
            deliverySlot: _deliverySlot,
            paymentMethod: _paymentMethod.label,
          );
      ref.invalidate(subscriptionListProvider);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Subscription created!', style: GoogleFonts.outfit()), backgroundColor: AppColors.success, behavior: SnackBarBehavior.floating),
      );
      Navigator.pop(context, true);
    } catch (_) {
      if (!mounted) return;
      setState(() => _isSubmitting = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Could not create your subscription. Please try again.', style: GoogleFonts.outfit()), backgroundColor: AppColors.error, behavior: SnackBarBehavior.floating),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final addressState = ref.watch(addressListProvider);
    if (!_initializedAddress && addressState.addresses.isNotEmpty) {
      _addressId = ref.read(defaultAddressProvider)?.id ?? addressState.addresses.first.id;
      _initializedAddress = true;
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Subscribe & Save', style: GoogleFonts.outfit(fontWeight: FontWeight.w700, color: Colors.white)),
        backgroundColor: AppColors.primary,
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.divider)),
            child: Row(
              children: [
                Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(color: AppColors.surfaceLight, borderRadius: BorderRadius.circular(12)),
                  child: const Icon(Icons.shopping_bag_outlined, color: AppColors.primary),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(widget.product.name, style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w700)),
                      Text('${widget.product.weight} • ₹${widget.product.price.toStringAsFixed(0)}', style: GoogleFonts.outfit(fontSize: 11.5, color: AppColors.textSecondary)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          _label('Quantity'),
          Row(
            children: [
              _qtyButton(Icons.remove_rounded, () => setState(() => _quantity = (_quantity - 1).clamp(1, 20))),
              Container(width: 48, alignment: Alignment.center, child: Text('$_quantity', style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w700))),
              _qtyButton(Icons.add_rounded, () => setState(() => _quantity = (_quantity + 1).clamp(1, 20))),
            ],
          ),
          const SizedBox(height: 20),
          _label('Delivery Address'),
          if (addressState.addresses.isEmpty)
            OutlinedButton.icon(
              onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AddressFormScreen())),
              icon: const Icon(Icons.add_location_alt_outlined, size: 18),
              label: Text('Add an address', style: GoogleFonts.outfit(fontWeight: FontWeight.w700)),
            )
          else
            ...addressState.addresses.map((address) => RadioListTile<String>(
                  contentPadding: EdgeInsets.zero,
                  value: address.id,
                  groupValue: _addressId,
                  onChanged: (value) => setState(() => _addressId = value),
                  activeColor: AppColors.primary,
                  title: Text('${address.addressType.label} • ${address.fullName}', style: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.w700)),
                  subtitle: Text(address.formattedOneLine, style: GoogleFonts.outfit(fontSize: 11, color: AppColors.textSecondary), maxLines: 2, overflow: TextOverflow.ellipsis),
                )),
          const SizedBox(height: 12),
          _label('Delivery Slot'),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: subscriptionDeliverySlots.map((slot) {
              final isSelected = slot == _deliverySlot;
              return ChoiceChip(
                label: Text(slot, style: GoogleFonts.outfit(fontSize: 11.5, fontWeight: FontWeight.w600)),
                selected: isSelected,
                onSelected: (_) => setState(() => _deliverySlot = slot),
                selectedColor: AppColors.primary,
                backgroundColor: AppColors.surfaceLight,
                labelStyle: TextStyle(color: isSelected ? Colors.white : AppColors.textSecondary),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20), side: BorderSide(color: isSelected ? AppColors.primary : AppColors.inputBorder)),
              );
            }).toList(),
          ),
          const SizedBox(height: 20),
          _label('Payment Method'),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: PaymentMethodOption.values.where((m) => m.isAvailable).map((method) {
              final isSelected = method == _paymentMethod;
              return ChoiceChip(
                avatar: Icon(method.icon, size: 15, color: isSelected ? Colors.white : AppColors.textSecondary),
                label: Text(method.label, style: GoogleFonts.outfit(fontSize: 11.5, fontWeight: FontWeight.w600)),
                selected: isSelected,
                onSelected: (_) => setState(() => _paymentMethod = method),
                selectedColor: AppColors.primary,
                backgroundColor: AppColors.surfaceLight,
                labelStyle: TextStyle(color: isSelected ? Colors.white : AppColors.textSecondary),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20), side: BorderSide(color: isSelected ? AppColors.primary : AppColors.inputBorder)),
              );
            }).toList(),
          ),
          const SizedBox(height: 20),
          SchedulePicker(initial: _schedule, onChanged: (config) => setState(() => _schedule = config)),
          const SizedBox(height: 28),
          SizedBox(
            height: 54,
            child: ElevatedButton(
              onPressed: _isSubmitting ? null : _submit,
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
              child: _isSubmitting
                  ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : Text('Start Subscription', style: GoogleFonts.outfit(fontWeight: FontWeight.w700, fontSize: 15)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _qtyButton(IconData icon, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 36,
        height: 36,
        decoration: BoxDecoration(color: AppColors.surfaceLight, borderRadius: BorderRadius.circular(10)),
        child: Icon(icon, size: 18, color: AppColors.primary),
      ),
    );
  }

  Widget _label(String text) => Padding(
        padding: const EdgeInsets.only(bottom: 8),
        child: Text(text, style: GoogleFonts.outfit(fontSize: 12.5, fontWeight: FontWeight.w700, color: AppColors.textSecondary)),
      );
}
