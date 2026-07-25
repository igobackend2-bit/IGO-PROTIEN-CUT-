import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../domain/combo_pack.dart';
import '../combo_packs_list_controller.dart';
import '../coupons_providers.dart';

Future<bool?> showComboPackFormDialog(BuildContext context, {ComboPack? existing}) {
  return showDialog<bool>(context: context, builder: (context) => _ComboPackFormDialog(existing: existing));
}

class _ComboPackFormDialog extends ConsumerStatefulWidget {
  final ComboPack? existing;

  const _ComboPackFormDialog({this.existing});

  @override
  ConsumerState<_ComboPackFormDialog> createState() => _ComboPackFormDialogState();
}

class _ComboPackFormDialogState extends ConsumerState<_ComboPackFormDialog> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _title;
  late final TextEditingController _description;
  late final TextEditingController _discount;
  late final TextEditingController _bannerImageUrl;
  late final TextEditingController _items;
  String _bundleType = 'fixed';
  bool _saving = false;
  String? _error;

  bool get _isEdit => widget.existing != null;

  @override
  void initState() {
    super.initState();
    final p = widget.existing;
    _title = TextEditingController(text: p?.title ?? '');
    _description = TextEditingController(text: p?.description ?? '');
    _discount = TextEditingController(text: (p?.discount ?? 0).toString());
    _bannerImageUrl = TextEditingController(text: p?.bannerImageUrl ?? '');
    _items = TextEditingController(
      text: p?.items.map((e) => '${e.productId}:${e.quantity}').join(', ') ?? '',
    );
    _bundleType = p?.bundleType ?? 'fixed';
  }

  @override
  void dispose() {
    _title.dispose();
    _description.dispose();
    _discount.dispose();
    _bannerImageUrl.dispose();
    _items.dispose();
    super.dispose();
  }

  List<ComboPackItem> _parseItems() {
    return _items.text
        .split(',')
        .map((e) => e.trim())
        .where((e) => e.isNotEmpty)
        .map((e) {
          final parts = e.split(':');
          final quantity = parts.length > 1 ? int.tryParse(parts[1].trim()) ?? 1 : 1;
          return ComboPackItem(productId: parts[0].trim(), quantity: quantity);
        })
        .toList();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      final repo = ref.read(couponsRepositoryProvider);
      if (_isEdit) {
        await repo.updateComboPack(
          widget.existing!.id,
          title: _title.text.trim(),
          description: _description.text.trim(),
          discount: num.tryParse(_discount.text.trim()) ?? 0,
          bundleType: _bundleType,
          bannerImageUrl: _bannerImageUrl.text.trim(),
        );
      } else {
        await repo.createComboPack(
          title: _title.text.trim(),
          items: _parseItems(),
          description: _description.text.trim().isEmpty ? null : _description.text.trim(),
          discount: num.tryParse(_discount.text.trim()) ?? 0,
          bundleType: _bundleType,
          bannerImageUrl: _bannerImageUrl.text.trim().isEmpty ? null : _bannerImageUrl.text.trim(),
        );
      }
      await ref.read(comboPacksListControllerProvider.notifier).refresh();
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
    return Dialog(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 480, maxHeight: 560),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(_isEdit ? 'Edit combo pack' : 'New combo pack', style: Theme.of(context).textTheme.titleLarge),
                const SizedBox(height: 16),
                Expanded(
                  child: SingleChildScrollView(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        TextFormField(
                          controller: _title,
                          decoration: const InputDecoration(labelText: 'Title'),
                          validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: _description,
                          decoration: const InputDecoration(labelText: 'Description'),
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            Expanded(
                              child: DropdownButtonFormField<String>(
                                initialValue: _bundleType,
                                decoration: const InputDecoration(labelText: 'Bundle type'),
                                items: const [
                                  DropdownMenuItem(value: 'fixed', child: Text('Fixed')),
                                  DropdownMenuItem(value: 'pick_n', child: Text('Pick N')),
                                ],
                                onChanged: (v) => setState(() => _bundleType = v ?? 'fixed'),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: TextFormField(
                                controller: _discount,
                                keyboardType: TextInputType.number,
                                decoration: const InputDecoration(labelText: 'Discount'),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: _bannerImageUrl,
                          decoration: const InputDecoration(labelText: 'Banner image URL'),
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: _items,
                          enabled: !_isEdit,
                          decoration: const InputDecoration(
                            labelText: 'Items (productId:quantity, comma-separated)',
                            helperText: 'Only settable when creating — the backend has no item-edit action.',
                          ),
                          validator: _isEdit
                              ? null
                              : (v) => (v == null || v.trim().isEmpty) ? 'At least one item is required' : null,
                        ),
                        if (_error != null) ...[
                          const SizedBox(height: 8),
                          Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
                        ],
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    TextButton(
                      onPressed: _saving ? null : () => Navigator.of(context).pop(false),
                      child: const Text('Cancel'),
                    ),
                    const SizedBox(width: 8),
                    FilledButton(
                      onPressed: _saving ? null : _save,
                      child: _saving
                          ? const SizedBox(height: 16, width: 16, child: CircularProgressIndicator(strokeWidth: 2))
                          : const Text('Save'),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
