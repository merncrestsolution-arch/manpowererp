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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { postApiData } from "@/lib/api-client";

import type { ExpenseDetail } from "@/types/expense";

type ExpenseRejectDialogProps = {
  expenseId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRejected?: () => void;
};

export function ExpenseRejectDialog({
  expenseId,
  open,
  onOpenChange,
  onRejected,
}: ExpenseRejectDialogProps) {
  const queryClient = useQueryClient();
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReject = async () => {
    if (!reason.trim()) {
      setError("Rejection reason is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await postApiData<ExpenseDetail>(`/api/expenses/${expenseId}/reject`, {
        reason,
      });
      await queryClient.invalidateQueries({ queryKey: ["expenses"] });
      onOpenChange(false);
      setReason("");
      onRejected?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to reject expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reject expense</DialogTitle>
        </DialogHeader>
        <div className="space-y-jk-md">
          <div className="space-y-2">
            <Label htmlFor="reject-reason">Reason</Label>
            <Input
              id="reject-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Explain why this expense is rejected"
            />
          </div>
          {error ? <p className="text-destructive">{error}</p> : null}
          <div className="gap-jk-sm flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isSubmitting}
            >
              Reject expense
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
