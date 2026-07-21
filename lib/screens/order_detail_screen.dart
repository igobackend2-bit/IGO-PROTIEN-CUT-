import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../utils/app_colors.dart';

class OrderDetailScreen extends StatelessWidget {
  const OrderDetailScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final order = ModalRoute.of(context)?.settings.arguments as Map<String, dynamic>?;

    if (order == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Error')),
        body: const Center(child: Text('Order data not found.')),
      );
    }

    final int orderId = order['id'] ?? 0;
    final double totalPrice = ((order['total_price'] ?? 0.0) as num).toDouble();
    final String status = (order['status'] ?? 'Pending') as String;
    final String? createdAtStr = order['created_at'] as String?;

    DateTime createdAt = DateTime.now();
    if (createdAtStr != null) {
      try {
        createdAt = DateTime.parse(createdAtStr).toLocal();
      } catch (_) {}
    }
    final formattedDate = DateFormat('dd MMM yyyy, hh:mm a').format(createdAt);

    final items = order['order_items'] as List? ?? [];
    
    // Pricing details
    const double deliveryFee = 30.0;
    const double taxesAndFees = 15.0;
    final double subtotal = totalPrice;
    final double grandTotal = subtotal + deliveryFee + taxesAndFees;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(
          'Order #$orderId Details',
          style: GoogleFonts.outfit(fontWeight: FontWeight.w700),
        ),
        backgroundColor: AppColors.primary,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── Tracking Progress Stepper ─────────────────────────────────
              _buildProgressStepper(status),
              const SizedBox(height: 20),

              // ── Info Header Card ──────────────────────────────────────────
              _buildHeaderCard(formattedDate, status),
              const SizedBox(height: 20),

              // ── Items Ordered Section ─────────────────────────────────────
              Text(
                'Items Ordered',
                style: GoogleFonts.outfit(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 10),
              _buildItemsList(items),
              const SizedBox(height: 20),

              // ── Delivery Information ──────────────────────────────────────
              Text(
                'Delivery Information',
                style: GoogleFonts.outfit(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 10),
              _buildDeliveryInfoCard(),
              const SizedBox(height: 20),

              // ── Receipt Bill Breakdown ────────────────────────────────────
              Text(
                'Bill Summary',
                style: GoogleFonts.outfit(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 10),
              _buildBillDetailsCard(subtotal, deliveryFee, taxesAndFees, grandTotal),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildProgressStepper(String currentStatus) {
    final status = currentStatus.toLowerCase();
    
    // Status mapping to steps (0 = Placed, 1 = Preparing, 2 = Out for Delivery, 3 = Delivered)
    int currentStep = 0;
    if (status == 'preparing' || status == 'cooking') {
      currentStep = 1;
    } else if (status == 'out for delivery' || status == 'dispatched') {
      currentStep = 2;
    } else if (status == 'delivered') {
      currentStep = 3;
    }

    final steps = [
      _StepInfo(label: 'Placed', icon: Icons.receipt_long_rounded),
      _StepInfo(label: 'Packing', icon: Icons.inventory_2_rounded),
      _StepInfo(label: 'Dispatched', icon: Icons.delivery_dining_rounded),
      _StepInfo(label: 'Delivered', icon: Icons.home_work_rounded),
    ];

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.divider),
      ),
      child: Row(
        children: List.generate(steps.length, (index) {
          final step = steps[index];
          final isCompleted = index <= currentStep;
          final isCurrent = index == currentStep;
          final isLast = index == steps.length - 1;

          return Expanded(
            child: Row(
              children: [
                Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: isCompleted ? AppColors.primaryGradient : null,
                        color: isCompleted ? null : Colors.grey.shade200,
                        border: isCurrent
                            ? Border.all(color: AppColors.accent, width: 2)
                            : null,
                      ),
                      child: Icon(
                        step.icon,
                        size: 16,
                        color: isCompleted ? Colors.white : Colors.grey.shade500,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      step.label,
                      style: GoogleFonts.outfit(
                        fontSize: 9.5,
                        fontWeight: isCompleted ? FontWeight.w800 : FontWeight.w600,
                        color: isCompleted ? AppColors.primary : AppColors.textHint,
                      ),
                    ),
                  ],
                ),
                if (!isLast)
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.only(bottom: 16.0),
                      child: Container(
                        height: 2,
                        color: index < currentStep
                            ? AppColors.primary
                            : Colors.grey.shade200,
                      ),
                    ),
                  ),
              ],
            ),
          );
        }),
      ),
    );
  }

  Widget _buildHeaderCard(String dateStr, String status) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.divider),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Placed On',
                style: GoogleFonts.outfit(
                  fontSize: 11,
                  color: AppColors.textHint,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                dateStr,
                style: GoogleFonts.outfit(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: status.toLowerCase() == 'delivered'
                  ? const Color(0xFFE8F8F5)
                  : const Color(0xFFFBEEE6),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              status.toUpperCase(),
              style: GoogleFonts.outfit(
                fontSize: 10,
                fontWeight: FontWeight.w800,
                color: status.toLowerCase() == 'delivered'
                    ? const Color(0xFF117A65)
                    : const Color(0xFFBA4A00),
                letterSpacing: 0.5,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildItemsList(List<dynamic> items) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.divider),
      ),
      child: ListView.separated(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: items.length,
        separatorBuilder: (context, index) => const Divider(color: AppColors.divider, height: 1),
        itemBuilder: (context, index) {
          final item = items[index];
          final productData = item['products'];
          final product = productData is Map ? productData : null;
          final name = product?['name'] ?? 'Unknown Item';
          final imageUrl = product?['image_url'] as String? ?? '';
          final qty = item['quantity'] ?? 1;
          final double price = ((item['price'] ?? product?['price'] ?? 0.0) as num).toDouble();
          
          final bool isNetworkImage = imageUrl.startsWith('http');

          return Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                // Item Image / Icon
                Container(
                  width: 50,
                  height: 50,
                  decoration: BoxDecoration(
                    color: AppColors.surfaceLight,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: imageUrl.isEmpty
                        ? const Icon(Icons.shopping_bag_outlined, color: AppColors.primary, size: 24)
                        : isNetworkImage
                            ? Image.network(imageUrl, fit: BoxFit.cover)
                            : Center(child: Text(imageUrl, style: const TextStyle(fontSize: 24))),
                  ),
                ),
                const SizedBox(width: 16),
                
                // Item Name & Quantity details
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        name,
                        style: GoogleFonts.outfit(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Qty: $qty',
                        style: GoogleFonts.outfit(
                          fontSize: 11,
                          color: AppColors.textSecondary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
                
                // Item Price
                Text(
                  '₹${(price * qty).toStringAsFixed(0)}',
                  style: GoogleFonts.outfit(
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                    color: AppColors.textPrimary,
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildDeliveryInfoCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.divider),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(Icons.location_on_rounded, color: AppColors.primary, size: 20),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Delivery Address',
                      style: GoogleFonts.outfit(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Home • Gym Town Fitness Hub, Gym Street, 1st Floor, City Gym Complex, GT 98201',
                      style: GoogleFonts.outfit(
                        fontSize: 12,
                        color: AppColors.textSecondary,
                        height: 1.4,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 12.0),
            child: Divider(color: AppColors.divider, height: 1),
          ),
          Row(
            children: [
              const Icon(Icons.phone_rounded, color: AppColors.primary, size: 20),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Phone Number',
                    style: GoogleFonts.outfit(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '+91 98765 43210',
                    style: GoogleFonts.outfit(
                      fontSize: 12,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildBillDetailsCard(double subtotal, double deliveryFee,
      double taxesAndFees, double grandTotal) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.divider),
      ),
      child: Column(
        children: [
          _buildBillRow('Item Subtotal', '₹${subtotal.toStringAsFixed(0)}'),
          const SizedBox(height: 12),
          _buildBillRow('Delivery Partner Fee', '₹${deliveryFee.toStringAsFixed(0)}'),
          const SizedBox(height: 12),
          _buildBillRow('GST & Packing Charges', '₹${taxesAndFees.toStringAsFixed(0)}'),
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 14.0),
            child: Divider(color: AppColors.divider, height: 1),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Grand Total',
                style: GoogleFonts.outfit(
                  fontSize: 15,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textPrimary,
                ),
              ),
              Text(
                '₹${grandTotal.toStringAsFixed(0)}',
                style: GoogleFonts.outfit(
                  fontSize: 16,
                  fontWeight: FontWeight.w800,
                  color: AppColors.primary,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildBillRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: GoogleFonts.outfit(
            fontSize: 12,
            color: AppColors.textSecondary,
            fontWeight: FontWeight.w500,
          ),
        ),
        Text(
          value,
          style: GoogleFonts.outfit(
            fontSize: 12,
            color: AppColors.textPrimary,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}

class _StepInfo {
  final String label;
  final IconData icon;
  _StepInfo({required this.label, required this.icon});
}
