export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "HR_MANAGER"
  | "FINANCE_MANAGER"
  | "RECRUITER"
  | "EMPLOYEE";

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

export type ApiResponse<T> = {
  success: boolean;
  data: T | null;
  error: string | null;
};

export type LoginResponse = {
  token: string;
  user: User;
};

export type MobileDashboard = {
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    employeeNo: string;
  };
  todayAttendance: {
    status: string;
    checkInTime: string | null;
    checkOutTime: string | null;
    workingHoursPercent: number;
  };
  pendingLeaveCount: number;
  upcomingLeave: { startDate: string; endDate: string; type?: string } | null;
  latestPayslip: { netSalary?: number; payslipNo?: string } | null;
  unreadNotifications: number;
  activeDeployment: {
    workLocationName: string;
    shiftName: string;
    shiftStart: string;
    shiftEnd: string;
  } | null;
};

export type AndroidApkInfo = {
  url: string;
  fileName: string;
  platform: string;
};
