import 'dart:async';

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../utils/app_colors.dart';

/// Generic live countdown to a target time — used by Flash Sale offers
/// anywhere they're shown (Offers Screen, offer detail). Auto-hides itself
/// once the target time passes rather than showing "00:00:00" forever.
class CountdownTimer extends StatefulWidget {
  final DateTime endsAt;
  final VoidCallback? onExpired;

  const CountdownTimer({super.key, required this.endsAt, this.onExpired});

  @override
  State<CountdownTimer> createState() => _CountdownTimerState();
}

class _CountdownTimerState extends State<CountdownTimer> {
  Timer? _timer;
  Duration _remaining = Duration.zero;
  bool _expiredFired = false;

  @override
  void initState() {
    super.initState();
    _tick();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) => _tick());
  }

  void _tick() {
    final remaining = widget.endsAt.difference(DateTime.now());
    if (!mounted) return;
    setState(() => _remaining = remaining.isNegative ? Duration.zero : remaining);
    if (_remaining == Duration.zero && !_expiredFired) {
      _expiredFired = true;
      widget.onExpired?.call();
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  String _twoDigits(int n) => n.toString().padLeft(2, '0');

  @override
  Widget build(BuildContext context) {
    if (_remaining == Duration.zero) return const SizedBox.shrink();

    final days = _remaining.inDays;
    final hours = _twoDigits(_remaining.inHours % 24);
    final minutes = _twoDigits(_remaining.inMinutes % 60);
    final seconds = _twoDigits(_remaining.inSeconds % 60);
    final label = days > 0 ? '${days}d ${hours}h ${minutes}m' : '$hours:$minutes:$seconds';

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(color: AppColors.error.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.timer_rounded, size: 14, color: AppColors.error),
          const SizedBox(width: 4),
          Text(label, style: GoogleFonts.robotoMono(fontSize: 12, fontWeight: FontWeight.w800, color: AppColors.error)),
        ],
      ),
    );
  }
}
