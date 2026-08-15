import {
  mapWorkLocationToDetail,
  mapWorkLocationToListItem,
} from "@/application/mappers/deployment-mapper";
import { prisma } from "@/infrastructure/db/prisma";

import type {
  CreateWorkLocationInput,
  ListWorkLocationsQuery,
  UpdateWorkLocationInput,
} from "@/application/dto/work-location.schema";
import type {
  PaginatedResult,
  WorkLocationDetail,
  WorkLocationListItem,
} from "@/types/deployment";
import type { Prisma } from "@prisma/client";

type CreateWorkLocationParams = {
  branchId: string;
  userId: string;
  input: CreateWorkLocationInput;
};

type CreateWorkLocationResult =
  | { success: true; workLocation: WorkLocationDetail }
  | { success: false; error: string };

function buildWorkLocationSearchFilter(
  search?: string,
): Prisma.WorkLocationWhereInput {
  if (!search) {
    return {};
  }

  return {
    OR: [
      { name: { contains: search, mode: "insensitive" } },
      { city: { contains: search, mode: "insensitive" } },
      { address: { contains: search, mode: "insensitive" } },
    ],
  };
}

function toDecimal(value?: number | "" | null) {
  if (value === "" || value === undefined || value === null) {
    return null;
  }
  return value;
}

export async function createWorkLocation({
  branchId,
  userId,
  input,
}: CreateWorkLocationParams): Promise<CreateWorkLocationResult> {
  const client = await prisma.client.findFirst({
    where: { id: input.clientId, branchId, deletedAt: null },
  });

  if (!client) {
    return { success: false, error: "Client not found" };
  }

  try {
    const workLocation = await prisma.workLocation.create({
      data: {
        clientId: input.clientId,
        name: input.name,
        address: input.address || null,
        city: input.city || null,
        geoLat: toDecimal(input.geoLat),
        geoLng: toDecimal(input.geoLng),
        status: input.status,
        createdBy: userId,
        updatedBy: userId,
      },
      include: {
        client: { select: { id: true, companyName: true } },
      },
    });

    return {
      success: true,
      workLocation: mapWorkLocationToDetail(workLocation),
    };
  } catch {
    return { success: false, error: "Failed to create work location" };
  }
}

export async function updateWorkLocation({
  branchId,
  workLocationId,
  userId,
  input,
}: {
  branchId: string;
  workLocationId: string;
  userId: string;
  input: UpdateWorkLocationInput;
}): Promise<CreateWorkLocationResult> {
  const existing = await prisma.workLocation.findFirst({
    where: {
      id: workLocationId,
      deletedAt: null,
      client: { branchId, deletedAt: null },
    },
  });

  if (!existing) {
    return { success: false, error: "Work location not found" };
  }

  try {
    const workLocation = await prisma.workLocation.update({
      where: { id: workLocationId },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.address !== undefined
          ? { address: input.address || null }
          : {}),
        ...(input.city !== undefined ? { city: input.city || null } : {}),
        ...(input.geoLat !== undefined
          ? { geoLat: toDecimal(input.geoLat) }
          : {}),
        ...(input.geoLng !== undefined
          ? { geoLng: toDecimal(input.geoLng) }
          : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        updatedBy: userId,
      },
      include: {
        client: { select: { id: true, companyName: true } },
      },
    });

    return {
      success: true,
      workLocation: mapWorkLocationToDetail(workLocation),
    };
  } catch {
    return { success: false, error: "Failed to update work location" };
  }
}

export async function getWorkLocation(
  branchId: string,
  workLocationId: string,
): Promise<WorkLocationDetail | null> {
  const workLocation = await prisma.workLocation.findFirst({
    where: {
      id: workLocationId,
      deletedAt: null,
      client: { branchId, deletedAt: null },
    },
    include: {
      client: { select: { id: true, companyName: true } },
    },
  });

  return workLocation ? mapWorkLocationToDetail(workLocation) : null;
}

export async function listWorkLocations({
  branchId,
  query,
}: {
  branchId: string;
  query: ListWorkLocationsQuery;
}): Promise<PaginatedResult<WorkLocationListItem>> {
  const {
    page,
    pageSize,
    search,
    clientId,
    status,
    includeDeleted,
    sortBy,
    sortOrder,
  } = query;

  const where = {
    client: { branchId, deletedAt: null },
    ...(includeDeleted ? {} : { deletedAt: null }),
    ...(clientId ? { clientId } : {}),
    ...(status ? { status } : {}),
    ...buildWorkLocationSearchFilter(search),
  };

  const [total, locations] = await Promise.all([
    prisma.workLocation.count({ where }),
    prisma.workLocation.findMany({
      where,
      include: {
        client: { select: { id: true, companyName: true } },
        _count: {
          select: {
            deployments: {
              where: {
                deletedAt: null,
                status: { in: ["SCHEDULED", "ACTIVE"] },
              },
            },
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    items: locations.map(mapWorkLocationToListItem),
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function softDeleteWorkLocation(
  branchId: string,
  workLocationId: string,
  userId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const existing = await prisma.workLocation.findFirst({
    where: {
      id: workLocationId,
      deletedAt: null,
      client: { branchId, deletedAt: null },
    },
  });

  if (!existing) {
    return { success: false, error: "Work location not found" };
  }

  const activeDeployments = await prisma.deployment.count({
    where: {
      workLocationId,
      deletedAt: null,
      status: { in: ["SCHEDULED", "ACTIVE"] },
    },
  });

  if (activeDeployments > 0) {
    return {
      success: false,
      error: "Cannot delete a location with active deployments",
    };
  }

  await prisma.workLocation.update({
    where: { id: workLocationId },
    data: { deletedAt: new Date(), updatedBy: userId },
  });

  return { success: true };
}

export async function listWorkLocationsByClient(
  branchId: string,
  clientId: string,
) {
  return prisma.workLocation.findMany({
    where: {
      clientId,
      deletedAt: null,
      status: "ACTIVE",
      client: { branchId, deletedAt: null },
    },
    select: { id: true, name: true, city: true },
    orderBy: { name: "asc" },
  });
}
