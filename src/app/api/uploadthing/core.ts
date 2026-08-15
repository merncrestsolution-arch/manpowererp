import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { z } from "zod";

import { employeeDocumentTypeSchema } from "@/application/dto/employee-document.schema";
import { attachContractFile } from "@/application/use-cases/create-client-contract";
import { uploadCandidateResume } from "@/application/use-cases/upload-candidate-resume";
import { uploadCompanyLogo } from "@/application/use-cases/upload-company-logo";
import { attachDeploymentContractFile } from "@/application/use-cases/upload-deployment-contract";
import { uploadEmployeeDocument } from "@/application/use-cases/upload-employee-document";
import { uploadExpenseReceipt } from "@/application/use-cases/upload-expense-receipt";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import {
  canManageClients,
  canManageDeployment,
  canManageEmployees,
  canManageRecruitment,
  canManageSettings,
  canSubmitExpense,
} from "@/infrastructure/auth/roles";

const f = createUploadthing();

export const ourFileRouter = {
  employeeDocument: f({
    pdf: { maxFileSize: "8MB", maxFileCount: 1 },
    image: { maxFileSize: "4MB", maxFileCount: 1 },
    "application/msword": { maxFileSize: "8MB", maxFileCount: 1 },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      maxFileSize: "8MB",
      maxFileCount: 1,
    },
  })
    .input(
      z.object({
        employeeId: z.string().min(1),
        type: employeeDocumentTypeSchema,
      }),
    )
    .middleware(async ({ input }) => {
      const context = await getAuthenticatedContext();

      if (!context || !canManageEmployees(context.role)) {
        throw new UploadThingError("Unauthorized");
      }

      return {
        ...context,
        employeeId: input.employeeId,
        documentType: input.type,
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await uploadEmployeeDocument({
        branchId: metadata.branchId,
        employeeId: metadata.employeeId,
        userId: metadata.userId,
        input: {
          type: metadata.documentType,
          fileUrl: file.ufsUrl ?? file.url,
          fileName: file.name,
        },
      });
    }),

  clientContractDocument: f({
    pdf: { maxFileSize: "16MB", maxFileCount: 1 },
    image: { maxFileSize: "8MB", maxFileCount: 1 },
    "application/msword": { maxFileSize: "16MB", maxFileCount: 1 },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      maxFileSize: "16MB",
      maxFileCount: 1,
    },
  })
    .input(
      z.object({
        clientId: z.string().min(1),
        contractId: z.string().min(1),
      }),
    )
    .middleware(async ({ input }) => {
      const context = await getAuthenticatedContext();

      if (!context || !canManageClients(context.role)) {
        throw new UploadThingError("Unauthorized");
      }

      return {
        ...context,
        clientId: input.clientId,
        contractId: input.contractId,
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await attachContractFile({
        branchId: metadata.branchId,
        clientId: metadata.clientId,
        contractId: metadata.contractId,
        userId: metadata.userId,
        fileUrl: file.ufsUrl ?? file.url,
      });
    }),

  candidateResume: f({
    pdf: { maxFileSize: "8MB", maxFileCount: 1 },
    "application/msword": { maxFileSize: "8MB", maxFileCount: 1 },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      maxFileSize: "8MB",
      maxFileCount: 1,
    },
  })
    .input(z.object({ candidateId: z.string().min(1) }))
    .middleware(async ({ input }) => {
      const context = await getAuthenticatedContext();

      if (!context || !canManageRecruitment(context.role)) {
        throw new UploadThingError("Unauthorized");
      }

      return { ...context, candidateId: input.candidateId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await uploadCandidateResume({
        branchId: metadata.branchId,
        candidateId: metadata.candidateId,
        userId: metadata.userId,
        resumeUrl: file.ufsUrl ?? file.url,
      });
    }),

  deploymentContract: f({
    pdf: { maxFileSize: "16MB", maxFileCount: 1 },
    image: { maxFileSize: "8MB", maxFileCount: 1 },
    "application/msword": { maxFileSize: "16MB", maxFileCount: 1 },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      maxFileSize: "16MB",
      maxFileCount: 1,
    },
  })
    .input(
      z.object({
        deploymentId: z.string().min(1),
        title: z.string().min(1),
      }),
    )
    .middleware(async ({ input }) => {
      const context = await getAuthenticatedContext();

      if (!context || !canManageDeployment(context.role)) {
        throw new UploadThingError("Unauthorized");
      }

      return {
        ...context,
        deploymentId: input.deploymentId,
        title: input.title,
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await attachDeploymentContractFile({
        branchId: metadata.branchId,
        deploymentId: metadata.deploymentId,
        userId: metadata.userId,
        fileUrl: file.ufsUrl ?? file.url,
        title: metadata.title,
      });
    }),

  expenseReceipt: f({
    pdf: { maxFileSize: "8MB", maxFileCount: 1 },
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .input(z.object({ expenseId: z.string().min(1) }))
    .middleware(async ({ input }) => {
      const context = await getAuthenticatedContext();

      if (!context || !canSubmitExpense(context.role)) {
        throw new UploadThingError("Unauthorized");
      }

      return { ...context, expenseId: input.expenseId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await uploadExpenseReceipt({
        branchId: metadata.branchId,
        expenseId: metadata.expenseId,
        userId: metadata.userId,
        receiptUrl: file.ufsUrl ?? file.url,
      });
    }),

  companyLogo: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const context = await getAuthenticatedContext();

      if (!context || !canManageSettings(context.role)) {
        throw new UploadThingError("Unauthorized");
      }

      return context;
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await uploadCompanyLogo({
        branchId: metadata.branchId,
        userId: metadata.userId,
        logoUrl: file.ufsUrl ?? file.url,
      });
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
