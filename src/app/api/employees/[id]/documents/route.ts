import { NextResponse } from "next/server";

import { createEmployeeDocumentSchema } from "@/application/dto/employee-document.schema";
import {
  deleteEmployeeDocument,
  listEmployeeDocuments,
  uploadEmployeeDocument,
} from "@/application/use-cases/upload-employee-document";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import { canManageEmployees } from "@/infrastructure/auth/roles";
import { errorResponse, successResponse } from "@/lib/api-response";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const authContext = await getAuthenticatedContext();
  const { id } = await context.params;

  if (!authContext || !canManageEmployees(authContext.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const documents = await listEmployeeDocuments(authContext.branchId, id);

  return NextResponse.json(successResponse(documents));
}

export async function POST(request: Request, context: RouteContext) {
  const authContext = await getAuthenticatedContext();
  const { id } = await context.params;

  if (!authContext || !canManageEmployees(authContext.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const body = await request.json();
  const parsed = createEmployeeDocumentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid request"),
      { status: 400 },
    );
  }

  const result = await uploadEmployeeDocument({
    branchId: authContext.branchId,
    employeeId: id,
    userId: authContext.userId,
    input: parsed.data,
  });

  if (!result.success) {
    return NextResponse.json(errorResponse(result.error), { status: 400 });
  }

  return NextResponse.json(successResponse(result.document), { status: 201 });
}

export async function DELETE(request: Request, context: RouteContext) {
  const authContext = await getAuthenticatedContext();
  const { id } = await context.params;

  if (!authContext || !canManageEmployees(authContext.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const documentId = searchParams.get("documentId");

  if (!documentId) {
    return NextResponse.json(errorResponse("Document ID is required"), {
      status: 400,
    });
  }

  const result = await deleteEmployeeDocument({
    branchId: authContext.branchId,
    employeeId: id,
    documentId,
    userId: authContext.userId,
  });

  if (!result.success) {
    return NextResponse.json(errorResponse(result.error), { status: 404 });
  }

  return NextResponse.json(successResponse({ deleted: true }));
}
