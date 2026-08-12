/// A push-delivery provider capable of registering this device for remote
/// notifications. In-app notifications (the Notification Center, driven by
/// Supabase Realtime) work fully without this — this interface exists so
/// wiring up real push delivery later (FCM) is a drop-in implementation,
/// not an architecture change.
///
/// Deliberately NOT wired to `firebase_messaging`/`firebase_core` here: those
/// packages require a real Firebase project (`google-services.json` /
/// `GoogleService-Info.plist`) and throw at `Firebase.initializeApp()` time
/// without one. Adding them unconfigured would break the build for no
/// functional gain — same reasoning as the RazorpayPaymentGateway stub.
abstract class PushNotificationGateway {
  Future<void> initialize();
  Future<String?> getDeviceToken();
  Future<void> registerToken({required String userId, required String token});
  Future<void> unregisterToken({required String userId});
}

/// Not implemented — no Firebase project is configured in this app yet.
/// Wire up `firebase_messaging` here (initialize(), get the FCM token,
/// upsert it into a `device_tokens` table keyed by user_id) once a real
/// Firebase project exists; every caller already expects this interface,
/// so nothing else needs to change to plug it in.
class FirebasePushNotificationGateway implements PushNotificationGateway {
  @override
  Future<void> initialize() {
    throw UnimplementedError('Firebase Cloud Messaging is not configured yet — no Firebase project is linked.');
  }

  @override
  Future<String?> getDeviceToken() {
    throw UnimplementedError('Firebase Cloud Messaging is not configured yet — no Firebase project is linked.');
  }

  @override
  Future<void> registerToken({required String userId, required String token}) {
    throw UnimplementedError('Firebase Cloud Messaging is not configured yet — no Firebase project is linked.');
  }

  @override
  Future<void> unregisterToken({required String userId}) {
    throw UnimplementedError('Firebase Cloud Messaging is not configured yet — no Firebase project is linked.');
  }
}
