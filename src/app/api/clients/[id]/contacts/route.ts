import { NextResponse } from "next/server";

import {
  createClientContactSchema,
  updateClientContactSchema,
} from "@/application/dto/client-contact.schema";
import {
  addClientContact,
  deleteClientContact,
  listClientContacts,
  updateClientContact,
} from "@/application/use-cases/add-client-contact";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import { canManageClients } from "@/infrastructure/auth/roles";
import { errorResponse, successResponse } from "@/lib/api-response";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const authContext = await getAuthenticatedContext();
  const { id } = await context.params;

  if (!authContext || !canManageClients(authContext.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const contacts = await listClientContacts(authContext.branchId, id);
  return NextResponse.json(successResponse(contacts));
}

export async function POST(request: Request, context: RouteContext) {
  const authContext = await getAuthenticatedContext();
  const { id } = await context.params;

  if (!authContext || !canManageClients(authContext.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const body = await request.json();
  const parsed = createClientContactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid request"),
      { status: 400 },
    );
  }

  const result = await addClientContact({
    branchId: authContext.branchId,
    clientId: id,
    userId: authContext.userId,
    input: parsed.data,
  });

  if (!result.success) {
    return NextResponse.json(errorResponse(result.error), { status: 404 });
  }

  return NextResponse.json(successResponse(result.contact), { status: 201 });
}

export async function PATCH(request: Request, context: RouteContext) {
  const authContext = await getAuthenticatedContext();
  const { id } = await context.params;

  if (!authContext || !canManageClients(authContext.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const body = await request.json();
  const parsed = updateClientContactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid request"),
      { status: 400 },
    );
  }

  const { contactId, ...input } = parsed.data;
  const result = await updateClientContact({
    branchId: authContext.branchId,
    clientId: id,
    contactId,
    userId: authContext.userId,
    input,
  });

  if (!result.success) {
    return NextResponse.json(errorResponse(result.error), { status: 404 });
  }

  return NextResponse.json(successResponse(result.contact));
}

export async function DELETE(request: Request, context: RouteContext) {
  const authContext = await getAuthenticatedContext();
  const { id } = await context.params;

  if (!authContext || !canManageClients(authContext.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const contactId = searchParams.get("contactId");

  if (!contactId) {
    return NextResponse.json(errorResponse("Contact ID required"), {
      status: 400,
    });
  }

  const result = await deleteClientContact({
    branchId: authContext.branchId,
    clientId: id,
    contactId,
    userId: authContext.userId,
  });

  if (!result.success) {
    return NextResponse.json(errorResponse(result.error), { status: 404 });
  }

  return NextResponse.json(successResponse({ deleted: true }));
}
