export const CHART_ACCOUNT_CODES = {
  CASH: "1000",
  BANK: "1010",
  ACCOUNTS_RECEIVABLE: "1100",
  ACCOUNTS_PAYABLE: "2000",
  OWNERS_EQUITY: "3000",
  SERVICE_REVENUE: "4000",
  SALARY_EXPENSE: "5000",
  GENERAL_EXPENSE: "5100",
} as const;

export const CASH_BOOK_ACCOUNT_CODES: string[] = [
  CHART_ACCOUNT_CODES.CASH,
  CHART_ACCOUNT_CODES.BANK,
];

export type DefaultChartAccountSeed = {
  code: string;
  name: string;
  type: "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE";
};

export const DEFAULT_CHART_ACCOUNTS: DefaultChartAccountSeed[] = [
  { code: CHART_ACCOUNT_CODES.CASH, name: "Cash", type: "ASSET" },
  { code: CHART_ACCOUNT_CODES.BANK, name: "Bank", type: "ASSET" },
  {
    code: CHART_ACCOUNT_CODES.ACCOUNTS_RECEIVABLE,
    name: "Accounts Receivable",
    type: "ASSET",
  },
  {
    code: CHART_ACCOUNT_CODES.ACCOUNTS_PAYABLE,
    name: "Accounts Payable",
    type: "LIABILITY",
  },
  {
    code: CHART_ACCOUNT_CODES.OWNERS_EQUITY,
    name: "Owner's Equity",
    type: "EQUITY",
  },
  {
    code: CHART_ACCOUNT_CODES.SERVICE_REVENUE,
    name: "Service Revenue",
    type: "REVENUE",
  },
  {
    code: CHART_ACCOUNT_CODES.SALARY_EXPENSE,
    name: "Salary Expense",
    type: "EXPENSE",
  },
  {
    code: CHART_ACCOUNT_CODES.GENERAL_EXPENSE,
    name: "General Expense",
    type: "EXPENSE",
  },
];
