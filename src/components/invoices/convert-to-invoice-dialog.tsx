"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { postApiData } from "@/lib/api-client";

import type { InvoiceDetail } from "@/types/invoice";

type ConvertToInvoiceDialogProps = {
  quotationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ConvertToInvoiceDialog({
  quotationId,
  open,
  onOpenChange,
}: ConvertToInvoiceDialogProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConvert = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      const invoice = await postApiData<InvoiceDetail>(
        `/api/invoices/quotations/${quotationId}/convert`,
        dueDate ? { dueDate } : {},
      );
      await queryClient.invalidateQueries({ queryKey: ["quotations"] });
      await queryClient.invalidateQueries({ queryKey: ["invoices"] });
      onOpenChange(false);
      router.push(`/invoices/${invoice.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to convert quotation");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convert to invoice</DialogTitle>
          <DialogDescription>
            This will create an invoice from the quotation and mark it as
            converted.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="dueDate">Due date (optional)</Label>
          <Input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        {error ? <p className="text-destructive text-sm">{error}</p> : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConvert} disabled={isSubmitting}>
            {isSubmitting ? "Converting..." : "Convert to invoice"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
