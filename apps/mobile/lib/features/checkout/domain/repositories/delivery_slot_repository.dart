import '../entities/delivery_slot.dart';

abstract class DeliverySlotRepository {
  /// Today's remaining slots (with enough lead time to prepare the order)
  /// plus tomorrow's full set.
  List<DeliverySlot> generateSlots();
}
