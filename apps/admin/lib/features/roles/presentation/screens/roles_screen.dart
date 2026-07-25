import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/permissions/permission_codes.dart';
import '../../../../core/permissions/permissions_controller.dart';
import '../../../../core/providers/core_providers.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/confirm_dialog.dart';
import '../../../../core/widgets/empty_state_view.dart';
import '../../../../core/widgets/error_retry_view.dart';
import '../../../../core/widgets/loading_view.dart';
import '../roles_providers.dart';
import '../widgets/grant_role_dialog.dart';

class RolesScreen extends ConsumerStatefulWidget {
  const RolesScreen({super.key});

  @override
  ConsumerState<RolesScreen> createState() => _RolesScreenState();
}

class _RolesScreenState extends ConsumerState<RolesScreen> with SingleTickerProviderStateMixin {
  late final TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final hasAccess = ref.watch(permissionsControllerProvider).value?.contains(PermissionCodes.rolesManage) ?? false;

    if (!hasAccess) {
      return const EmptyStateView(
        message: "You don't have access to Role Management.",
        icon: Icons.lock_outline,
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Role Management', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w700)),
        const SizedBox(height: 12),
        TabBar(
          controller: _tabController,
          isScrollable: true,
          tabAlignment: TabAlignment.start,
          tabs: const [Tab(text: 'Admin users'), Tab(text: 'Roles & permissions')],
        ),
        const SizedBox(height: 16),
        Expanded(
          child: TabBarView(
            controller: _tabController,
            children: const [_AdminsTab(), _RolesTab()],
          ),
        ),
      ],
    );
  }
}

class _AdminsTab extends ConsumerWidget {
  const _AdminsTab();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final adminsAsync = ref.watch(adminsControllerProvider);
    final currentUserId = ref.watch(supabaseClientProvider).auth.currentUser?.id;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Align(
          alignment: Alignment.centerRight,
          child: FilledButton.icon(
            onPressed: () => showGrantRoleDialog(context),
            icon: const Icon(Icons.add),
            label: const Text('Grant role'),
          ),
        ),
        const SizedBox(height: 12),
        Expanded(
          child: adminsAsync.when(
            loading: () => const LoadingView(),
            error: (e, _) => ErrorRetryView(
              message: e.toString(),
              onRetry: () => ref.read(adminsControllerProvider.notifier).refresh(),
            ),
            data: (admins) {
              if (admins.isEmpty) return const EmptyStateView(message: 'No admins yet.');
              return ListView.separated(
                itemCount: admins.length,
                separatorBuilder: (context, index) => const Divider(height: 1),
                itemBuilder: (context, index) {
                  final admin = admins[index];
                  final isSelf = admin.userId == currentUserId;
                  return ListTile(
                    leading: const Icon(Icons.admin_panel_settings_outlined),
                    title: Text(admin.userId),
                    subtitle: Text(
                      '${admin.roleName ?? 'No role'} · ${admin.isActive ? 'Active' : 'Revoked'} · since ${Formatters.date(admin.createdAt)}',
                    ),
                    trailing: admin.isActive
                        ? TextButton(
                            onPressed: isSelf
                                ? null
                                : () async {
                                    final confirmed = await showConfirmDialog(
                                      context,
                                      title: 'Revoke admin access?',
                                      message: "Revoke this user's admin access?",
                                      confirmLabel: 'Revoke',
                                      destructive: true,
                                    );
                                    if (confirmed) {
                                      await ref.read(adminsControllerProvider.notifier).revoke(admin.userId);
                                    }
                                  },
                            child: Text(isSelf ? "Can't revoke self" : 'Revoke'),
                          )
                        : null,
                  );
                },
              );
            },
          ),
        ),
      ],
    );
  }
}

class _RolesTab extends ConsumerWidget {
  const _RolesTab();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final rolesAsync = ref.watch(rolesControllerProvider);

    return rolesAsync.when(
      loading: () => const LoadingView(),
      error: (e, _) => ErrorRetryView(
        message: e.toString(),
        onRetry: () => ref.read(rolesControllerProvider.notifier).refresh(),
      ),
      data: (roles) {
        if (roles.isEmpty) return const EmptyStateView(message: 'No roles found.');
        return ListView.separated(
          itemCount: roles.length,
          separatorBuilder: (context, index) => const Divider(height: 1),
          itemBuilder: (context, index) {
            final role = roles[index];
            return ExpansionTile(
              title: Text(role.name),
              subtitle: role.description != null ? Text(role.description!) : null,
              children: [
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: role.permissions.isEmpty
                        ? [const Text('No permissions granted.')]
                        : [
                            for (final p in role.permissions)
                              Chip(label: Text(p.code), visualDensity: VisualDensity.compact),
                          ],
                  ),
                ),
              ],
            );
          },
        );
      },
    );
  }
}
