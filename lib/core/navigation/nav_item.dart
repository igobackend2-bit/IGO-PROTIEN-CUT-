import 'package:flutter/material.dart';

import '../permissions/permission_codes.dart';
import '../router/route_paths.dart';

class NavItem {
  final String label;
  final IconData icon;
  final String route;
  final List<String> anyOfPermissions;

  const NavItem({
    required this.label,
    required this.icon,
    required this.route,
    required this.anyOfPermissions,
  });
}

/// One entry per sidebar destination. `anyOfPermissions` mirrors the
/// permission each module's Edge Function actions require (see
/// supabase/functions/admin-*/index.ts) — a nav item is hidden unless the
/// current admin holds at least one of them, so the sidebar never advertises
/// a module the user can't do anything in.
const navItems = <NavItem>[
  NavItem(
    label: 'Dashboard',
    icon: Icons.dashboard_outlined,
    route: RoutePaths.dashboard,
    anyOfPermissions: [PermissionCodes.analyticsView],
  ),
  NavItem(
    label: 'Products',
    icon: Icons.inventory_2_outlined,
    route: RoutePaths.products,
    anyOfPermissions: [PermissionCodes.productsView, PermissionCodes.productsManage],
  ),
  NavItem(
    label: 'Inventory',
    icon: Icons.warehouse_outlined,
    route: RoutePaths.inventory,
    anyOfPermissions: [PermissionCodes.inventoryView, PermissionCodes.inventoryManage],
  ),
  NavItem(
    label: 'Orders',
    icon: Icons.receipt_long_outlined,
    route: RoutePaths.orders,
    anyOfPermissions: [PermissionCodes.ordersView, PermissionCodes.ordersManage],
  ),
  NavItem(
    label: 'Delivery',
    icon: Icons.local_shipping_outlined,
    route: RoutePaths.delivery,
    anyOfPermissions: [PermissionCodes.deliveryView, PermissionCodes.deliveryManage],
  ),
  NavItem(
    label: 'Customers',
    icon: Icons.people_outline,
    route: RoutePaths.users,
    anyOfPermissions: [PermissionCodes.usersView],
  ),
  NavItem(
    label: 'Support',
    icon: Icons.support_agent_outlined,
    route: RoutePaths.support,
    anyOfPermissions: [PermissionCodes.supportManage],
  ),
  NavItem(
    label: 'Coupons',
    icon: Icons.sell_outlined,
    route: RoutePaths.coupons,
    anyOfPermissions: [PermissionCodes.couponsManage],
  ),
  NavItem(
    label: 'Notifications',
    icon: Icons.campaign_outlined,
    route: RoutePaths.notifications,
    anyOfPermissions: [PermissionCodes.notificationsSend],
  ),
  NavItem(
    label: 'Analytics',
    icon: Icons.insights_outlined,
    route: RoutePaths.analytics,
    anyOfPermissions: [PermissionCodes.analyticsView],
  ),
  NavItem(
    label: 'Reports',
    icon: Icons.summarize_outlined,
    route: RoutePaths.reports,
    anyOfPermissions: [PermissionCodes.reportsGenerate],
  ),
  NavItem(
    label: 'Role Management',
    icon: Icons.admin_panel_settings_outlined,
    route: RoutePaths.roles,
    anyOfPermissions: [PermissionCodes.rolesManage],
  ),
];
