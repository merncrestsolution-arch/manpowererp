import type {
  ClientBillingStatus,
  ClientContractStatus,
  ClientStatus,
  ClientWorkerAssignmentStatus,
} from "@prisma/client";

export type PaginatedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type ClientListItem = {
  id: string;
  clientNo: string;
  companyName: string;
  industry: string | null;
  city: string | null;
  status: ClientStatus;
  creditTermDays: number;
  primaryContactName: string | null;
  deletedAt: string | null;
};

export type ClientDetail = {
  id: string;
  clientNo: string;
  companyName: string;
  registrationNo: string | null;
  industry: string | null;
  address: string | null;
  city: string | null;
  status: ClientStatus;
  creditTermDays: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  deletedAt: string | null;
};

export type ClientContactItem = {
  id: string;
  name: string;
  designation: string | null;
  email: string | null;
  phone: string | null;
  isPrimary: boolean;
};

export type ClientContractItem = {
  id: string;
  contractNo: string;
  title: string;
  startDate: string;
  endDate: string;
  status: ClientContractStatus;
  fileUrl: string | null;
  terms: string | null;
  isExpiringSoon: boolean;
};

export type ClientWorkerAssignmentItem = {
  id: string;
  employeeId: string;
  employeeNo: string;
  employeeName: string;
  role: string;
  assignedFrom: string;
  assignedTo: string | null;
  status: ClientWorkerAssignmentStatus;
  isCurrent: boolean;
};

export type ClientBillingRecordItem = {
  id: string;
  periodStart: string;
  periodEnd: string;
  amount: number;
  status: ClientBillingStatus;
};

export type ClientFilterOptions = {
  industries: string[];
  cities: string[];
};

export type EmployeeSearchResult = {
  id: string;
  employeeNo: string;
  firstName: string;
  lastName: string;
  designation: string | null;
};
