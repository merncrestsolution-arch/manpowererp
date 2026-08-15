import type {
  InvoiceStatus,
  PaymentMethod,
  QuotationStatus,
} from "@prisma/client";

export type PaginatedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type LineItemInput = {
  description: string;
  quantity: number;
  unitPrice: number;
};

export type LineItemDetail = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  sortOrder: number;
};

export type QuotationListItem = {
  id: string;
  quotationNo: string;
  clientId: string;
  clientName: string;
  issueDate: string;
  validUntil: string;
  status: QuotationStatus;
  total: number;
  createdAt: string;
};

export type QuotationDetail = {
  id: string;
  quotationNo: string;
  clientId: string;
  clientName: string;
  issueDate: string;
  validUntil: string;
  status: QuotationStatus;
  subtotal: number;
  taxAmount: number;
  total: number;
  notes: string | null;
  pdfUrl: string | null;
  lineItems: LineItemDetail[];
  createdAt: string;
  updatedAt: string;
};

export type InvoiceListItem = {
  id: string;
  invoiceNo: string;
  clientId: string;
  clientName: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  total: number;
  amountPaid: number;
  amountDue: number;
  createdAt: string;
};

export type InvoiceDetail = {
  id: string;
  invoiceNo: string;
  clientId: string;
  clientName: string;
  clientAddress: string | null;
  quotationId: string | null;
  quotationNo: string | null;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  subtotal: number;
  taxAmount: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  notes: string | null;
  pdfUrl: string | null;
  lineItems: LineItemDetail[];
  payments: PaymentListItem[];
  createdAt: string;
  updatedAt: string;
};

export type PaymentListItem = {
  id: string;
  paymentNo: string;
  amount: number;
  paymentDate: string;
  method: PaymentMethod;
  reference: string | null;
  recordedById: string;
  recordedByName: string;
  createdAt: string;
};

export type InvoiceFilterOptions = {
  clients: { id: string; name: string }[];
  statuses: InvoiceStatus[];
};

export type QuotationFilterOptions = {
  clients: { id: string; name: string }[];
  statuses: QuotationStatus[];
};

export type AgingBucket = "current" | "1-30" | "31-60" | "61-90" | "90+";

export type OutstandingInvoiceItem = {
  id: string;
  invoiceNo: string;
  clientId: string;
  clientName: string;
  issueDate: string;
  dueDate: string;
  total: number;
  amountDue: number;
  daysOverdue: number;
  bucket: AgingBucket;
};

export type OutstandingClientSummary = {
  clientId: string;
  clientName: string;
  current: number;
  days1to30: number;
  days31to60: number;
  days61to90: number;
  days90plus: number;
  totalOutstanding: number;
};

export type OutstandingReport = {
  asOfDate: string;
  currency: string;
  totals: {
    current: number;
    days1to30: number;
    days31to60: number;
    days61to90: number;
    days90plus: number;
    totalOutstanding: number;
  };
  chartData: { label: string; value: number }[];
  invoices: OutstandingInvoiceItem[];
  byClient: OutstandingClientSummary[];
};
