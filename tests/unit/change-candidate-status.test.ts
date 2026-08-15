import { describe, expect, it, vi, beforeEach } from "vitest";

import { changeCandidateStatus } from "@/application/use-cases/change-candidate-status";
import { prisma } from "@/infrastructure/db/prisma";

vi.mock("@/infrastructure/db/prisma", () => ({
  prisma: {
    candidate: {
      findFirst: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

describe("changeCandidateStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error when candidate is not found", async () => {
    vi.mocked(prisma.candidate.findFirst).mockResolvedValue(null);

    const result = await changeCandidateStatus({
      branchId: "branch-1",
      candidateId: "can-missing",
      userId: "user-1",
      input: { status: "INTERVIEWED", remarks: "" },
    });

    expect(result).toEqual({ success: false, error: "Candidate not found" });
  });

  it("rejects status changes for placed candidates", async () => {
    vi.mocked(prisma.candidate.findFirst).mockResolvedValue({
      id: "can-1",
      status: "PLACED",
      branchId: "branch-1",
      deletedAt: null,
    } as never);

    const result = await changeCandidateStatus({
      branchId: "branch-1",
      candidateId: "can-1",
      userId: "user-1",
      input: { status: "INTERVIEWED", remarks: "" },
    });

    expect(result).toEqual({
      success: false,
      error: "Cannot change status of a placed candidate",
    });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
