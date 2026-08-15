import { prisma } from "@/infrastructure/db/prisma";

import type {
  AvailabilityBoard,
  EmployeeAvailabilityItem,
  EmployeeAvailabilityStatus,
} from "@/types/deployment";

type AvailabilityQuery = {
  department?: string;
  designation?: string;
  search?: string;
};

function startOfDay(date: Date): Date {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function endOfDay(date: Date): Date {
  const value = new Date(date);
  value.setHours(23, 59, 59, 999);
  return value;
}

function isOnApprovedLeaveToday(
  leaves: Array<{ startDate: Date; endDate: Date }>,
  todayStart: Date,
  todayEnd: Date,
): boolean {
  return leaves.some(
    (leave) => leave.startDate <= todayEnd && leave.endDate >= todayStart,
  );
}

function findActiveDeployment(
  deployments: Array<{
    deploymentNo: string;
    startDate: Date;
    endDate: Date | null;
    status: string;
    client: { companyName: string };
  }>,
  todayStart: Date,
  todayEnd: Date,
) {
  return deployments.find((deployment) => {
    if (!["SCHEDULED", "ACTIVE"].includes(deployment.status)) {
      return false;
    }

    if (deployment.startDate > todayEnd) {
      return false;
    }

    if (deployment.endDate && deployment.endDate < todayStart) {
      return false;
    }

    return true;
  });
}

export async function getEmployeeAvailability(
  branchId: string,
  query: AvailabilityQuery = {},
): Promise<AvailabilityBoard> {
  const today = new Date();
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);

  const employees = await prisma.employee.findMany({
    where: {
      branchId,
      deletedAt: null,
      status: { not: "TERMINATED" },
      ...(query.department ? { department: query.department } : {}),
      ...(query.designation ? { designation: query.designation } : {}),
      ...(query.search
        ? {
            OR: [
              { firstName: { contains: query.search, mode: "insensitive" } },
              { lastName: { contains: query.search, mode: "insensitive" } },
              { employeeNo: { contains: query.search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      employeeNo: true,
      firstName: true,
      lastName: true,
      department: true,
      designation: true,
      deployments: {
        where: { deletedAt: null, status: { in: ["SCHEDULED", "ACTIVE"] } },
        select: {
          deploymentNo: true,
          startDate: true,
          endDate: true,
          status: true,
          client: { select: { companyName: true } },
        },
      },
      leaves: {
        where: {
          deletedAt: null,
          status: "APPROVED",
          startDate: { lte: todayEnd },
          endDate: { gte: todayStart },
        },
        select: {
          type: true,
          startDate: true,
          endDate: true,
        },
        orderBy: { startDate: "asc" },
        take: 1,
      },
    },
    orderBy: [{ department: "asc" }, { firstName: "asc" }],
  });

  const available: EmployeeAvailabilityItem[] = [];
  const deployed: EmployeeAvailabilityItem[] = [];
  const onLeave: EmployeeAvailabilityItem[] = [];

  for (const employee of employees) {
    const activeLeave = employee.leaves[0];
    const onLeaveToday =
      activeLeave &&
      isOnApprovedLeaveToday([activeLeave], todayStart, todayEnd);

    const activeDeployment = findActiveDeployment(
      employee.deployments,
      todayStart,
      todayEnd,
    );

    let status: EmployeeAvailabilityStatus = "AVAILABLE";

    if (onLeaveToday) {
      status = "ON_LEAVE";
    } else if (activeDeployment) {
      status = "DEPLOYED";
    }

    const item: EmployeeAvailabilityItem = {
      id: employee.id,
      employeeNo: employee.employeeNo,
      firstName: employee.firstName,
      lastName: employee.lastName,
      department: employee.department,
      designation: employee.designation,
      status,
      currentDeploymentNo: activeDeployment?.deploymentNo ?? null,
      currentClientName: activeDeployment?.client.companyName ?? null,
      leaveType: activeLeave?.type ?? null,
      leaveEndDate: activeLeave?.endDate.toISOString() ?? null,
    };

    if (status === "ON_LEAVE") {
      onLeave.push(item);
    } else if (status === "DEPLOYED") {
      deployed.push(item);
    } else {
      available.push(item);
    }
  }

  return {
    available,
    deployed,
    onLeave,
    summary: {
      available: available.length,
      deployed: deployed.length,
      onLeave: onLeave.length,
      total: employees.length,
    },
  };
}
