import {
  mapEmployeeToDetail,
  parseOptionalDate,
} from "@/application/mappers/employee-mapper";
import { mapCandidateToDetail } from "@/application/mappers/recruitment-mapper";
import { prisma } from "@/infrastructure/db/prisma";
import { formatEmployeeNo, getNextSequenceValue } from "@/lib/sequence";

import type { PlaceCandidateInput } from "@/application/dto/place-candidate.schema";
import type { EmployeeDetail } from "@/types/employee";
import type { CandidateDetail } from "@/types/recruitment";

type PlaceCandidateParams = {
  branchId: string;
  candidateId: string;
  userId: string;
  input: PlaceCandidateInput;
};

type PlaceCandidateResult =
  | {
      success: true;
      candidate: CandidateDetail;
      employee: EmployeeDetail;
    }
  | { success: false; error: string };

export async function placeCandidate({
  branchId,
  candidateId,
  userId,
  input,
}: PlaceCandidateParams): Promise<PlaceCandidateResult> {
  const existing = await prisma.candidate.findFirst({
    where: { id: candidateId, branchId, deletedAt: null },
    include: { jobOpening: { select: { title: true } } },
  });

  if (!existing) {
    return { success: false, error: "Candidate not found" };
  }

  if (existing.status !== "OFFERED") {
    return {
      success: false,
      error: "Candidate must be in OFFERED status to place",
    };
  }

  const joinedAt = parseOptionalDate(input.joinedAt);

  if (!joinedAt) {
    return { success: false, error: "Invalid joining date" };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const sequenceValue = await getNextSequenceValue(
        tx,
        branchId,
        "employee_no",
      );
      const employeeNo = formatEmployeeNo(sequenceValue);

      const employee = await tx.employee.create({
        data: {
          branchId,
          employeeNo,
          firstName: existing.firstName,
          lastName: existing.lastName,
          email: existing.email,
          phone: existing.phone,
          nic: existing.nic,
          department: input.department,
          designation: input.designation,
          employmentType: input.employmentType,
          status: "ACTIVE",
          joinedAt,
          basicSalary: input.basicSalary,
          createdBy: userId,
          updatedBy: userId,
        },
      });

      const candidate = await tx.candidate.update({
        where: { id: candidateId },
        data: {
          status: "PLACED",
          placedEmployeeId: employee.id,
          updatedBy: userId,
        },
        include: { jobOpening: { select: { title: true } } },
      });

      await tx.candidateStatusHistory.create({
        data: {
          candidateId,
          fromStatus: "OFFERED",
          toStatus: "PLACED",
          changedBy: userId,
          remarks: `Placed as employee ${employeeNo}`,
        },
      });

      return { candidate, employee };
    });

    return {
      success: true,
      candidate: mapCandidateToDetail(result.candidate),
      employee: mapEmployeeToDetail(result.employee),
    };
  } catch {
    return { success: false, error: "Failed to place candidate" };
  }
}
