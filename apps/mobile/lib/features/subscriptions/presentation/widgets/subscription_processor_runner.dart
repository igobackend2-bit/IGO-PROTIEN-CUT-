import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../providers/subscription_providers.dart';

/// Fires the "generate orders for due subscriptions" pass once per app
/// session. No UI of its own — wraps HomeScreen the same way
/// NotificationToastListener does, so it runs as soon as the user is
/// logged in without needing to open the Subscriptions screen first.
class SubscriptionProcessorRunner extends ConsumerStatefulWidget {
  final Widget child;
  const SubscriptionProcessorRunner({super.key, required this.child});

  @override
  ConsumerState<SubscriptionProcessorRunner> createState() => _SubscriptionProcessorRunnerState();
}

class _SubscriptionProcessorRunnerState extends ConsumerState<SubscriptionProcessorRunner> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(subscriptionProcessorProvider).runOnce();
    });
  }

  @override
  Widget build(BuildContext context) => widget.child;
}
