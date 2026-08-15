import type {
  DeploymentContractItem,
  DeploymentDetail,
  DeploymentListItem,
  ShiftCoverageRow,
  WorkLocationDetail,
  WorkLocationListItem,
} from "@/types/deployment";
import type { Prisma } from "@prisma/client";

function decimalToNumber(value: Prisma.Decimal | null): number | null {
  if (value === null) {
    return null;
  }
  return Number(value);
}

export function parseOptionalDate(value?: string | null): Date | null {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function buildDeploymentSearchFilter(
  search?: string,
): Prisma.DeploymentWhereInput {
  if (!search) {
    return {};
  }

  return {
    OR: [
      { deploymentNo: { contains: search, mode: "insensitive" } },
      {
        employee: {
          OR: [
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
            { employeeNo: { contains: search, mode: "insensitive" } },
          ],
        },
      },
      {
        client: {
          companyName: { contains: search, mode: "insensitive" },
        },
      },
    ],
  };
}

export function mapDeploymentToListItem(deployment: {
  id: string;
  deploymentNo: string;
  startDate: Date;
  endDate: Date | null;
  status: DeploymentListItem["status"];
  employee: {
    id: string;
    employeeNo: string;
    firstName: string;
    lastName: string;
  };
  client: { id: string; companyName: string };
  workLocation: { name: string };
  shift: { name: string };
}): DeploymentListItem {
  return {
    id: deployment.id,
    deploymentNo: deployment.deploymentNo,
    employeeId: deployment.employee.id,
    employeeNo: deployment.employee.employeeNo,
    employeeName: `${deployment.employee.firstName} ${deployment.employee.lastName}`,
    clientId: deployment.client.id,
    clientName: deployment.client.companyName,
    workLocationName: deployment.workLocation.name,
    shiftName: deployment.shift.name,
    startDate: deployment.startDate.toISOString(),
    endDate: deployment.endDate?.toISOString() ?? null,
    status: deployment.status,
  };
}

export function mapDeploymentToDetail(deployment: {
  id: string;
  deploymentNo: string;
  startDate: Date;
  endDate: Date | null;
  status: DeploymentDetail["status"];
  clientWorkerAssignmentId: string | null;
  contractRefId: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
  deletedAt: Date | null;
  employee: {
    id: string;
    employeeNo: string;
    firstName: string;
    lastName: string;
    department: string | null;
    designation: string | null;
  };
  client: { id: string; clientNo: string; companyName: string };
  workLocation: { id: string; name: string };
  shift: { id: string; name: string; startTime: string; endTime: string };
  contractRef: { id: string; title: string } | null;
  clientWorkerAssignment: { role: string } | null;
}): DeploymentDetail {
  return {
    id: deployment.id,
    deploymentNo: deployment.deploymentNo,
    employeeId: deployment.employee.id,
    employeeNo: deployment.employee.employeeNo,
    employeeName: `${deployment.employee.firstName} ${deployment.employee.lastName}`,
    employeeDepartment: deployment.employee.department,
    employeeDesignation: deployment.employee.designation,
    clientId: deployment.client.id,
    clientNo: deployment.client.clientNo,
    clientName: deployment.client.companyName,
    workLocationId: deployment.workLocation.id,
    workLocationName: deployment.workLocation.name,
    shiftId: deployment.shift.id,
    shiftName: deployment.shift.name,
    shiftStartTime: deployment.shift.startTime,
    shiftEndTime: deployment.shift.endTime,
    clientWorkerAssignmentId: deployment.clientWorkerAssignmentId,
    contractRefId: deployment.contractRefId,
    contractRefTitle: deployment.contractRef?.title ?? null,
    startDate: deployment.startDate.toISOString(),
    endDate: deployment.endDate?.toISOString() ?? null,
    status: deployment.status,
    assignmentRole: deployment.clientWorkerAssignment?.role ?? null,
    createdAt: deployment.createdAt.toISOString(),
    updatedAt: deployment.updatedAt.toISOString(),
    createdBy: deployment.createdBy,
    updatedBy: deployment.updatedBy,
    deletedAt: deployment.deletedAt?.toISOString() ?? null,
  };
}

export function mapDeploymentContract(contract: {
  id: string;
  deploymentId: string;
  title: string;
  fileUrl: string;
  signedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
}): DeploymentContractItem {
  return {
    id: contract.id,
    deploymentId: contract.deploymentId,
    title: contract.title,
    fileUrl: contract.fileUrl,
    signedAt: contract.signedAt?.toISOString() ?? null,
    expiresAt: contract.expiresAt?.toISOString() ?? null,
    createdAt: contract.createdAt.toISOString(),
  };
}

export function mapWorkLocationToListItem(location: {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  geoLat: Prisma.Decimal | null;
  geoLng: Prisma.Decimal | null;
  status: WorkLocationListItem["status"];
  client: { id: string; companyName: string };
  _count: { deployments: number };
}): WorkLocationListItem {
  return {
    id: location.id,
    clientId: location.client.id,
    clientName: location.client.companyName,
    name: location.name,
    address: location.address,
    city: location.city,
    geoLat: decimalToNumber(location.geoLat),
    geoLng: decimalToNumber(location.geoLng),
    status: location.status,
    activeDeployments: location._count.deployments,
  };
}

export function mapWorkLocationToDetail(location: {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  geoLat: Prisma.Decimal | null;
  geoLng: Prisma.Decimal | null;
  status: WorkLocationDetail["status"];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
  deletedAt: Date | null;
  client: { id: string; companyName: string };
}): WorkLocationDetail {
  return {
    id: location.id,
    clientId: location.client.id,
    clientName: location.client.companyName,
    name: location.name,
    address: location.address,
    city: location.city,
    geoLat: decimalToNumber(location.geoLat),
    geoLng: decimalToNumber(location.geoLng),
    status: location.status,
    createdAt: location.createdAt.toISOString(),
    updatedAt: location.updatedAt.toISOString(),
    createdBy: location.createdBy,
    updatedBy: location.updatedBy,
    deletedAt: location.deletedAt?.toISOString() ?? null,
  };
}

export function buildShiftCoverageRows(
  deployments: Array<{
    id: string;
    deploymentNo: string;
    status: ShiftCoverageRow["employees"][number]["status"];
    shift: { id: string; name: string; startTime: string; endTime: string };
    employee: { employeeNo: string; firstName: string; lastName: string };
  }>,
): ShiftCoverageRow[] {
  const byShift = new Map<string, ShiftCoverageRow>();

  for (const deployment of deployments) {
    const existing = byShift.get(deployment.shift.id);

    const employeeEntry = {
      deploymentId: deployment.id,
      deploymentNo: deployment.deploymentNo,
      employeeName: `${deployment.employee.firstName} ${deployment.employee.lastName}`,
      employeeNo: deployment.employee.employeeNo,
      status: deployment.status,
    };

    if (existing) {
      existing.assignedCount += 1;
      existing.employees.push(employeeEntry);
      continue;
    }

    byShift.set(deployment.shift.id, {
      shiftId: deployment.shift.id,
      shiftName: deployment.shift.name,
      startTime: deployment.shift.startTime,
      endTime: deployment.shift.endTime,
      assignedCount: 1,
      employees: [employeeEntry],
    });
  }

  return Array.from(byShift.values()).sort((a, b) =>
    a.shiftName.localeCompare(b.shiftName),
  );
}
