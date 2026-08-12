import {
  Drumstick,
  Beef,
  Fish,
  Sun,
  Egg,
  UtensilsCrossed,
  Flame,
  Award,
  Snowflake,
  ChefHat,
  Sandwich,
  Gift,
  Truck,
  Tag,
  Leaf,
  ShieldCheck,
  Globe,
  Sprout,
  Thermometer,
  Package,
  Scissors,
  Ban,
  Repeat,
  ShoppingCart,
  PackageCheck,
  Zap,
  Star,
  Heart,
  Clock,
  MapPin,
  Sparkles,
  type LucideIcon
} from 'lucide-react';

/**
 * Maps the icon NAME stored in a content block to its Lucide component.
 *
 * Content blocks live in Postgres as jsonb, so an icon has to be a string —
 * you can't serialise a React component. This is the single place that
 * translation happens.
 *
 * An unrecognised or missing name resolves to `Sparkles` rather than throwing,
 * so a typo in the admin degrades to a neutral icon instead of a blank page.
 * To add a new icon: import it above and add it to the map. Nothing else needs
 * to change.
 */
const ICONS: Record<string, LucideIcon> = {
  Drumstick,
  Beef,
  Fish,
  Sun,
  Egg,
  UtensilsCrossed,
  Flame,
  Award,
  Snowflake,
  ChefHat,
  Sandwich,
  Gift,
  Truck,
  Tag,
  Leaf,
  ShieldCheck,
  Globe,
  Sprout,
  Thermometer,
  Package,
  Scissors,
  Ban,
  Repeat,
  ShoppingCart,
  PackageCheck,
  Zap,
  Star,
  Heart,
  Clock,
  MapPin,
  Sparkles
};

export function resolveIcon(name: string | undefined | null): LucideIcon {
  if (!name) return Sparkles;
  return ICONS[name] ?? Sparkles;
}

/** Names available to the admin, for a future icon-picker dropdown. */
export const ICON_NAMES = Object.keys(ICONS).sort();
