import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../models/address_model.dart';
import '../../../../utils/app_colors.dart';
import '../providers/address_list_state.dart';
import '../providers/address_providers.dart';
import '../widgets/address_card.dart';
import '../widgets/address_empty_state.dart';
import '../widgets/address_error_state.dart';
import '../widgets/address_skeleton.dart';
import 'address_form_screen.dart';

class AddressListScreen extends ConsumerWidget {
  const AddressListScreen({super.key});

  void _openForm(BuildContext context, {Address? address}) {
    Navigator.push(context, MaterialPageRoute(builder: (_) => AddressFormScreen(existing: address)));
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    ref.listen(addressListProvider, (previous, next) {
      final message = next.feedbackMessage;
      if (message == null || message == previous?.feedbackMessage) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(message, style: GoogleFonts.outfit()),
          backgroundColor: next.feedbackIsError ? AppColors.error : AppColors.success,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
    });

    final state = ref.watch(addressListProvider);
    final notifier = ref.read(addressListProvider.notifier);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('My Addresses', style: GoogleFonts.outfit(fontWeight: FontWeight.w700, color: Colors.white)),
        backgroundColor: AppColors.primary,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.add_rounded, color: Colors.white),
            onPressed: () => _openForm(context),
          ),
        ],
      ),
      body: _buildBody(context, state, notifier),
    );
  }

  Widget _buildBody(BuildContext context, AddressListState state, AddressListNotifier notifier) {
    if (state.isLoadingFirst) return const AddressSkeleton();
    if (state.error != null) return AddressErrorState(onRetry: notifier.retry);
    if (state.isEmpty) {
      return RefreshIndicator(
        color: AppColors.primary,
        onRefresh: notifier.refresh,
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          children: [AddressEmptyState(onAddAddress: () => _openForm(context))],
        ),
      );
    }

    return RefreshIndicator(
      color: AppColors.primary,
      onRefresh: notifier.refresh,
      child: ListView.builder(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        itemCount: state.addresses.length,
        itemBuilder: (context, index) {
          final address = state.addresses[index];
          return AddressCard(
            address: address,
            onTap: () => _openForm(context, address: address),
            onDelete: () => notifier.deleteAddress(address),
            onSetDefault: () => notifier.setDefault(address),
          );
        },
      ),
    );
  }
}
