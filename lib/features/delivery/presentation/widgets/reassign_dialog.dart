import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../domain/delivery_assignment.dart';
import '../delivery_providers.dart';
import '../partners_controller.dart';

Future<bool?> showReassignDialog(BuildContext context, DeliveryAssignment assignment) {
  return showDialog<bool>(
    context: context,
    builder: (context) => _ReassignDialog(assignment: assignment),
  );
}

class _ReassignDialog extends ConsumerStatefulWidget {
  final DeliveryAssignment assignment;

  const _ReassignDialog({required this.assignment});

  @override
  ConsumerState<_ReassignDialog> createState() => _ReassignDialogState();
}

class _ReassignDialogState extends ConsumerState<_ReassignDialog> {
  String? _partnerId;
  bool _saving = false;
  String? _error;

  Future<void> _submit() async {
    if (_partnerId == null) return;
    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      await ref
          .read(deliveryRepositoryProvider)
          .reassign(assignmentId: widget.assignment.id, newPartnerId: _partnerId!);
      if (mounted) Navigator.of(context).pop(true);
    } catch (e) {
      setState(() {
        _error = e.toString();
        _saving = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final partners = ref.watch(partnersControllerProvider).value ?? const [];
    return AlertDialog(
      title: const Text('Reassign delivery partner'),
      content: SizedBox(
        width: 360,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            DropdownButtonFormField<String>(
              initialValue: _partnerId,
              decoration: const InputDecoration(labelText: 'New partner'),
              items: [
                for (final p in partners.where((p) => p.isActive))
                  DropdownMenuItem(value: p.id, child: Text(p.name)),
              ],
              onChanged: (v) => setState(() => _partnerId = v),
            ),
            if (_error != null) ...[
              const SizedBox(height: 8),
              Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
            ],
          ],
        ),
      ),
      actions: [
        TextButton(onPressed: _saving ? null : () => Navigator.of(context).pop(false), child: const Text('Cancel')),
        FilledButton(
          onPressed: _saving || _partnerId == null ? null : _submit,
          child: _saving
              ? const SizedBox(height: 16, width: 16, child: CircularProgressIndicator(strokeWidth: 2))
              : const Text('Reassign'),
        ),
      ],
    );
  }
}
