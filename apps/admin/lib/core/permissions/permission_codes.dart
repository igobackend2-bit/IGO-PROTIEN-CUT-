/// Every permission code seeded by `admin_permissions` in
/// supabase/migrations/phase18_admin.sql. Kept here as plain data (not
/// business logic) so the app can ask `admin_has_permission` about each one
/// at login time — the RPC itself remains the single source of truth for
/// whether a given admin actually holds it.
class PermissionCodes {
  static const productsView = 'products.view';
  static const productsManage = 'products.manage';
  static const inventoryView = 'inventory.view';
  static const inventoryManage = 'inventory.manage';
  static const ordersView = 'orders.view';
  static const ordersManage = 'orders.manage';
  static const paymentsManage = 'payments.manage';
  static const deliveryView = 'delivery.view';
  static const deliveryManage = 'delivery.manage';
  static const usersView = 'users.view';
  static const rolesManage = 'roles.manage';
  static const couponsManage = 'coupons.manage';
  static const reviewsModerate = 'reviews.moderate';
  static const supportManage = 'support.manage';
  static const notificationsSend = 'notifications.send';
  static const analyticsView = 'analytics.view';
  static const reportsGenerate = 'reports.generate';

  static const all = <String>[
    productsView,
    productsManage,
    inventoryView,
    inventoryManage,
    ordersView,
    ordersManage,
    paymentsManage,
    deliveryView,
    deliveryManage,
    usersView,
    rolesManage,
    couponsManage,
    reviewsModerate,
    supportManage,
    notificationsSend,
    analyticsView,
    reportsGenerate,
  ];
}
