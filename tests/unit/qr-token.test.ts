import { describe, expect, it } from "vitest";

import {
  createSignedCheckpointToken,
  verifySignedCheckpointToken,
} from "@/lib/qr-token";

describe("QR checkpoint token", () => {
  it("round-trips a signed checkpoint token", () => {
    process.env.ATTENDANCE_QR_SECRET = "test-secret";

    const token = createSignedCheckpointToken(
      "checkpoint-1",
      "location-1",
      new Date("2030-01-01T00:00:00.000Z"),
    );

    const parsed = verifySignedCheckpointToken(token);

    expect(parsed).not.toBeNull();
    expect(parsed?.checkpointId).toBe("checkpoint-1");
    expect(parsed?.workLocationId).toBe("location-1");
  });

  it("rejects tampered tokens", () => {
    process.env.ATTENDANCE_QR_SECRET = "test-secret";

    const token = createSignedCheckpointToken("a", "b", null);
    const tampered = `${token}x`;

    expect(verifySignedCheckpointToken(tampered)).toBeNull();
  });
});
