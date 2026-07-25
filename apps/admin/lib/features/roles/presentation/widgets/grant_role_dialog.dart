import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../roles_providers.dart';

Future<bool?> showGrantRoleDialog(BuildContext context) {
  return showDialog<bool>(context: context, builder: (context) => const _GrantRoleDialog());
}

class _GrantRoleDialog extends ConsumerStatefulWidget {
  const _GrantRoleDialog();

  @override
  ConsumerState<_GrantRoleDialog> createState() => _GrantRoleDialogState();
}

class _GrantRoleDialogState extends ConsumerState<_GrantRoleDialog> {
  final _formKey = GlobalKey<FormState>();
  final _userId = TextEditingController();
  String? _roleName;
  bool _saving = false;
  String? _error;

  @override
  void dispose() {
    _userId.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate() || _roleName == null) return;
    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      await ref
          .read(adminsControllerProvider.notifier)
          .grant(userId: _userId.text.trim(), roleName: _roleName!);
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
    final roles = ref.watch(rolesControllerProvider).value ?? const [];
    return AlertDialog(
      title: const Text('Grant admin role'),
      content: Form(
        key: _formKey,
        child: SizedBox(
          width: 380,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              TextFormField(
                controller: _userId,
                decoration: const InputDecoration(labelText: 'User ID (UUID)'),
                validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                initialValue: _roleName,
                decoration: const InputDecoration(labelText: 'Role'),
                items: [for (final r in roles) DropdownMenuItem(value: r.name, child: Text(r.name))],
                onChanged: (v) => setState(() => _roleName = v),
              ),
              if (_error != null) ...[
                const SizedBox(height: 8),
                Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
              ],
            ],
          ),
        ),
      ),
      actions: [
        TextButton(onPressed: _saving ? null : () => Navigator.of(context).pop(false), child: const Text('Cancel')),
        FilledButton(
          onPressed: _saving || _roleName == null ? null : _submit,
          child: _saving
              ? const SizedBox(height: 16, width: 16, child: CircularProgressIndicator(strokeWidth: 2))
              : const Text('Grant'),
        ),
      ],
    );
  }
}
