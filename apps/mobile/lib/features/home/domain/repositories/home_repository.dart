import '../entities/home_data.dart';

/// Contract for assembling Home screen data. The implementation decides
/// where each piece comes from (Supabase, local cache, static content) —
/// presentation code only ever talks to this interface.
abstract class HomeRepository {
  Future<HomeData> loadHomeData();
}
