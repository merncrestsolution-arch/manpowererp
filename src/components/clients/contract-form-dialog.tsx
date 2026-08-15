"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { createClientContractSchema } from "@/application/dto/client-contract.schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { patchApiData, postApiData } from "@/lib/api-client";
import { UploadDropzone } from "@/lib/uploadthing";

import type { ClientContractItem } from "@/types/client";
import type { z } from "zod";

type ContractFormValues = z.input<typeof createClientContractSchema>;

type ContractFormDialogProps = {
  clientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract?: ClientContractItem | null;
  canTerminate?: boolean;
};

function toDateInputValue(value: string | null | undefined): string {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
}

export function ContractFormDialog({
  clientId,
  open,
  onOpenChange,
  contract,
  canTerminate = false,
}: ContractFormDialogProps) {
  const queryClient = useQueryClient();
  const isEdit = Boolean(contract);

  const form = useForm<ContractFormValues>({
    resolver: zodResolver(createClientContractSchema),
    defaultValues: {
      title: "",
      startDate: "",
      endDate: "",
      status: "DRAFT",
      terms: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: contract?.title ?? "",
        startDate: toDateInputValue(contract?.startDate),
        endDate: toDateInputValue(contract?.endDate),
        status: contract?.status ?? "DRAFT",
        terms: contract?.terms ?? "",
      });
    }
  }, [contract, form, open]);

  const onSubmit = form.handleSubmit(async (values) => {
    if (isEdit && contract) {
      await patchApiData(`/api/clients/${clientId}/contracts`, {
        contractId: contract.id,
        ...values,
      });
    } else {
      await postApiData(`/api/clients/${clientId}/contracts`, values);
    }

    await queryClient.invalidateQueries({
      queryKey: ["clients", clientId, "contracts"],
    });
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit contract" : "Create contract"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-jk-md">
          <div className="space-y-2">
            <Label htmlFor="contract-title">Title</Label>
            <Input id="contract-title" {...form.register("title")} />
          </div>
          <div className="gap-jk-md grid sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contract-start">Start date</Label>
              <Input
                id="contract-start"
                type="date"
                {...form.register("startDate")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contract-end">End date</Label>
              <Input
                id="contract-end"
                type="date"
                {...form.register("endDate")}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contract-status">Status</Label>
            <Select
              id="contract-status"
              value={form.watch("status")}
              onChange={(event) =>
                form.setValue(
                  "status",
                  event.target.value as ContractFormValues["status"],
                )
              }
            >
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="EXPIRED">Expired</option>
              {canTerminate ? (
                <option value="TERMINATED">Terminated</option>
              ) : null}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contract-terms">Terms</Label>
            <Textarea
              id="contract-terms"
              rows={3}
              {...form.register("terms")}
            />
          </div>
          {isEdit && contract ? (
            <div className="space-y-2">
              <Label>Contract document</Label>
              <UploadDropzone
                endpoint="clientContractDocument"
                input={{ clientId, contractId: contract.id }}
                onClientUploadComplete={async () => {
                  await queryClient.invalidateQueries({
                    queryKey: ["clients", clientId, "contracts"],
                  });
                }}
              />
            </div>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {isEdit ? "Save contract" : "Create contract"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
