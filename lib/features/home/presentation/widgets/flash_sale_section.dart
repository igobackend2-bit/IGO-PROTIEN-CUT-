import 'dart:async';

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../utils/app_colors.dart';
import '../../domain/entities/home_data.dart';
import 'product_section_slider.dart';

/// Flash Sale section: same product slider as everything else, but with a
/// live countdown badge instead of a "See all" link.
class FlashSaleSection extends StatefulWidget {
  final HomeData homeData;

  const FlashSaleSection({super.key, required this.homeData});

  @override
  State<FlashSaleSection> createState() => _FlashSaleSectionState();
}

class _FlashSaleSectionState extends State<FlashSaleSection> {
  Timer? _timer;
  Duration _remaining = Duration.zero;

  @override
  void initState() {
    super.initState();
    _updateRemaining();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) => _updateRemaining());
  }

  void _updateRemaining() {
    final remaining = widget.homeData.flashSaleEndsAt.difference(DateTime.now());
    if (!mounted) return;
    setState(() => _remaining = remaining.isNegative ? Duration.zero : remaining);
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  String _twoDigits(int n) => n.toString().padLeft(2, '0');

  @override
  Widget build(BuildContext context) {
    if (widget.homeData.flashSale.isEmpty) return const SizedBox.shrink();

    final hours = _twoDigits(_remaining.inHours);
    final minutes = _twoDigits(_remaining.inMinutes % 60);
    final seconds = _twoDigits(_remaining.inSeconds % 60);

    return ProductSectionSlider(
      title: '⚡ Flash Sale',
      subtitle: 'Grab it before it\'s gone',
      products: widget.homeData.flashSale,
      homeData: widget.homeData,
      trailing: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: AppColors.error.withOpacity(0.1),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Text(
          '$hours:$minutes:$seconds',
          style: GoogleFonts.robotoMono(fontSize: 12, fontWeight: FontWeight.w800, color: AppColors.error),
        ),
      ),
    );
  }
}
