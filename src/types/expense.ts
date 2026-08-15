import type { ExpenseStatus } from "@prisma/client";

export type PaginatedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type ExpenseCategoryItem = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ExpenseListItem = {
  id: string;
  expenseNo: string;
  categoryId: string;
  categoryName: string;
  description: string;
  amount: number;
  expenseDate: string;
  paidById: string;
  paidByName: string;
  status: ExpenseStatus;
  receiptUrl: string | null;
  createdAt: string;
};

export type ExpenseDetail = {
  id: string;
  expenseNo: string;
  categoryId: string;
  categoryName: string;
  description: string;
  amount: number;
  expenseDate: string;
  paidById: string;
  paidByName: string;
  receiptUrl: string | null;
  status: ExpenseStatus;
  approvedById: string | null;
  approvedByName: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
};

export type ExpenseApprovalHistoryItem = {
  id: string;
  fromStatus: ExpenseStatus | null;
  toStatus: ExpenseStatus;
  changedBy: string;
  changedByName: string;
  changedAt: string;
  remarks: string | null;
};

export type ExpenseFilterOptions = {
  categories: { id: string; name: string }[];
  statuses: ExpenseStatus[];
  submitters: { id: string; name: string }[];
};

export type ExpenseReportSummary = {
  periodLabel: string;
  periodStart: string;
  periodEnd: string;
  totalAmount: number;
  approvedAmount: number;
  pendingAmount: number;
  rejectedAmount: number;
  paidAmount: number;
  byCategory: { label: string; value: number }[];
  trend: { label: string; value: number }[];
  currency: string;
};
