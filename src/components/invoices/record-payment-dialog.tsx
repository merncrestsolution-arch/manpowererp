"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { recordPaymentSchema } from "@/application/dto/payment.schema";
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
import { Select } from "@/components/ui/select";
import { postApiData } from "@/lib/api-client";
import { formatCurrency } from "@/lib/format";

import type { InvoiceDetail } from "@/types/invoice";
import type { z } from "zod";

type RecordPaymentDialogProps = {
  invoiceId: string;
  amountDue: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type PaymentFormValues = z.input<typeof recordPaymentSchema>;

const emptyPaymentValues = (amountDue: number): PaymentFormValues => ({
  amount: amountDue,
  paymentDate: new Date().toISOString().slice(0, 10),
  method: "BANK_TRANSFER",
  reference: "",
  chequeNumber: "",
  chequeBank: "",
  chequeBranch: "",
  chequeDate: "",
  bankName: "",
  accountNumber: "",
  transactionId: "",
});

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-destructive text-[12px]">{message}</p>;
}

export function RecordPaymentDialog({
  invoiceId,
  amountDue,
  open,
  onOpenChange,
}: RecordPaymentDialogProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(recordPaymentSchema),
    defaultValues: emptyPaymentValues(amountDue),
  });

  const method = form.watch("method");
  const errors = form.formState.errors;

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    try {
      await postApiData<InvoiceDetail>(
        `/api/invoices/${invoiceId}/payments`,
        values,
      );
      await queryClient.invalidateQueries({
        queryKey: ["invoices", invoiceId],
      });
      await queryClient.invalidateQueries({ queryKey: ["invoices", "list"] });
      await queryClient.invalidateQueries({
        queryKey: ["invoices", "outstanding"],
      });
      onOpenChange(false);
      form.reset(emptyPaymentValues(amountDue));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to record payment");
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record payment</DialogTitle>
          <DialogDescription>
            Outstanding balance: {formatCurrency(amountDue, "LKR")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-jk-md">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (LKR)</Label>
            <Input
              id="amount"
              type="number"
              min={0}
              max={amountDue}
              step="0.01"
              {...form.register("amount")}
            />
            <FieldError message={errors.amount?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentDate">Payment date</Label>
            <Input
              id="paymentDate"
              type="date"
              {...form.register("paymentDate")}
            />
            <FieldError message={errors.paymentDate?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="method">Method</Label>
            <Select id="method" {...form.register("method")}>
              <option value="BANK_TRANSFER">Bank transfer</option>
              <option value="CHEQUE">Cheque</option>
              <option value="CASH">Cash</option>
              <option value="CARD">Card</option>
              <option value="OTHER">Other</option>
            </Select>
          </div>

          {method === "CHEQUE" ? (
            <div className="space-y-jk-md border-border bg-muted/30 rounded-xl border p-4">
              <p className="text-foreground text-[13px] font-medium">
                Cheque details
              </p>
              <div className="gap-jk-md grid sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="chequeNumber">Cheque number</Label>
                  <Input
                    id="chequeNumber"
                    placeholder="e.g. 123456"
                    {...form.register("chequeNumber")}
                  />
                  <FieldError message={errors.chequeNumber?.message} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chequeDate">Cheque date</Label>
                  <Input
                    id="chequeDate"
                    type="date"
                    {...form.register("chequeDate")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chequeBank">Bank name</Label>
                  <Input
                    id="chequeBank"
                    placeholder="e.g. Bank of Ceylon"
                    {...form.register("chequeBank")}
                  />
                  <FieldError message={errors.chequeBank?.message} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chequeBranch">Branch</Label>
                  <Input
                    id="chequeBranch"
                    placeholder="e.g. Colombo"
                    {...form.register("chequeBranch")}
                  />
                </div>
              </div>
            </div>
          ) : null}

          {method === "BANK_TRANSFER" ? (
            <div className="space-y-jk-md border-border bg-muted/30 rounded-xl border p-4">
              <p className="text-foreground text-[13px] font-medium">
                Bank transfer details
              </p>
              <div className="gap-jk-md grid sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="transactionId">Transaction ID</Label>
                  <Input
                    id="transactionId"
                    placeholder="e.g. FT260815001"
                    {...form.register("transactionId")}
                  />
                  <FieldError message={errors.transactionId?.message} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank name</Label>
                  <Input
                    id="bankName"
                    placeholder="e.g. Commercial Bank"
                    {...form.register("bankName")}
                  />
                  <FieldError message={errors.bankName?.message} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="accountNumber">From account number</Label>
                  <Input
                    id="accountNumber"
                    placeholder="Optional"
                    {...form.register("accountNumber")}
                  />
                </div>
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="reference">
              {method === "CASH" || method === "CARD" || method === "OTHER"
                ? "Reference"
                : "Additional notes"}
            </Label>
            <Input
              id="reference"
              placeholder="Optional"
              {...form.register("reference")}
            />
          </div>

          {error ? <p className="text-destructive text-sm">{error}</p> : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Record payment</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
