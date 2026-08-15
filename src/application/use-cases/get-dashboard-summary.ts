import { format } from "date-fns";

import { prisma } from "@/infrastructure/db/prisma";
import { getColomboDayStart, getColomboMonthRange } from "@/lib/date";

import type {
  ActivityItem,
  DashboardSummary,
  KpiFormat,
  KpiMetric,
  TrendDirection,
} from "@/types/dashboard";
import type { Prisma } from "@prisma/client";

const billedInvoiceStatuses = [
  "SENT",
  "PARTIALLY_PAID",
  "PAID",
  "OVERDUE",
] as const;
const recognizedExpenseStatuses = ["APPROVED", "PAID"] as const;

function toNumber(value: unknown): number {
  if (value == null) {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function metric(
  label: string,
  current: number,
  previous: number,
  format?: KpiFormat,
): KpiMetric {
  const trend =
    previous === 0
      ? current === 0
        ? 0
        : 100
      : ((current - previous) / previous) * 100;
  const trendDirection: TrendDirection =
    trend > 0.5 ? "up" : trend < -0.5 ? "down" : "neutral";

  return {
    label,
    value: current,
    trend,
    trendDirection,
    format,
  };
}

export async function getDashboardSummary(
  branchId: string,
): Promise<DashboardSummary> {
  const now = new Date();
  const thisMonth = getColomboMonthRange(now);
  const lastMonth = getColomboMonthRange(
    new Date(thisMonth.start.getTime() - 1),
  );
  const todayStart = getColomboDayStart(now);
  const yesterdayStart = getColomboDayStart(new Date(todayStart.getTime() - 1));

  const employeeWhere: Prisma.EmployeeWhereInput = {
    branchId,
    deletedAt: null,
  };
  const clientWhere: Prisma.ClientWhereInput = {
    branchId,
    deletedAt: null,
    status: "ACTIVE",
  };

  const [
    totalEmployees,
    employeesLastMonth,
    activeClients,
    clientsLastMonth,
    revenueThisMonth,
    revenueLastMonth,
    expensesThisMonth,
    expensesLastMonth,
    pendingLeaveRequests,
    leaveLastMonth,
    openPositions,
    positionsLastMonth,
    payrollTotal,
    pendingPayrollPeriods,
    attendanceToday,
    attendanceYesterday,
    activeDeployments,
    outstandingInvoices,
    pendingExpenses,
    recentEmployees,
    recentInvoices,
    recentExpenses,
    recentLeaves,
    recentPayments,
  ] = await Promise.all([
    prisma.employee.count({ where: employeeWhere }),
    prisma.employee.count({
      where: { ...employeeWhere, createdAt: { lt: thisMonth.start } },
    }),
    prisma.client.count({ where: clientWhere }),
    prisma.client.count({
      where: { ...clientWhere, createdAt: { lt: thisMonth.start } },
    }),
    prisma.invoice.aggregate({
      where: {
        branchId,
        deletedAt: null,
        status: { in: [...billedInvoiceStatuses] },
        issueDate: { gte: thisMonth.start, lte: thisMonth.end },
      },
      _sum: { total: true },
    }),
    prisma.invoice.aggregate({
      where: {
        branchId,
        deletedAt: null,
        status: { in: [...billedInvoiceStatuses] },
        issueDate: { gte: lastMonth.start, lte: lastMonth.end },
      },
      _sum: { total: true },
    }),
    prisma.expense.aggregate({
      where: {
        branchId,
        deletedAt: null,
        status: { in: [...recognizedExpenseStatuses] },
        expenseDate: { gte: thisMonth.start, lte: thisMonth.end },
      },
      _sum: { amount: true },
    }),
    prisma.expense.aggregate({
      where: {
        branchId,
        deletedAt: null,
        status: { in: [...recognizedExpenseStatuses] },
        expenseDate: { gte: lastMonth.start, lte: lastMonth.end },
      },
      _sum: { amount: true },
    }),
    prisma.leaveRequest.count({
      where: {
        status: "PENDING",
        deletedAt: null,
        employee: { branchId, deletedAt: null },
      },
    }),
    prisma.leaveRequest.count({
      where: {
        status: "PENDING",
        deletedAt: null,
        createdAt: { lt: thisMonth.start },
        employee: { branchId, deletedAt: null },
      },
    }),
    prisma.jobOpening.aggregate({
      where: { branchId, deletedAt: null, status: "OPEN" },
      _sum: { positionsAvailable: true },
    }),
    prisma.jobOpening.aggregate({
      where: {
        branchId,
        deletedAt: null,
        status: "OPEN",
        createdAt: { lt: thisMonth.start },
      },
      _sum: { positionsAvailable: true },
    }),
    prisma.payslip.aggregate({
      where: {
        branchId,
        deletedAt: null,
        status: { in: ["FINALIZED", "PAID"] },
        payrollPeriod: {
          periodStart: { lte: thisMonth.end },
          periodEnd: { gte: thisMonth.start },
        },
      },
      _sum: { netSalary: true },
    }),
    prisma.payrollPeriod.count({
      where: {
        branchId,
        deletedAt: null,
        status: { in: ["DRAFT", "PROCESSING"] },
      },
    }),
    prisma.attendanceRecord.groupBy({
      by: ["status"],
      where: {
        date: todayStart,
        deletedAt: null,
        employee: { branchId, deletedAt: null },
      },
      _count: { _all: true },
    }),
    prisma.attendanceRecord.count({
      where: {
        date: yesterdayStart,
        deletedAt: null,
        status: { in: ["PRESENT", "LATE", "HALF_DAY"] },
        employee: { branchId, deletedAt: null },
      },
    }),
    prisma.deployment.count({
      where: { branchId, deletedAt: null, status: "ACTIVE" },
    }),
    prisma.invoice.aggregate({
      where: {
        branchId,
        deletedAt: null,
        status: { in: ["SENT", "PARTIALLY_PAID", "OVERDUE"] },
      },
      _sum: { amountDue: true },
    }),
    prisma.expense.count({
      where: { branchId, deletedAt: null, status: "PENDING" },
    }),
    prisma.employee.findMany({
      where: employeeWhere,
      orderBy: { createdAt: "desc" },
      take: 4,
      select: { id: true, firstName: true, lastName: true, createdAt: true },
    }),
    prisma.invoice.findMany({
      where: { branchId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: {
        id: true,
        invoiceNo: true,
        total: true,
        createdAt: true,
        client: { select: { companyName: true } },
      },
    }),
    prisma.expense.findMany({
      where: { branchId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: {
        id: true,
        expenseNo: true,
        amount: true,
        description: true,
        createdAt: true,
      },
    }),
    prisma.leaveRequest.findMany({
      where: { deletedAt: null, employee: { branchId, deletedAt: null } },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: {
        id: true,
        type: true,
        status: true,
        createdAt: true,
        employee: { select: { firstName: true, lastName: true } },
      },
    }),
    prisma.payment.findMany({
      where: { branchId },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: {
        id: true,
        paymentNo: true,
        amount: true,
        createdAt: true,
        invoice: { select: { invoiceNo: true } },
      },
    }),
  ]);

  const attendanceMap = Object.fromEntries(
    attendanceToday.map((row) => [row.status, row._count._all]),
  );
  const present = (attendanceMap.PRESENT ?? 0) + (attendanceMap.HALF_DAY ?? 0);
  const late = attendanceMap.LATE ?? 0;
  const absent = attendanceMap.ABSENT ?? 0;
  const presentToday = present + late;

  const activities: ActivityItem[] = [
    ...recentEmployees.map((employee) => ({
      id: `employee-${employee.id}`,
      type: "employee" as const,
      title: "Employee added",
      description: `${employee.firstName} ${employee.lastName} joined the directory.`,
      timestamp: employee.createdAt.toISOString(),
    })),
    ...recentInvoices.map((invoice) => ({
      id: `invoice-${invoice.id}`,
      type: "invoice" as const,
      title: `Invoice ${invoice.invoiceNo}`,
      description: `${invoice.client.companyName} · LKR ${toNumber(invoice.total).toLocaleString("en-LK")}`,
      timestamp: invoice.createdAt.toISOString(),
    })),
    ...recentExpenses.map((expense) => ({
      id: `expense-${expense.id}`,
      type: "expense" as const,
      title: `Expense ${expense.expenseNo}`,
      description: expense.description,
      timestamp: expense.createdAt.toISOString(),
    })),
    ...recentLeaves.map((leave) => ({
      id: `leave-${leave.id}`,
      type: "leave" as const,
      title: `${leave.type.replaceAll("_", " ")} leave`,
      description: `${leave.employee.firstName} ${leave.employee.lastName} · ${leave.status.toLowerCase()}`,
      timestamp: leave.createdAt.toISOString(),
    })),
    ...recentPayments.map((payment) => ({
      id: `payment-${payment.id}`,
      type: "payment" as const,
      title: `Payment ${payment.paymentNo}`,
      description: `Received for ${payment.invoice.invoiceNo}`,
      timestamp: payment.createdAt.toISOString(),
    })),
  ]
    .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))
    .slice(0, 8);

  return {
    kpis: {
      totalEmployees: metric(
        "Total Employees",
        totalEmployees,
        employeesLastMonth,
      ),
      activeClients: metric("Active Clients", activeClients, clientsLastMonth),
      monthlyRevenue: metric(
        "Monthly Revenue",
        toNumber(revenueThisMonth._sum.total),
        toNumber(revenueLastMonth._sum.total),
        "currency",
      ),
      monthlyExpenses: metric(
        "Monthly Expenses",
        toNumber(expensesThisMonth._sum.amount),
        toNumber(expensesLastMonth._sum.amount),
        "currency",
      ),
      pendingLeaveRequests: metric(
        "Pending Leave Requests",
        pendingLeaveRequests,
        leaveLastMonth,
      ),
      openPositions: metric(
        "Open Positions",
        toNumber(openPositions._sum.positionsAvailable),
        toNumber(positionsLastMonth._sum.positionsAvailable),
      ),
    },
    payroll: {
      currentPeriodLabel: format(now, "MMMM yyyy"),
      totalAmount: toNumber(payrollTotal._sum.netSalary),
      pendingApprovals: pendingPayrollPeriods,
      currency: "LKR",
    },
    attendance: {
      present,
      absent,
      late,
      totalEmployees,
      trend: metric("Attendance", presentToday, attendanceYesterday).trend,
      trendDirection: metric("Attendance", presentToday, attendanceYesterday)
        .trendDirection,
    },
    activities,
    operations: {
      activeDeployments,
      outstandingInvoices: toNumber(outstandingInvoices._sum.amountDue),
      pendingExpenses,
    },
  };
}
