import { prisma } from "@/infrastructure/db/prisma";

import type { CreateEmployeeDocumentInput } from "@/application/dto/employee-document.schema";
import type { EmployeeDocumentItem } from "@/types/employee";

type UploadEmployeeDocumentParams = {
  branchId: string;
  employeeId: string;
  userId: string;
  input: CreateEmployeeDocumentInput;
};

type UploadEmployeeDocumentResult =
  | { success: true; document: EmployeeDocumentItem }
  | { success: false; error: string };

export async function uploadEmployeeDocument({
  branchId,
  employeeId,
  userId,
  input,
}: UploadEmployeeDocumentParams): Promise<UploadEmployeeDocumentResult> {
  const employee = await prisma.employee.findFirst({
    where: { id: employeeId, branchId, deletedAt: null },
  });

  if (!employee) {
    return { success: false, error: "Employee not found" };
  }

  const document = await prisma.employeeDocument.create({
    data: {
      employeeId,
      type: input.type,
      fileUrl: input.fileUrl,
      fileName: input.fileName,
      createdBy: userId,
      updatedBy: userId,
    },
  });

  return {
    success: true,
    document: {
      id: document.id,
      type: document.type,
      fileUrl: document.fileUrl,
      fileName: document.fileName,
      uploadedAt: document.uploadedAt.toISOString(),
    },
  };
}

export async function listEmployeeDocuments(
  branchId: string,
  employeeId: string,
): Promise<EmployeeDocumentItem[]> {
  const employee = await prisma.employee.findFirst({
    where: { id: employeeId, branchId },
    select: { id: true },
  });

  if (!employee) {
    return [];
  }

  const documents = await prisma.employeeDocument.findMany({
    where: { employeeId, deletedAt: null },
    orderBy: { uploadedAt: "desc" },
  });

  return documents.map((document) => ({
    id: document.id,
    type: document.type,
    fileUrl: document.fileUrl,
    fileName: document.fileName,
    uploadedAt: document.uploadedAt.toISOString(),
  }));
}

export async function deleteEmployeeDocument({
  branchId,
  employeeId,
  documentId,
  userId,
}: {
  branchId: string;
  employeeId: string;
  documentId: string;
  userId: string;
}): Promise<{ success: true } | { success: false; error: string }> {
  const document = await prisma.employeeDocument.findFirst({
    where: {
      id: documentId,
      employeeId,
      deletedAt: null,
      employee: { branchId },
    },
  });

  if (!document) {
    return { success: false, error: "Document not found" };
  }

  await prisma.employeeDocument.update({
    where: { id: documentId },
    data: {
      deletedAt: new Date(),
      updatedBy: userId,
    },
  });

  return { success: true };
}
