const EARTH_RADIUS_METERS = 6_371_000;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function haversineDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_METERS * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getAttendanceGpsRadiusMeters(): number {
  const configured = Number(process.env.ATTENDANCE_GPS_RADIUS_METERS ?? "100");

  if (!Number.isFinite(configured) || configured <= 0) {
    return 100;
  }

  return configured;
}

export function isWithinGpsRadius(
  userLat: number,
  userLng: number,
  targetLat: number,
  targetLng: number,
  radiusMeters = getAttendanceGpsRadiusMeters(),
): boolean {
  return (
    haversineDistanceMeters(userLat, userLng, targetLat, targetLng) <=
    radiusMeters
  );
}
