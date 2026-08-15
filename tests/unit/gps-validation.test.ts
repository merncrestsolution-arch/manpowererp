import { describe, expect, it } from "vitest";

import { validateGpsCheckin } from "@/application/use-cases/validate-gps-checkin";
import { haversineDistanceMeters, isWithinGpsRadius } from "@/lib/geo";

describe("GPS attendance validation", () => {
  it("rejects when work location coordinates are missing", () => {
    const result = validateGpsCheckin({
      latitude: 6.9271,
      longitude: 79.8612,
      targetLat: null,
      targetLng: null,
    });

    expect(result.success).toBe(false);
  });

  it("accepts coordinates within default radius", () => {
    const targetLat = 6.927079;
    const targetLng = 79.861244;

    expect(
      isWithinGpsRadius(
        targetLat + 0.0001,
        targetLng + 0.0001,
        targetLat,
        targetLng,
        100,
      ),
    ).toBe(true);
  });

  it("rejects coordinates outside radius", () => {
    const result = validateGpsCheckin({
      latitude: 6.95,
      longitude: 79.9,
      targetLat: 6.927079,
      targetLng: 79.861244,
    });

    expect(result.success).toBe(false);
  });

  it("calculates haversine distance as zero for identical points", () => {
    expect(haversineDistanceMeters(6.9, 79.8, 6.9, 79.8)).toBe(0);
  });
});
