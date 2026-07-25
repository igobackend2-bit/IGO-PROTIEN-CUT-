import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../products/domain/product.dart';
import '../inventory_providers.dart';

enum _AdjustmentMode { stockIn, stockOut, adjustment }

Future<bool?> showStockAdjustmentDialog(BuildContext context, Product product) {
  return showDialog<bool>(
    context: context,
    builder: (context) => _StockAdjustmentDialog(product: product),
  );
}

class _StockAdjustmentDialog extends ConsumerStatefulWidget {
  final Product product;

  const _StockAdjustmentDialog({required this.product});

  @override
  ConsumerState<_StockAdjustmentDialog> createState() => _StockAdjustmentDialogState();
}

class _StockAdjustmentDialogState extends ConsumerState<_StockAdjustmentDialog> {
  final _formKey = GlobalKey<FormState>();
  final _quantity = TextEditingController();
  final _reason = TextEditingController();
  _AdjustmentMode _mode = _AdjustmentMode.stockIn;
  bool _saving = false;
  String? _error;

  @override
  void dispose() {
    _quantity.dispose();
    _reason.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _saving = true;
      _error = null;
    });
    final value = int.parse(_quantity.text.trim());
    final reason = _reason.text.trim();
    try {
      final repo = ref.read(inventoryRepositoryProvider);
      switch (_mode) {
        case _AdjustmentMode.stockIn:
          await repo.stockIn(productId: widget.product.id, quantity: value, reason: reason);
        case _AdjustmentMode.stockOut:
          await repo.stockOut(productId: widget.product.id, quantity: value, reason: reason);
        case _AdjustmentMode.adjustment:
          await repo.adjustment(productId: widget.product.id, newStock: value, reason: reason);
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
      title: Text('Adjust stock — ${widget.product.name}'),
      content: SizedBox(
        width: 380,
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Current stock: ${widget.product.stockQuantity}', style: Theme.of(context).textTheme.bodyMedium),
              const SizedBox(height: 16),
              SegmentedButton<_AdjustmentMode>(
                segments: const [
                  ButtonSegment(value: _AdjustmentMode.stockIn, label: Text('Stock in')),
                  ButtonSegment(value: _AdjustmentMode.stockOut, label: Text('Stock out')),
                  ButtonSegment(value: _AdjustmentMode.adjustment, label: Text('Set exact')),
                ],
                selected: {_mode},
                onSelectionChanged: (s) => setState(() => _mode = s.first),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _quantity,
                keyboardType: TextInputType.number,
                decoration: InputDecoration(
                  labelText: _mode == _AdjustmentMode.adjustment ? 'New stock quantity' : 'Quantity',
                ),
                validator: (v) {
                  final n = int.tryParse(v?.trim() ?? '');
                  if (n == null || n < 0) return 'Enter a valid non-negative number';
                  return null;
                },
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _reason,
                decoration: const InputDecoration(labelText: 'Reason (optional)'),
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
          onPressed: _saving ? null : _submit,
          child: _saving
              ? const SizedBox(height: 16, width: 16, child: CircularProgressIndicator(strokeWidth: 2))
              : const Text('Confirm'),
        ),
      ],
    );
  }
}
