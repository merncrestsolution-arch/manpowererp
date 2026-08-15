"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { createInvoiceSchema } from "@/application/dto/invoice.schema";
import { LineItemEditor } from "@/components/invoices/line-item-editor";
import { FormSection } from "@/components/shared/forms/form-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useInvoicesList } from "@/hooks/use-invoices";
import { patchApiData, postApiData } from "@/lib/api-client";
import { formatCurrency } from "@/lib/format";

import type { InvoiceDetail } from "@/types/invoice";
import type { z } from "zod";

type InvoiceFormValues = z.input<typeof createInvoiceSchema>;

type InvoiceFormProps = {
  invoice?: InvoiceDetail;
};

function toDateInput(value: string): string {
  return value.slice(0, 10);
}

export function InvoiceForm({ invoice }: InvoiceFormProps) {
  const router = useRouter();
  const isEdit = Boolean(invoice);
  const { data } = useInvoicesList({
    page: 1,
    pageSize: 1,
    filters: {
      search: "",
      clientId: "",
      status: "",
      dateFrom: "",
      dateTo: "",
      includeDeleted: false,
    },
    sortBy: "issueDate",
    sortOrder: "desc",
  });
  const [error, setError] = useState<string | null>(null);

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(createInvoiceSchema),
    defaultValues: {
      clientId: invoice?.clientId ?? "",
      issueDate: invoice
        ? toDateInput(invoice.issueDate)
        : new Date().toISOString().slice(0, 10),
      dueDate: invoice
        ? toDateInput(invoice.dueDate)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .slice(0, 10),
      taxAmount: invoice?.taxAmount ?? 0,
      notes: invoice?.notes ?? "",
      lineItems: invoice?.lineItems.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })) ?? [{ description: "", quantity: 1, unitPrice: 0 }],
    },
  });

  const lineItems = form.watch("lineItems");
  const taxAmount = Number(form.watch("taxAmount") ?? 0);
  const subtotal = lineItems.reduce(
    (sum, item) => sum + Number(item.quantity) * Number(item.unitPrice),
    0,
  );
  const total = subtotal + taxAmount;

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    try {
      const saved =
        isEdit && invoice
          ? await patchApiData<InvoiceDetail>(
              `/api/invoices/${invoice.id}`,
              values,
            )
          : await postApiData<InvoiceDetail>("/api/invoices", values);
      router.push(`/invoices/${saved.id}`);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : isEdit
            ? "Failed to update invoice"
            : "Failed to create invoice",
      );
    }
  });

  return (
    <form onSubmit={onSubmit} className="mx-auto flex max-w-4xl flex-col gap-6">
      <FormSection
        title="Invoice details"
        description={
          isEdit
            ? `Update ${invoice?.invoiceNo}`
            : "Create a new client invoice"
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="clientId">Client</Label>
            <Select id="clientId" {...form.register("clientId")}>
              <option value="">Select client</option>
              {data?.filterOptions.clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="issueDate">Issue date</Label>
            <Input id="issueDate" type="date" {...form.register("issueDate")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due date</Label>
            <Input id="dueDate" type="date" {...form.register("dueDate")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="taxAmount">Tax amount (LKR)</Label>
            <Input
              id="taxAmount"
              type="number"
              min={0}
              step="0.01"
              {...form.register("taxAmount")}
            />
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Line items"
        description="Add billable services or products"
      >
        <LineItemEditor
          items={lineItems}
          onChange={(items) => form.setValue("lineItems", items)}
        />
      </FormSection>

      <FormSection
        title="Notes"
        description="Optional terms or payment instructions"
      >
        <Textarea {...form.register("notes")} />
      </FormSection>

      <div className="border-border bg-card shadow-card flex items-center justify-between rounded-2xl border p-5">
        <div>
          <p className="text-muted-foreground text-sm">Invoice total</p>
          <p className="font-heading text-[24px] leading-8 font-semibold">
            {formatCurrency(total, "LKR")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit">
            {isEdit ? "Save changes" : "Create invoice"}
          </Button>
        </div>
      </div>

      {error ? <p className="text-destructive text-sm">{error}</p> : null}
    </form>
  );
}
