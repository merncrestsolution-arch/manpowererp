import type { DeploymentStatus, WorkLocationStatus } from "@prisma/client";

export type PaginatedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type DeploymentListItem = {
  id: string;
  deploymentNo: string;
  employeeId: string;
  employeeNo: string;
  employeeName: string;
  clientId: string;
  clientName: string;
  workLocationName: string;
  shiftName: string;
  startDate: string;
  endDate: string | null;
  status: DeploymentStatus;
};

export type DeploymentDetail = {
  id: string;
  deploymentNo: string;
  employeeId: string;
  employeeNo: string;
  employeeName: string;
  employeeDepartment: string | null;
  employeeDesignation: string | null;
  clientId: string;
  clientNo: string;
  clientName: string;
  workLocationId: string;
  workLocationName: string;
  shiftId: string;
  shiftName: string;
  shiftStartTime: string;
  shiftEndTime: string;
  clientWorkerAssignmentId: string | null;
  contractRefId: string | null;
  contractRefTitle: string | null;
  startDate: string;
  endDate: string | null;
  status: DeploymentStatus;
  assignmentRole: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  deletedAt: string | null;
};

export type DeploymentContractItem = {
  id: string;
  deploymentId: string;
  title: string;
  fileUrl: string;
  signedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
};

export type WorkLocationListItem = {
  id: string;
  clientId: string;
  clientName: string;
  name: string;
  address: string | null;
  city: string | null;
  geoLat: number | null;
  geoLng: number | null;
  status: WorkLocationStatus;
  activeDeployments: number;
};

export type WorkLocationDetail = {
  id: string;
  clientId: string;
  clientName: string;
  name: string;
  address: string | null;
  city: string | null;
  geoLat: number | null;
  geoLng: number | null;
  status: WorkLocationStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  deletedAt: string | null;
};

export type ShiftCoverageRow = {
  shiftId: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  assignedCount: number;
  employees: Array<{
    deploymentId: string;
    deploymentNo: string;
    employeeName: string;
    employeeNo: string;
    status: DeploymentStatus;
  }>;
};

export type EmployeeAvailabilityStatus = "AVAILABLE" | "DEPLOYED" | "ON_LEAVE";

export type EmployeeAvailabilityItem = {
  id: string;
  employeeNo: string;
  firstName: string;
  lastName: string;
  department: string | null;
  designation: string | null;
  status: EmployeeAvailabilityStatus;
  currentDeploymentNo: string | null;
  currentClientName: string | null;
  leaveType: string | null;
  leaveEndDate: string | null;
};

export type AvailabilityBoard = {
  available: EmployeeAvailabilityItem[];
  deployed: EmployeeAvailabilityItem[];
  onLeave: EmployeeAvailabilityItem[];
  summary: {
    available: number;
    deployed: number;
    onLeave: number;
    total: number;
  };
};

export type DeploymentFilterOptions = {
  clients: Array<{ id: string; companyName: string }>;
  statuses: DeploymentStatus[];
  departments: string[];
  designations: string[];
};
