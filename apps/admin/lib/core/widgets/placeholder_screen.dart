import 'package:flutter/material.dart';

/// Temporary stand-in for a module not yet built out, registered in the
/// router so navigation/permission wiring can be verified end-to-end before
/// every module's full CRUD screens land.
class PlaceholderScreen extends StatelessWidget {
  final String title;

  const PlaceholderScreen({super.key, required this.title});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.construction_outlined, size: 40, color: Theme.of(context).colorScheme.onSurfaceVariant),
          const SizedBox(height: 12),
          Text('$title — coming soon', style: Theme.of(context).textTheme.titleMedium),
        ],
      ),
    );
  }
}
