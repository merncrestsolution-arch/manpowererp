"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { createClientContactSchema } from "@/application/dto/client-contact.schema";
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
import { patchApiData, postApiData } from "@/lib/api-client";

import type { ClientContactItem } from "@/types/client";
import type { z } from "zod";

type ContactFormValues = z.input<typeof createClientContactSchema>;

type ContactFormDialogProps = {
  clientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: ClientContactItem | null;
};

export function ContactFormDialog({
  clientId,
  open,
  onOpenChange,
  contact,
}: ContactFormDialogProps) {
  const queryClient = useQueryClient();
  const isEdit = Boolean(contact);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(createClientContactSchema),
    defaultValues: {
      name: "",
      designation: "",
      email: "",
      phone: "",
      isPrimary: false,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: contact?.name ?? "",
        designation: contact?.designation ?? "",
        email: contact?.email ?? "",
        phone: contact?.phone ?? "",
        isPrimary: contact?.isPrimary ?? false,
      });
    }
  }, [contact, form, open]);

  const onSubmit = form.handleSubmit(async (values) => {
    if (isEdit && contact) {
      await patchApiData(`/api/clients/${clientId}/contacts`, {
        contactId: contact.id,
        ...values,
      });
    } else {
      await postApiData(`/api/clients/${clientId}/contacts`, values);
    }

    await queryClient.invalidateQueries({
      queryKey: ["clients", clientId, "contacts"],
    });
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit contact" : "Add contact"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-jk-md">
          <div className="space-y-2">
            <Label htmlFor="contact-name">Name</Label>
            <Input id="contact-name" {...form.register("name")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-designation">Designation</Label>
            <Input id="contact-designation" {...form.register("designation")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-email">Email</Label>
            <Input
              id="contact-email"
              type="email"
              {...form.register("email")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-phone">Phone</Label>
            <Input id="contact-phone" {...form.register("phone")} />
          </div>
          <label className="text-body-md flex items-center gap-2">
            <input type="checkbox" {...form.register("isPrimary")} />
            Set as primary contact
          </label>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {isEdit ? "Save contact" : "Add contact"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
