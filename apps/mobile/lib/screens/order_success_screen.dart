import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../features/orders/presentation/screens/order_tracking_screen.dart';
import '../utils/app_colors.dart';
import '../utils/id_format.dart';

class OrderSuccessScreen extends StatefulWidget {
  final String? orderId;
  final String paymentMethodLabel;
  final String statusLabel;
  final String? deliveryEtaLabel;

  const OrderSuccessScreen({
    super.key,
    this.orderId,
    this.paymentMethodLabel = 'Cash on Delivery',
    this.statusLabel = 'Packing',
    this.deliveryEtaLabel,
  });

  @override
  State<OrderSuccessScreen> createState() => _OrderSuccessScreenState();
}

class _OrderSuccessScreenState extends State<OrderSuccessScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  late Animation<double> _opacityAnimation;

  late String orderId;

  @override
  void initState() {
    super.initState();

    orderId = widget.orderId ??
        'PC-${DateTime.now().millisecondsSinceEpoch % 1000000}';

    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );

    _scaleAnimation = CurvedAnimation(
      parent: _controller,
      curve: Curves.elasticOut,
    );

    _opacityAnimation = CurvedAnimation(
      parent: _controller,
      curve: Curves.easeIn,
    );

    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void goToTracking() {
    final realId = widget.orderId;
    if (realId == null) {
      // Only happens if this screen is somehow reached without a real
      // placed order (the synthetic 'PC-...' fallback ID is not trackable).
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Tracking is unavailable for this order.', style: GoogleFonts.outfit()), behavior: SnackBarBehavior.floating),
      );
      return;
    }
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => OrderTrackingScreen(orderId: realId),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Spacer(),

              ScaleTransition(
                scale: _scaleAnimation,
                child: Container(
                  width: 100,
                  height: 100,
                  decoration: BoxDecoration(
                    gradient: AppColors.primaryGradient,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.primary.withOpacity(0.3),
                        blurRadius: 20,
                        offset: const Offset(0, 10),
                      ),
                    ],
                  ),
                  child: const Icon(
                    Icons.check_rounded,
                    color: Colors.white,
                    size: 56,
                  ),
                ),
              ),

              const SizedBox(height: 32),

              FadeTransition(
                opacity: _opacityAnimation,
                child: Column(
                  children: [
                    Text(
                      'Order Placed Successfully! 🎉',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.outfit(
                        fontSize: 24,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'Your fresh protein cuts are being packed and will be delivered soon.',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.outfit(
                        fontSize: 14,
                        color: Colors.grey,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 32),

              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  children: [
                    _row("Order ID", '#${shortId(orderId)}', bold: true),
                    const Divider(),
                    _row("Payment", widget.paymentMethodLabel),
                    const Divider(),
                    _row("Status", widget.statusLabel),
                    if (widget.deliveryEtaLabel != null) ...[
                      const Divider(),
                      _row("Delivery ETA", widget.deliveryEtaLabel!),
                    ],
                  ],
                ),
              ),

              const Spacer(),

              // 🔥 TRACK ORDER BUTTON (SWIGGY STYLE)
              SizedBox(
                width: double.infinity,
                height: 54,
                child: ElevatedButton(
                  onPressed: goToTracking,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                  ),
                  child: Text(
                    "Track Order (Live)",
                    style: GoogleFonts.outfit(
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 12),

              OutlinedButton(
                onPressed: () {
                  Navigator.pushNamedAndRemoveUntil(
                    context,
                    '/home',
                    (route) => false,
                  );
                },
                child: const Text("Continue Shopping"),
              ),

              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _row(String a, String b, {bool bold = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(a),
        Text(
          b,
          style: TextStyle(
            fontWeight: bold ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ],
    );
  }
}