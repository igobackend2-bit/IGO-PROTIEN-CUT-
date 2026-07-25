import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../domain/category.dart';
import '../categories_controller.dart';

Future<bool?> showCategoryFormDialog(BuildContext context, {ProductCategory? existing}) {
  return showDialog<bool>(
    context: context,
    builder: (context) => CategoryFormDialog(existing: existing),
  );
}

class CategoryFormDialog extends ConsumerStatefulWidget {
  final ProductCategory? existing;

  const CategoryFormDialog({super.key, this.existing});

  @override
  ConsumerState<CategoryFormDialog> createState() => _CategoryFormDialogState();
}

class _CategoryFormDialogState extends ConsumerState<CategoryFormDialog> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _name;
  late final TextEditingController _emoji;
  late final TextEditingController _displayOrder;
  bool _saving = false;
  String? _error;

  bool get _isEdit => widget.existing != null;

  @override
  void initState() {
    super.initState();
    _name = TextEditingController(text: widget.existing?.name ?? '');
    _emoji = TextEditingController(text: widget.existing?.emoji ?? '');
    _displayOrder = TextEditingController(text: (widget.existing?.displayOrder ?? 0).toString());
  }

  @override
  void dispose() {
    _name.dispose();
    _emoji.dispose();
    _displayOrder.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      final controller = ref.read(categoriesControllerProvider.notifier);
      if (_isEdit) {
        await controller.updateCategory(
          widget.existing!.id,
          name: _name.text.trim(),
          emoji: _emoji.text.trim(),
          displayOrder: int.tryParse(_displayOrder.text.trim()),
        );
      } else {
        await controller.create(
          name: _name.text.trim(),
          emoji: _emoji.text.trim().isEmpty ? null : _emoji.text.trim(),
          displayOrder: int.tryParse(_displayOrder.text.trim()),
        );
      }
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
    return AlertDialog(
      title: Text(_isEdit ? 'Edit category' : 'New category'),
      content: Form(
        key: _formKey,
        child: SizedBox(
          width: 360,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextFormField(
                controller: _name,
                decoration: const InputDecoration(labelText: 'Name'),
                validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(controller: _emoji, decoration: const InputDecoration(labelText: 'Emoji')),
              const SizedBox(height: 12),
              TextFormField(
                controller: _displayOrder,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'Display order'),
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
          onPressed: _saving ? null : _save,
          child: _saving
              ? const SizedBox(height: 16, width: 16, child: CircularProgressIndicator(strokeWidth: 2))
              : const Text('Save'),
        ),
      ],
    );
  }
}
