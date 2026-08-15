"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { UploadDropzone } from "@/lib/uploadthing";

import type { EmployeeDocumentType } from "@prisma/client";

type DocumentUploadDialogProps = {
  employeeId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DocumentUploadDialog({
  employeeId,
  open,
  onOpenChange,
}: DocumentUploadDialogProps) {
  const queryClient = useQueryClient();
  const [documentType, setDocumentType] = useState<EmployeeDocumentType>("CV");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload document</DialogTitle>
        </DialogHeader>
        <div className="space-y-jk-md">
          <div className="space-y-2">
            <Label htmlFor="document-type">Document type</Label>
            <Select
              id="document-type"
              value={documentType}
              onChange={(event) =>
                setDocumentType(event.target.value as EmployeeDocumentType)
              }
            >
              <option value="CV">CV</option>
              <option value="NIC_COPY">NIC Copy</option>
              <option value="CERTIFICATE">Certificate</option>
              <option value="CONTRACT">Contract</option>
              <option value="OTHER">Other</option>
            </Select>
          </div>
          <UploadDropzone
            endpoint="employeeDocument"
            input={{ employeeId, type: documentType }}
            onClientUploadComplete={async () => {
              await queryClient.invalidateQueries({
                queryKey: ["employees", employeeId, "documents"],
              });
              onOpenChange(false);
            }}
          />
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
