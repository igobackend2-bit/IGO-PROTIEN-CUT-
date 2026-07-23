import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../utils/app_colors.dart';
import '../../../../utils/id_format.dart';
import '../../../delivery/domain/entities/delivery_assignment.dart';
import '../../../delivery/domain/entities/delivery_otp_status.dart';
import '../../../delivery/domain/entities/store_location.dart';
import '../../../delivery/presentation/providers/delivery_providers.dart';
import '../../../delivery/presentation/widgets/delivery_eta_widget.dart';
import '../../../delivery/presentation/widgets/delivery_map_view.dart';
import '../../../delivery/presentation/widgets/delivery_otp_verify_card.dart';
import '../../../delivery/presentation/widgets/delivery_partner_card.dart' as delivery;
import '../../../delivery/presentation/widgets/delivery_status_badge.dart';
import '../../../delivery/presentation/widgets/delivery_timeline.dart';
import '../../domain/entities/order_summary.dart';
import '../providers/order_providers.dart';
import '../widgets/order_timeline.dart';

/// Live tracking, powered by the same Realtime order stream as Order
/// Detail — reached from the Order Success screen's "Track Order" button
/// and from tapping the timeline on Order Detail. Phase 17 layers real
/// delivery-assignment tracking (partner, live map, ETA, OTP confirmation)
/// on top without touching how the base order itself is fetched.
class OrderTrackingScreen extends ConsumerWidget {
  final String orderId;
  const OrderTrackingScreen({super.key, required this.orderId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final orderAsync = ref.watch(orderStreamProvider(orderId));

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Track Order', style: GoogleFonts.outfit(fontWeight: FontWeight.w700, color: Colors.white)),
        backgroundColor: AppColors.primary,
        elevation: 0,
      ),
      body: orderAsync.when(
        data: (order) {
          if (order == null) return Center(child: Text('Order not found.', style: GoogleFonts.outfit()));
          return _TrackingBody(order: order);
        },
        loading: () => const Center(child: CircularProgressIndicator(color: AppColors.primary)),
        error: (_, __) => Center(child: Text("Couldn't load tracking info.", style: GoogleFonts.outfit(color: AppColors.textSecondary))),
      ),
    );
  }
}

class _TrackingBody extends ConsumerWidget {
  final OrderSummary order;
  const _TrackingBody({required this.order});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Opportunistic — asks assign-delivery/estimate-eta to catch this order
    // up if needed. All eligibility logic lives in the Edge Functions.
    ref.watch(deliveryBootstrapProvider(order.id));

    final assignmentAsync = ref.watch(deliveryAssignmentStreamProvider(order.id));
    final assignment = assignmentAsync.value;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(gradient: AppColors.primaryGradient, borderRadius: BorderRadius.circular(20)),
          child: Column(
            children: [
              Icon(order.status.icon, color: Colors.white, size: 40),
              const SizedBox(height: 10),
              Text(order.status.label, style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w800, color: Colors.white)),
              const SizedBox(height: 4),
              Text('Order #${shortId(order.id)}', style: GoogleFonts.outfit(fontSize: 12, color: Colors.white.withOpacity(0.85))),
              if (assignment != null) ...[
                const SizedBox(height: 10),
                DeliveryStatusBadge(status: assignment.status),
              ] else if (order.deliverySlot != null) ...[
                const SizedBox(height: 10),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                  decoration: BoxDecoration(color: Colors.white.withOpacity(0.18), borderRadius: BorderRadius.circular(20)),
                  child: Text('ETA: ${order.deliverySlot}', style: GoogleFonts.outfit(fontSize: 11.5, fontWeight: FontWeight.w700, color: Colors.white)),
                ),
              ],
            ],
          ),
        ),
        const SizedBox(height: 20),
        if (assignment != null) ..._deliveryTrackingSections(ref, order, assignment) else OrderTimeline(status: order.status),
        const SizedBox(height: 20),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.divider)),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Items', style: GoogleFonts.outfit(fontSize: 13.5, fontWeight: FontWeight.w800)),
              const SizedBox(height: 10),
              ...order.items.map((item) => Padding(
                    padding: const EdgeInsets.symmetric(vertical: 4),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(child: Text(item.productName, style: GoogleFonts.outfit(fontSize: 13), maxLines: 1, overflow: TextOverflow.ellipsis)),
                        Text('x${item.quantity}', style: GoogleFonts.outfit(fontWeight: FontWeight.w700, fontSize: 13)),
                      ],
                    ),
                  )),
            ],
          ),
        ),
      ],
    );
  }

  List<Widget> _deliveryTrackingSections(WidgetRef ref, OrderSummary order, DeliveryAssignment assignment) {
    final locationAsync = ref.watch(deliveryLocationStreamProvider(assignment.id));
    final otpAsync = ref.watch(deliveryOtpStreamProvider(order.id));
    final partnerPoint = locationAsync.value != null ? MapPoint(locationAsync.value!.lat, locationAsync.value!.lng) : null;
    final destination = order.address?.latitude != null && order.address?.longitude != null
        ? MapPoint(order.address!.latitude!, order.address!.longitude!)
        : null;

    return [
      if (destination != null) ...[
        DeliveryMapView(pickup: const MapPoint(StoreLocation.lat, StoreLocation.lng), destination: destination, partner: partnerPoint),
        const SizedBox(height: 16),
      ],
      DeliveryEtaWidget(assignment: assignment),
      const SizedBox(height: 16),
      if (assignment.partner != null) ...[
        delivery.DeliveryPartnerCard(partner: assignment.partner!),
        const SizedBox(height: 16),
      ],
      if (assignment.status.isActive) ...[
        _otpSection(otpAsync.value, order.id),
        const SizedBox(height: 16),
      ],
      DeliveryTimeline(status: assignment.status),
    ];
  }

  Widget _otpSection(DeliveryOtpStatus? otpStatus, String orderId) {
    if (otpStatus == null) return const SizedBox.shrink();
    return DeliveryOtpVerifyCard(orderId: orderId, otpStatus: otpStatus);
  }
}
