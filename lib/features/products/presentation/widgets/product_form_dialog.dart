// ignore_for_file: avoid_web_libraries_in_flutter
import 'dart:async';
import 'dart:js_interop';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:web/web.dart' as web;

import '../../domain/category.dart';
import '../../domain/product.dart';
import '../categories_controller.dart';
import '../products_providers.dart';

/// Create/edit form for a single product. Field set mirrors
/// `PRODUCT_FIELDS` in admin-products/index.ts exactly — nothing more,
/// nothing less. The primary photo is a real upload to the `product-images`
/// Storage bucket (Phase 18b) — the same bucket, path convention, and
/// `products.manage`-gated RLS policy the customer app's own admin
/// photo-upload screen already uses — rather than a pasted URL.
Future<bool?> showProductFormDialog(BuildContext context, {Product? existing}) {
  return showDialog<bool>(
    context: context,
    builder: (context) => ProductFormDialog(existing: existing),
  );
}

class ProductFormDialog extends ConsumerStatefulWidget {
  final Product? existing;

  const ProductFormDialog({super.key, this.existing});

  @override
  ConsumerState<ProductFormDialog> createState() => _ProductFormDialogState();
}

class _ProductFormDialogState extends ConsumerState<ProductFormDialog> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _name;
  late final TextEditingController _description;
  late final TextEditingController _price;
  late final TextEditingController _imageUrls;
  late final TextEditingController _weight;
  late final TextEditingController _protein;
  late final TextEditingController _fat;
  late final TextEditingController _storageInstruction;
  late final TextEditingController _brand;
  late final TextEditingController _ingredients;
  late final TextEditingController _cookingTips;
  late final TextEditingController _recipeIdeas;
  late final TextEditingController _stockQuantity;
  late final TextEditingController _lowStockThreshold;
  String? _category;
  String? _imageUrl;
  bool _isAvailable = true;
  bool _saving;
  bool _uploadingImage = false;
  String? _error;

  bool get _isEdit => widget.existing != null;

  _ProductFormDialogState() : _saving = false;

  @override
  void initState() {
    super.initState();
    final p = widget.existing;
    _name = TextEditingController(text: p?.name ?? '');
    _description = TextEditingController(text: p?.description ?? '');
    _price = TextEditingController(text: p == null ? '' : p.price.toString());
    _imageUrl = p?.imageUrl;
    _imageUrls = TextEditingController(text: p?.imageUrls.join(', ') ?? '');
    _weight = TextEditingController(text: p?.weight ?? '');
    _protein = TextEditingController(text: p?.proteinPer100g?.toString() ?? '');
    _fat = TextEditingController(text: p?.fatPer100g?.toString() ?? '');
    _storageInstruction = TextEditingController(text: p?.storageInstruction ?? '');
    _brand = TextEditingController(text: p?.brand ?? '');
    _ingredients = TextEditingController(text: p?.ingredients ?? '');
    _cookingTips = TextEditingController(text: p?.cookingTips ?? '');
    _recipeIdeas = TextEditingController(text: p?.recipeIdeas ?? '');
    _stockQuantity = TextEditingController(text: (p?.stockQuantity ?? 0).toString());
    _lowStockThreshold = TextEditingController(text: (p?.lowStockThreshold ?? 10).toString());
    _category = p?.category;
    _isAvailable = p?.isAvailable ?? true;
  }

  @override
  void dispose() {
    for (final c in [
      _name,
      _description,
      _price,
      _imageUrls,
      _weight,
      _protein,
      _fat,
      _storageInstruction,
      _brand,
      _ingredients,
      _cookingTips,
      _recipeIdeas,
      _stockQuantity,
      _lowStockThreshold,
    ]) {
      c.dispose();
    }
    super.dispose();
  }

  /// Uses `package:web` (not the legacy `dart:html`, whose typed-data
  /// interop — the `FileReader.result as ByteBuffer` cast — no longer holds
  /// up on current Dart SDKs) for a raw file input. Calling `.click()` as
  /// the very first, fully synchronous statement (before any await) is what
  /// keeps the OS file dialog's user-activation trust intact; deferring it
  /// even one microtask (as `image_picker`'s own web implementation does)
  /// makes Chrome silently refuse to open the dialog at all.
  Future<void> _pickAndUploadImage() async {
    final input = web.document.createElement('input') as web.HTMLInputElement;
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    web.document.body?.append(input);
    input.click();

    final changed = Completer<void>();
    input.addEventListener('change', (web.Event _) {
      if (!changed.isCompleted) changed.complete();
    }.toJS);
    await changed.future;

    final files = input.files;
    final file = (files != null && files.length > 0) ? files.item(0) : null;
    input.remove();
    if (file == null) return;

    setState(() {
      _uploadingImage = true;
      _error = null;
    });
    try {
      final buffer = await file.arrayBuffer().toDart;
      final bytes = buffer.toDart.asUint8List();
      final ext = file.name.contains('.') ? file.name.split('.').last.toLowerCase() : 'jpg';
      final url = await ref.read(productsRepositoryProvider).uploadImage(
            bytes,
            fileExt: ext,
            productId: widget.existing?.id,
          );
      if (mounted) setState(() => _imageUrl = url);
    } catch (e) {
      if (mounted) setState(() => _error = 'Image upload failed: $e');
    } finally {
      if (mounted) setState(() => _uploadingImage = false);
    }
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _saving = true;
      _error = null;
    });
    final product = Product(
      id: widget.existing?.id ?? '',
      name: _name.text.trim(),
      description: _description.text.trim().isEmpty ? null : _description.text.trim(),
      price: num.tryParse(_price.text.trim()) ?? 0,
      imageUrl: _imageUrl,
      category: _category,
      weight: _weight.text.trim().isEmpty ? null : _weight.text.trim(),
      proteinPer100g: num.tryParse(_protein.text.trim()),
      fatPer100g: num.tryParse(_fat.text.trim()),
      storageInstruction: _storageInstruction.text.trim().isEmpty ? null : _storageInstruction.text.trim(),
      brand: _brand.text.trim().isEmpty ? null : _brand.text.trim(),
      isAvailable: _isAvailable,
      imageUrls: _imageUrls.text.split(',').map((e) => e.trim()).where((e) => e.isNotEmpty).toList(),
      ingredients: _ingredients.text.trim().isEmpty ? null : _ingredients.text.trim(),
      cookingTips: _cookingTips.text.trim().isEmpty ? null : _cookingTips.text.trim(),
      recipeIdeas: _recipeIdeas.text.trim().isEmpty ? null : _recipeIdeas.text.trim(),
      stockQuantity: int.tryParse(_stockQuantity.text.trim()) ?? 0,
      lowStockThreshold: int.tryParse(_lowStockThreshold.text.trim()) ?? 10,
    );
    try {
      final repo = ref.read(productsRepositoryProvider);
      if (_isEdit) {
        await repo.update(widget.existing!.id, product);
      } else {
        await repo.create(product);
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
    final categoriesAsync = ref.watch(categoriesControllerProvider);
    final categories = categoriesAsync.value ?? const <ProductCategory>[];

    return Dialog(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 640, maxHeight: 680),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(_isEdit ? 'Edit product' : 'New product', style: Theme.of(context).textTheme.titleLarge),
                const SizedBox(height: 16),
                Expanded(
                  child: SingleChildScrollView(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _imageUploadSection(context),
                        const SizedBox(height: 16),
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(flex: 2, child: _field(_name, 'Name', required: true)),
                            const SizedBox(width: 12),
                            Expanded(
                              child: _field(_price, 'Price', keyboardType: TextInputType.number, required: true),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        DropdownButtonFormField<String>(
                          initialValue: _category,
                          decoration: const InputDecoration(labelText: 'Category'),
                          items: [
                            for (final c in categories)
                              DropdownMenuItem(value: c.name, child: Text('${c.emoji ?? ''} ${c.name}'.trim())),
                          ],
                          onChanged: (v) => setState(() => _category = v),
                        ),
                        const SizedBox(height: 12),
                        _field(_description, 'Description', maxLines: 2),
                        const SizedBox(height: 12),
                        _row([
                          _field(_weight, 'Weight (e.g. 500g)'),
                          _field(_brand, 'Brand'),
                        ]),
                        const SizedBox(height: 12),
                        _row([
                          _field(_protein, 'Protein / 100g', keyboardType: TextInputType.number),
                          _field(_fat, 'Fat / 100g', keyboardType: TextInputType.number),
                        ]),
                        const SizedBox(height: 12),
                        _row([
                          _field(_stockQuantity, 'Stock quantity', keyboardType: TextInputType.number),
                          _field(_lowStockThreshold, 'Low stock threshold', keyboardType: TextInputType.number),
                        ]),
                        const SizedBox(height: 12),
                        _field(_imageUrls, 'Additional image URLs (comma-separated)'),
                        const SizedBox(height: 12),
                        _field(_storageInstruction, 'Storage instruction'),
                        const SizedBox(height: 12),
                        _field(_ingredients, 'Ingredients', maxLines: 2),
                        const SizedBox(height: 12),
                        _field(_cookingTips, 'Cooking tips', maxLines: 2),
                        const SizedBox(height: 12),
                        _field(_recipeIdeas, 'Recipe ideas', maxLines: 2),
                        const SizedBox(height: 8),
                        SwitchListTile(
                          contentPadding: EdgeInsets.zero,
                          title: const Text('Available (published)'),
                          value: _isAvailable,
                          onChanged: (v) => setState(() => _isAvailable = v),
                        ),
                        if (_error != null) ...[
                          const SizedBox(height: 8),
                          Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
                        ],
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
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
                          : Text(_isEdit ? 'Save' : 'Create'),
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

  Widget _imageUploadSection(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Photo', style: Theme.of(context).textTheme.labelLarge),
        const SizedBox(height: 8),
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(14),
              child: Container(
                width: 96,
                height: 96,
                color: scheme.surfaceContainerHighest,
                child: _uploadingImage
                    ? const Center(child: CircularProgressIndicator(strokeWidth: 2))
                    : (_imageUrl == null || _imageUrl!.isEmpty)
                        ? Icon(Icons.image_outlined, color: scheme.onSurfaceVariant, size: 32)
                        : Image.network(
                            _imageUrl!,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) =>
                                Icon(Icons.broken_image_outlined, color: scheme.onSurfaceVariant, size: 32),
                          ),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  FilledButton.tonalIcon(
                    onPressed: _uploadingImage ? null : _pickAndUploadImage,
                    icon: const Icon(Icons.upload_outlined, size: 18),
                    label: Text(_imageUrl == null || _imageUrl!.isEmpty ? 'Upload photo' : 'Change photo'),
                  ),
                  if (_imageUrl != null && _imageUrl!.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    TextButton(
                      onPressed: _uploadingImage ? null : () => setState(() => _imageUrl = null),
                      child: const Text('Remove photo'),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _row(List<Widget> children) => Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          for (var i = 0; i < children.length; i++) ...[
            if (i > 0) const SizedBox(width: 12),
            Expanded(child: children[i]),
          ],
        ],
      );

  Widget _field(
    TextEditingController controller,
    String label, {
    int maxLines = 1,
    TextInputType? keyboardType,
    bool required = false,
  }) {
    return TextFormField(
      controller: controller,
      maxLines: maxLines,
      keyboardType: keyboardType,
      decoration: InputDecoration(labelText: label),
      validator: required ? (v) => (v == null || v.trim().isEmpty) ? 'Required' : null : null,
    );
  }
}
