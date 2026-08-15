import { listEmployeeLeaveRequests } from "@/application/use-cases/create-leave-request";
import { getEmployeeTodayAttendance } from "@/application/use-cases/list-attendance";
import { listPayslips } from "@/application/use-cases/run-payroll";
import { prisma } from "@/infrastructure/db/prisma";
import { getActiveDeploymentForEmployee } from "@/lib/employee-context";

import type { MobileDashboard } from "@/types/mobile";

type GetMobileDashboardParams = {
  branchId: string;
  employeeId: string;
  userId: string;
};

export async function getMobileDashboard({
  branchId,
  employeeId,
  userId,
}: GetMobileDashboardParams): Promise<MobileDashboard | null> {
  const employee = await prisma.employee.findFirst({
    where: { id: employeeId, branchId, deletedAt: null },
    select: {
      id: true,
      employeeNo: true,
      firstName: true,
      lastName: true,
    },
  });

  if (!employee) {
    return null;
  }

  const [todayAttendance, leaves, payslips, unreadNotifications, deployment] =
    await Promise.all([
      getEmployeeTodayAttendance(branchId, employeeId),
      listEmployeeLeaveRequests(branchId, employeeId),
      listPayslips({
        branchId,
        query: {
          employeeId,
          status: "FINALIZED",
          page: 1,
          pageSize: 1,
        },
      }),
      prisma.appNotification.count({
        where: { userId, isRead: false },
      }),
      getActiveDeploymentForEmployee(branchId, employeeId),
    ]);

  const pendingLeaveCount = leaves.filter(
    (leave) => leave.status === "PENDING",
  ).length;

  const now = new Date();
  const upcomingLeave =
    leaves
      .filter(
        (leave) =>
          leave.status === "APPROVED" && new Date(leave.endDate) >= now,
      )
      .sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
      )[0] ?? null;

  return {
    employee: {
      id: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      employeeNo: employee.employeeNo,
    },
    todayAttendance: todayAttendance ?? {
      status: "NOT_RECORDED",
      checkInTime: null,
      checkOutTime: null,
      workingHoursPercent: 0,
    },
    pendingLeaveCount,
    upcomingLeave,
    latestPayslip: payslips.items[0] ?? null,
    unreadNotifications,
    activeDeployment:
      deployment?.workLocation && deployment.shift
        ? {
            workLocationName: deployment.workLocation.name,
            shiftName: deployment.shift.name,
            shiftStart: deployment.shift.startTime,
            shiftEnd: deployment.shift.endTime,
          }
        : null,
  };
}
