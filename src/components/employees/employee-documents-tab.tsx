"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ExternalLink, FileText, Trash2, Upload } from "lucide-react";
import { useState } from "react";

import { DocumentUploadDialog } from "@/components/employees/document-upload-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEmployeeDocuments } from "@/hooks/use-employees";
import { deleteApiData } from "@/lib/api-client";
import { formatColomboDate } from "@/lib/date";

import type { EmployeeDocumentItem } from "@/types/employee";

type EmployeeDocumentsTabProps = {
  employeeId: string;
};

export function EmployeeDocumentsTab({
  employeeId,
}: EmployeeDocumentsTabProps) {
  const queryClient = useQueryClient();
  const { data: documents = [], isLoading } = useEmployeeDocuments(employeeId);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] =
    useState<EmployeeDocumentItem | null>(null);

  const handleDelete = async () => {
    if (!documentToDelete) {
      return;
    }

    await deleteApiData(
      `/api/employees/${employeeId}/documents?documentId=${documentToDelete.id}`,
    );
    setDocumentToDelete(null);
    await queryClient.invalidateQueries({
      queryKey: ["employees", employeeId, "documents"],
    });
  };

  return (
    <div className="space-y-jk-md">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-title-lg">Documents</h3>
          <p className="text-body-md text-muted-foreground">
            CVs, ID copies, certificates, and contracts.
          </p>
        </div>
        <Button onClick={() => setUploadOpen(true)}>
          <Upload className="size-4" />
          Upload document
        </Button>
      </div>

      {isLoading ? (
        <p className="text-body-md text-muted-foreground">
          Loading documents...
        </p>
      ) : documents.length === 0 ? (
        <div className="bg-muted/30 p-jk-xl rounded-xl border border-dashed text-center">
          <FileText className="text-muted-foreground mx-auto size-8" />
          <p className="mt-jk-sm font-medium">No documents uploaded</p>
          <p className="text-body-md text-muted-foreground">
            Upload employee documents to keep records in one place.
          </p>
        </div>
      ) : (
        <div className="space-y-jk-sm">
          {documents.map((document) => (
            <div
              key={document.id}
              className="bg-card px-jk-md py-jk-sm flex items-center justify-between rounded-lg border"
            >
              <div>
                <p className="font-medium">{document.fileName}</p>
                <p className="text-label-md text-muted-foreground">
                  {document.type.replaceAll("_", " ")} ·{" "}
                  {formatColomboDate(new Date(document.uploadedAt))}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  render={
                    <a
                      href={document.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                    />
                  }
                >
                  <ExternalLink className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setDocumentToDelete(document)}
                >
                  <Trash2 className="text-destructive size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <DocumentUploadDialog
        employeeId={employeeId}
        open={uploadOpen}
        onOpenChange={setUploadOpen}
      />

      <Dialog
        open={Boolean(documentToDelete)}
        onOpenChange={(open) => !open && setDocumentToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete document</DialogTitle>
            <DialogDescription>
              Remove <strong>{documentToDelete?.fileName}</strong> from this
              employee&apos;s records?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDocumentToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
