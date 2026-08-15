export type TrendDirection = "up" | "down" | "neutral";

export type KpiFormat = "number" | "currency";

export type KpiMetric = {
  label: string;
  value: number;
  trend: number;
  trendDirection: TrendDirection;
  format?: KpiFormat;
};

export type ChartDataPoint = {
  label: string;
  value: number;
};

export type ActivityType =
  | "payment"
  | "leave"
  | "announcement"
  | "employee"
  | "invoice"
  | "expense"
  | "attendance"
  | "general";

export type ActivityItem = {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  actorName?: string;
};

export type PayrollSummary = {
  currentPeriodLabel: string;
  totalAmount: number;
  pendingApprovals: number;
  currency: string;
};

export type AttendanceSummary = {
  present: number;
  absent: number;
  late: number;
  totalEmployees: number;
  trend: number;
  trendDirection: TrendDirection;
};

export type DashboardKpis = {
  totalEmployees: KpiMetric;
  activeClients: KpiMetric;
  monthlyRevenue: KpiMetric;
  monthlyExpenses: KpiMetric;
  pendingLeaveRequests: KpiMetric;
  openPositions: KpiMetric;
};

export type OperationsSnapshot = {
  activeDeployments: number;
  outstandingInvoices: number;
  pendingExpenses: number;
};

export type DashboardSummary = {
  kpis: DashboardKpis;
  payroll: PayrollSummary;
  attendance: AttendanceSummary;
  activities: ActivityItem[];
  operations: OperationsSnapshot;
};

export type RevenueTrendData = {
  points: ChartDataPoint[];
  periodLabel: string;
};

export type ExpenseBreakdownData = {
  categories: ChartDataPoint[];
  periodLabel: string;
};
