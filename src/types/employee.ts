import type {
  EmployeeDocumentType,
  EmployeeStatus,
  EmploymentType,
  Gender,
  LeaveStatus,
  LeaveType,
} from "@prisma/client";

export type EmployeeListItem = {
  id: string;
  employeeNo: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  department: string | null;
  designation: string | null;
  employmentType: EmploymentType;
  status: EmployeeStatus;
  joinedAt: string | null;
  deletedAt: string | null;
};

export type PaginatedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type EmployeeDetail = {
  id: string;
  employeeNo: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  nic: string | null;
  dateOfBirth: string | null;
  gender: Gender | null;
  address: string | null;
  department: string | null;
  designation: string | null;
  employmentType: EmploymentType;
  status: EmployeeStatus;
  joinedAt: string | null;
  basicSalary: number | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  deletedAt: string | null;
};

export type EmployeeDocumentItem = {
  id: string;
  type: EmployeeDocumentType;
  fileUrl: string;
  fileName: string;
  uploadedAt: string;
};

export type LeaveRequestItem = {
  id: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  approvedByName: string | null;
  approvedAt: string | null;
  createdAt: string;
};

export type EmployeeShiftItem = {
  id: string;
  shiftId: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  isCurrent: boolean;
};

export type EmployeeAttendanceStatus = {
  status:
    "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY" | "ON_LEAVE" | "NOT_RECORDED";
  checkInTime: string | null;
  checkOutTime: string | null;
  workingHoursPercent: number;
};

export type EmployeeFilterOptions = {
  departments: string[];
  designations: string[];
};
