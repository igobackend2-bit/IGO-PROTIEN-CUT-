import 'package:flutter/material.dart';

/// Shared toolbar row for list screens: a search field, an optional row of
/// filter controls (dropdowns/chips passed in by the caller), and trailing
/// actions (e.g. a "New" button, gated by [PermissionGate] at the call
/// site). Wraps onto a second line on narrow widths instead of overflowing.
class SearchFilterBar extends StatelessWidget {
  final String hintText;
  final ValueChanged<String> onSearchChanged;
  final List<Widget> filters;
  final List<Widget> actions;

  const SearchFilterBar({
    super.key,
    this.hintText = 'Search…',
    required this.onSearchChanged,
    this.filters = const [],
    this.actions = const [],
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Expanded(
          child: Wrap(
            spacing: 12,
            runSpacing: 12,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              SizedBox(
                width: 280,
                child: TextField(
                  onChanged: onSearchChanged,
                  decoration: InputDecoration(
                    hintText: hintText,
                    prefixIcon: const Icon(Icons.search, size: 20),
                    isDense: true,
                  ),
                ),
              ),
              ...filters,
            ],
          ),
        ),
        if (actions.isNotEmpty) ...[
          const SizedBox(width: 12),
          ...actions,
        ],
      ],
    );
  }
}
