import type {
  EmployeeAttendanceStatus,
  LeaveRequestItem,
} from "@/types/employee";
import type { PayslipListItem } from "@/types/payroll";

export type MobileDashboard = {
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    employeeNo: string;
  };
  todayAttendance: EmployeeAttendanceStatus;
  pendingLeaveCount: number;
  upcomingLeave: LeaveRequestItem | null;
  latestPayslip: PayslipListItem | null;
  unreadNotifications: number;
  activeDeployment: {
    workLocationName: string;
    shiftName: string;
    shiftStart: string;
    shiftEnd: string;
  } | null;
};

export type MobileNotificationItem = {
  id: string;
  title: string;
  body: string;
  type: string;
  data: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
};
