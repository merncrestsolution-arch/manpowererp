import { isWithinGpsRadius } from "@/lib/geo";

type ValidateGpsParams = {
  latitude: number;
  longitude: number;
  targetLat: number | null;
  targetLng: number | null;
};

type ValidateGpsResult = { success: true } | { success: false; error: string };

export function validateGpsCheckin({
  latitude,
  longitude,
  targetLat,
  targetLng,
}: ValidateGpsParams): ValidateGpsResult {
  if (targetLat === null || targetLng === null) {
    return {
      success: false,
      error: "Work location does not have GPS coordinates configured",
    };
  }

  if (!isWithinGpsRadius(latitude, longitude, targetLat, targetLng)) {
    return {
      success: false,
      error: "You are outside the allowed check-in radius for this location",
    };
  }

  return { success: true };
}
