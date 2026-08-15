export type ChartAccountType =
  "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE";

export type LedgerSourceType =
  "PAYROLL" | "EXPENSE" | "INVOICE" | "PAYMENT" | "MANUAL";

export type ChartAccountItem = {
  id: string;
  code: string;
  name: string;
  type: ChartAccountType;
  parentAccountId: string | null;
  parentAccountName: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type LedgerEntryItem = {
  id: string;
  entryDate: string;
  description: string;
  debit: number;
  credit: number;
  sourceType: LedgerSourceType;
  sourceId: string;
  journalReference: string;
  runningBalance: number;
};

export type CashBookEntry = {
  id: string;
  entryDate: string;
  accountCode: string;
  accountName: string;
  description: string;
  debit: number;
  credit: number;
  runningBalance: number;
  sourceType: LedgerSourceType;
};

export type ProfitAndLossLine = {
  accountId: string;
  accountCode: string;
  accountName: string;
  amount: number;
};

export type ProfitAndLossReport = {
  periodLabel: string;
  previousPeriodLabel: string;
  currency: string;
  revenue: ProfitAndLossLine[];
  expenses: ProfitAndLossLine[];
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  previousTotalRevenue: number;
  previousTotalExpenses: number;
  previousNetProfit: number;
};

export type BalanceSheetLine = {
  accountId: string;
  accountCode: string;
  accountName: string;
  balance: number;
};

export type BalanceSheetReport = {
  asOfDate: string;
  currency: string;
  assets: BalanceSheetLine[];
  liabilities: BalanceSheetLine[];
  equity: BalanceSheetLine[];
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  isBalanced: boolean;
  difference: number;
};

export type CashFlowGroup = {
  sourceType: LedgerSourceType;
  label: string;
  inflow: number;
  outflow: number;
  net: number;
};

export type CashFlowReport = {
  periodLabel: string;
  currency: string;
  groups: CashFlowGroup[];
  totalInflow: number;
  totalOutflow: number;
  netCashFlow: number;
  chartData: { label: string; inflow: number; outflow: number; net: number }[];
};
