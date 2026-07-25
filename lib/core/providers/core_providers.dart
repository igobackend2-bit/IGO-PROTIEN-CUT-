import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../network/edge_function_client.dart';

final supabaseClientProvider = Provider<SupabaseClient>((ref) {
  return Supabase.instance.client;
});

final edgeFunctionClientProvider = Provider<EdgeFunctionClient>((ref) {
  return EdgeFunctionClient(ref.watch(supabaseClientProvider));
});

/// Fires on every Supabase auth state change (sign-in, sign-out, token
/// refresh) — the single stream the router redirect and the permissions
/// controller both key off of.
final authStateChangesProvider = StreamProvider<AuthState>((ref) {
  return ref.watch(supabaseClientProvider).auth.onAuthStateChange;
});
