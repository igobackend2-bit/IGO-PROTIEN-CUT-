import 'package:flutter/material.dart';

enum MembershipTier { bronze, silver, gold, platinum }

extension MembershipTierX on MembershipTier {
  String get label => switch (this) {
        MembershipTier.bronze => 'Bronze',
        MembershipTier.silver => 'Silver',
        MembershipTier.gold => 'Gold',
        MembershipTier.platinum => 'Platinum',
      };

  int get requiredPoints => switch (this) {
        MembershipTier.bronze => 0,
        MembershipTier.silver => 500,
        MembershipTier.gold => 1500,
        MembershipTier.platinum => 3000,
      };

  Color get color => switch (this) {
        MembershipTier.bronze => const Color(0xFFCD7F32),
        MembershipTier.silver => const Color(0xFF9E9E9E),
        MembershipTier.gold => const Color(0xFFF39C12),
        MembershipTier.platinum => const Color(0xFF7D3C98),
      };

  IconData get icon => switch (this) {
        MembershipTier.bronze => Icons.workspace_premium_outlined,
        MembershipTier.silver => Icons.workspace_premium_outlined,
        MembershipTier.gold => Icons.workspace_premium_rounded,
        MembershipTier.platinum => Icons.diamond_rounded,
      };

  List<String> get benefits => switch (this) {
        MembershipTier.bronze => const [
            'Earn 1 point per ₹10 spent',
            '2% cashback on every order',
          ],
        MembershipTier.silver => const [
            'Earn 1 point per ₹10 spent',
            '2% cashback on every order',
            'Priority customer support',
          ],
        MembershipTier.gold => const [
            'Earn 1 point per ₹10 spent',
            '2% cashback on every order',
            'Priority customer support',
            'Early access to flash sales',
          ],
        MembershipTier.platinum => const [
            'Earn 1 point per ₹10 spent',
            '2% cashback on every order',
            'Priority customer support',
            'Early access to flash sales',
            'Dedicated relationship manager',
          ],
      };

  MembershipTier? get next => switch (this) {
        MembershipTier.bronze => MembershipTier.silver,
        MembershipTier.silver => MembershipTier.gold,
        MembershipTier.gold => MembershipTier.platinum,
        MembershipTier.platinum => null,
      };

  static MembershipTier fromPoints(int points) {
    if (points >= MembershipTier.platinum.requiredPoints) return MembershipTier.platinum;
    if (points >= MembershipTier.gold.requiredPoints) return MembershipTier.gold;
    if (points >= MembershipTier.silver.requiredPoints) return MembershipTier.silver;
    return MembershipTier.bronze;
  }
}
