/**
 * Shared geo helpers for the delivery Edge Functions. Single source of
 * truth for distance/ETA math so assign-delivery, update-location and
 * estimate-eta can never compute it differently from one another.
 */

export interface LatLng {
  lat: number;
  lng: number;
}

/**
 * Single-warehouse pickup point. This app has one fulfillment location
 * today (Kanathur, Chennai — the same default shown on Home's delivery
 * location pill), so this constant stands in for a real `warehouses` table.
 * Swap this for a per-order/per-warehouse lookup once there's more than one.
 */
export const STORE_LOCATION: LatLng = { lat: 12.7969, lng: 80.2467 };

/** Below this distance from the destination, a partner counts as "Near You". */
export const NEAR_YOU_THRESHOLD_METERS = 500;

/** Assumed average urban delivery speed, used only for ETA estimation. */
const AVERAGE_SPEED_KMPH = 20;

const EARTH_RADIUS_METERS = 6371000;

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Great-circle distance between two points, in meters. */
export function distanceMeters(a: LatLng, b: LatLng): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return EARTH_RADIUS_METERS * c;
}

/** Straight-line ETA in whole minutes, given a distance in meters. */
export function etaMinutesFor(distance: number): number {
  const speedMetersPerMinute = (AVERAGE_SPEED_KMPH * 1000) / 60;
  return Math.max(1, Math.round(distance / speedMetersPerMinute));
}

export function randomOtp(digits = 4): string {
  const min = 10 ** (digits - 1);
  const max = 10 ** digits - 1;
  return String(Math.floor(min + Math.random() * (max - min + 1)));
}
