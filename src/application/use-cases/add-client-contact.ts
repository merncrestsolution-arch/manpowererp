import { mapClientContact } from "@/application/mappers/client-mapper";
import { prisma } from "@/infrastructure/db/prisma";

import type { CreateClientContactInput } from "@/application/dto/client-contact.schema";
import type { ClientContactItem } from "@/types/client";

type AddClientContactParams = {
  branchId: string;
  clientId: string;
  userId: string;
  input: CreateClientContactInput;
};

type ContactResult =
  | { success: true; contact: ClientContactItem }
  | { success: false; error: string };

async function assertClientAccess(branchId: string, clientId: string) {
  return prisma.client.findFirst({
    where: { id: clientId, branchId, deletedAt: null },
    select: { id: true },
  });
}

export async function addClientContact({
  branchId,
  clientId,
  userId,
  input,
}: AddClientContactParams): Promise<ContactResult> {
  const client = await assertClientAccess(branchId, clientId);

  if (!client) {
    return { success: false, error: "Client not found" };
  }

  const contact = await prisma.$transaction(async (tx) => {
    if (input.isPrimary) {
      await tx.clientContact.updateMany({
        where: { clientId, deletedAt: null, isPrimary: true },
        data: { isPrimary: false, updatedBy: userId },
      });
    }

    return tx.clientContact.create({
      data: {
        clientId,
        name: input.name,
        designation: input.designation || null,
        email: input.email || null,
        phone: input.phone || null,
        isPrimary: input.isPrimary,
        createdBy: userId,
        updatedBy: userId,
      },
    });
  });

  return { success: true, contact: mapClientContact(contact) };
}

type UpdateClientContactParams = {
  branchId: string;
  clientId: string;
  contactId: string;
  userId: string;
  input: Partial<CreateClientContactInput>;
};

export async function updateClientContact({
  branchId,
  clientId,
  contactId,
  userId,
  input,
}: UpdateClientContactParams): Promise<ContactResult> {
  const client = await assertClientAccess(branchId, clientId);

  if (!client) {
    return { success: false, error: "Client not found" };
  }

  const existing = await prisma.clientContact.findFirst({
    where: { id: contactId, clientId, deletedAt: null },
  });

  if (!existing) {
    return { success: false, error: "Contact not found" };
  }

  const contact = await prisma.$transaction(async (tx) => {
    if (input.isPrimary) {
      await tx.clientContact.updateMany({
        where: {
          clientId,
          deletedAt: null,
          isPrimary: true,
          NOT: { id: contactId },
        },
        data: { isPrimary: false, updatedBy: userId },
      });
    }

    return tx.clientContact.update({
      where: { id: contactId },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.designation !== undefined
          ? { designation: input.designation || null }
          : {}),
        ...(input.email !== undefined ? { email: input.email || null } : {}),
        ...(input.phone !== undefined ? { phone: input.phone || null } : {}),
        ...(input.isPrimary !== undefined
          ? { isPrimary: input.isPrimary }
          : {}),
        updatedBy: userId,
      },
    });
  });

  return { success: true, contact: mapClientContact(contact) };
}

export async function deleteClientContact({
  branchId,
  clientId,
  contactId,
  userId,
}: {
  branchId: string;
  clientId: string;
  contactId: string;
  userId: string;
}): Promise<{ success: true } | { success: false; error: string }> {
  const client = await assertClientAccess(branchId, clientId);

  if (!client) {
    return { success: false, error: "Client not found" };
  }

  const existing = await prisma.clientContact.findFirst({
    where: { id: contactId, clientId, deletedAt: null },
  });

  if (!existing) {
    return { success: false, error: "Contact not found" };
  }

  await prisma.clientContact.update({
    where: { id: contactId },
    data: {
      deletedAt: new Date(),
      updatedBy: userId,
    },
  });

  return { success: true };
}

export async function listClientContacts(
  branchId: string,
  clientId: string,
): Promise<ClientContactItem[]> {
  const client = await assertClientAccess(branchId, clientId);

  if (!client) {
    return [];
  }

  const contacts = await prisma.clientContact.findMany({
    where: { clientId, deletedAt: null },
    orderBy: [{ isPrimary: "desc" }, { name: "asc" }],
  });

  return contacts.map(mapClientContact);
}
