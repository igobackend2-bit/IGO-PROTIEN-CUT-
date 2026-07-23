import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../models/address_model.dart';
import '../../../../utils/app_colors.dart';

class AddressTypeSelector extends StatelessWidget {
  final AddressType selected;
  final ValueChanged<AddressType> onChanged;

  const AddressTypeSelector({super.key, required this.selected, required this.onChanged});

  IconData _iconFor(AddressType type) {
    switch (type) {
      case AddressType.home:
        return Icons.home_rounded;
      case AddressType.office:
        return Icons.business_rounded;
      case AddressType.other:
        return Icons.place_rounded;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      children: AddressType.values.map((type) {
        final isSelected = type == selected;
        return Expanded(
          child: GestureDetector(
            onTap: () => onChanged(type),
            child: Container(
              margin: EdgeInsets.only(right: type != AddressType.values.last ? 10 : 0),
              padding: const EdgeInsets.symmetric(vertical: 12),
              decoration: BoxDecoration(
                color: isSelected ? AppColors.primary : AppColors.surfaceLight,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: isSelected ? AppColors.primary : AppColors.inputBorder),
              ),
              child: Column(
                children: [
                  Icon(_iconFor(type), size: 18, color: isSelected ? Colors.white : AppColors.textSecondary),
                  const SizedBox(height: 4),
                  Text(
                    type.label,
                    style: GoogleFonts.outfit(fontSize: 11.5, fontWeight: FontWeight.w700, color: isSelected ? Colors.white : AppColors.textSecondary),
                  ),
                ],
              ),
            ),
          ),
        );
      }).toList(),
    );
  }
}
