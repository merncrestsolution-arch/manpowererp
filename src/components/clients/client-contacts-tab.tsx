"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Mail, Pencil, Phone, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { ContactFormDialog } from "@/components/clients/contact-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useClientContacts } from "@/hooks/use-clients";
import { deleteApiData } from "@/lib/api-client";

import type { ClientContactItem } from "@/types/client";

type ClientContactsTabProps = {
  clientId: string;
};

export function ClientContactsTab({ clientId }: ClientContactsTabProps) {
  const queryClient = useQueryClient();
  const { data: contacts = [], isLoading } = useClientContacts(clientId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContact, setEditingContact] =
    useState<ClientContactItem | null>(null);
  const [contactToDelete, setContactToDelete] =
    useState<ClientContactItem | null>(null);

  const handleDelete = async () => {
    if (!contactToDelete) {
      return;
    }

    await deleteApiData(
      `/api/clients/${clientId}/contacts?contactId=${contactToDelete.id}`,
    );
    setContactToDelete(null);
    await queryClient.invalidateQueries({
      queryKey: ["clients", clientId, "contacts"],
    });
  };

  if (isLoading) {
    return (
      <p className="text-body-md text-muted-foreground">Loading contacts...</p>
    );
  }

  return (
    <div className="space-y-jk-md">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Contacts</h3>
          <p className="text-body-md text-muted-foreground">
            Manage client contact persons and primary contact.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setEditingContact(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="size-4" />
          Add contact
        </Button>
      </div>

      {contacts.length === 0 ? (
        <div className="p-jk-lg text-muted-foreground rounded-lg border border-dashed text-center">
          No contacts added yet.
        </div>
      ) : (
        <div className="space-y-jk-sm">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="gap-jk-sm bg-card p-jk-md flex flex-col rounded-lg border sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{contact.name}</p>
                  {contact.isPrimary ? (
                    <Badge className="bg-jk-primary-container/15 text-jk-primary-container">
                      Primary
                    </Badge>
                  ) : null}
                </div>
                <p className="text-body-md text-muted-foreground">
                  {contact.designation ?? "No designation"}
                </p>
                <div className="gap-jk-md text-label-md text-muted-foreground mt-1 flex flex-wrap">
                  {contact.email ? (
                    <span className="inline-flex items-center gap-1">
                      <Mail className="size-3.5" />
                      {contact.email}
                    </span>
                  ) : null}
                  {contact.phone ? (
                    <span className="inline-flex items-center gap-1">
                      <Phone className="size-3.5" />
                      {contact.phone}
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingContact(contact);
                    setDialogOpen(true);
                  }}
                >
                  <Pencil className="size-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setContactToDelete(contact)}
                >
                  <Trash2 className="size-4" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ContactFormDialog
        clientId={clientId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        contact={editingContact}
      />

      <Dialog
        open={Boolean(contactToDelete)}
        onOpenChange={(open) => !open && setContactToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete contact</DialogTitle>
            <DialogDescription>
              Remove <strong>{contactToDelete?.name}</strong> from this client?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setContactToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete contact
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
