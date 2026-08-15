import type {
  ClientBillingRecordItem,
  ClientContactItem,
  ClientContractItem,
  ClientDetail,
  ClientListItem,
  ClientWorkerAssignmentItem,
} from "@/types/client";
import type {
  Client,
  ClientBillingRecord,
  ClientContact,
  ClientContract,
  ClientWorkerAssignment,
  Employee,
  Prisma,
} from "@prisma/client";

const EXPIRY_WARNING_DAYS = 30;

export function parseOptionalDate(value?: string | null): Date | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function isContractExpiringSoon(endDate: Date): boolean {
  const now = new Date();
  const warningDate = new Date();
  warningDate.setDate(warningDate.getDate() + EXPIRY_WARNING_DAYS);

  return endDate >= now && endDate <= warningDate;
}

export function mapClientToListItem(
  client: Client & {
    contacts: Pick<ClientContact, "name" | "isPrimary">[];
  },
): ClientListItem {
  const primaryContact =
    client.contacts.find((contact) => contact.isPrimary) ?? client.contacts[0];

  return {
    id: client.id,
    clientNo: client.clientNo,
    companyName: client.companyName,
    industry: client.industry,
    city: client.city,
    status: client.status,
    creditTermDays: client.creditTermDays,
    primaryContactName: primaryContact?.name ?? null,
    deletedAt: client.deletedAt?.toISOString() ?? null,
  };
}

export function mapClientToDetail(client: Client): ClientDetail {
  return {
    id: client.id,
    clientNo: client.clientNo,
    companyName: client.companyName,
    registrationNo: client.registrationNo,
    industry: client.industry,
    address: client.address,
    city: client.city,
    status: client.status,
    creditTermDays: client.creditTermDays,
    notes: client.notes,
    createdAt: client.createdAt.toISOString(),
    updatedAt: client.updatedAt.toISOString(),
    createdBy: client.createdBy,
    updatedBy: client.updatedBy,
    deletedAt: client.deletedAt?.toISOString() ?? null,
  };
}

export function mapClientContact(contact: ClientContact): ClientContactItem {
  return {
    id: contact.id,
    name: contact.name,
    designation: contact.designation,
    email: contact.email,
    phone: contact.phone,
    isPrimary: contact.isPrimary,
  };
}

export function mapClientContract(
  contract: ClientContract,
): ClientContractItem {
  return {
    id: contract.id,
    contractNo: contract.contractNo,
    title: contract.title,
    startDate: contract.startDate.toISOString(),
    endDate: contract.endDate.toISOString(),
    status: contract.status,
    fileUrl: contract.fileUrl,
    terms: contract.terms,
    isExpiringSoon: isContractExpiringSoon(contract.endDate),
  };
}

export function mapClientWorkerAssignment(
  assignment: ClientWorkerAssignment & {
    employee: Pick<Employee, "employeeNo" | "firstName" | "lastName">;
  },
): ClientWorkerAssignmentItem {
  const now = new Date();
  const isCurrent =
    assignment.status === "ACTIVE" &&
    assignment.assignedFrom <= now &&
    (!assignment.assignedTo || assignment.assignedTo >= now);

  return {
    id: assignment.id,
    employeeId: assignment.employeeId,
    employeeNo: assignment.employee.employeeNo,
    employeeName: `${assignment.employee.firstName} ${assignment.employee.lastName}`,
    role: assignment.role,
    assignedFrom: assignment.assignedFrom.toISOString(),
    assignedTo: assignment.assignedTo?.toISOString() ?? null,
    status: assignment.status,
    isCurrent,
  };
}

export function mapClientBillingRecord(
  record: ClientBillingRecord,
): ClientBillingRecordItem {
  return {
    id: record.id,
    periodStart: record.periodStart.toISOString(),
    periodEnd: record.periodEnd.toISOString(),
    amount: Number(record.amount),
    status: record.status,
  };
}

export function buildClientSearchFilter(
  search?: string,
): Prisma.ClientWhereInput | undefined {
  if (!search) {
    return undefined;
  }

  const term = search.trim();
  if (!term) {
    return undefined;
  }

  return {
    OR: [
      { companyName: { contains: term, mode: "insensitive" } },
      { clientNo: { contains: term, mode: "insensitive" } },
      { registrationNo: { contains: term, mode: "insensitive" } },
      { industry: { contains: term, mode: "insensitive" } },
      { city: { contains: term, mode: "insensitive" } },
    ],
  };
}
