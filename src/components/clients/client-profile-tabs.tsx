"use client";

import { Pencil } from "lucide-react";
import Link from "next/link";

import { ClientBillingHistoryTab } from "@/components/clients/client-billing-history-tab";
import { ClientContactsTab } from "@/components/clients/client-contacts-tab";
import { ClientContractsTab } from "@/components/clients/client-contracts-tab";
import { ClientStatusBadge } from "@/components/clients/client-status-badge";
import { ClientWorkerAssignmentsTab } from "@/components/clients/client-worker-assignments-tab";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatColomboDate } from "@/lib/date";

import type { ClientDetail } from "@/types/client";

type ClientProfileTabsProps = {
  client: ClientDetail;
  canTerminateContract?: boolean;
};

function OverviewTab({ client }: { client: ClientDetail }) {
  const fields = [
    { label: "Client No", value: client.clientNo },
    { label: "Registration No", value: client.registrationNo ?? "—" },
    { label: "Industry", value: client.industry ?? "—" },
    { label: "City", value: client.city ?? "—" },
    { label: "Credit terms", value: `${client.creditTermDays} days` },
    { label: "Address", value: client.address ?? "—" },
    { label: "Notes", value: client.notes ?? "—" },
  ];

  return (
    <Card className="shadow-card">
      <CardContent className="gap-jk-md grid pt-(--card-spacing) sm:grid-cols-2">
        {fields.map((field) => (
          <div key={field.label}>
            <p className="text-label-md text-muted-foreground">{field.label}</p>
            <p className="text-body-md mt-0.5 font-medium">{field.value}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function AuditHistoryTab({ client }: { client: ClientDetail }) {
  const entries = [
    {
      label: "Created",
      value: formatColomboDate(new Date(client.createdAt)),
      by: client.createdBy ?? "System",
    },
    {
      label: "Last updated",
      value: formatColomboDate(new Date(client.updatedAt)),
      by: client.updatedBy ?? "System",
    },
    ...(client.deletedAt
      ? [
          {
            label: "Deleted",
            value: formatColomboDate(new Date(client.deletedAt)),
            by: client.updatedBy ?? "System",
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-jk-sm">
      {entries.map((entry) => (
        <div
          key={entry.label}
          className="bg-card px-jk-md py-jk-sm rounded-lg border"
        >
          <p className="font-medium">{entry.label}</p>
          <p className="text-body-md text-muted-foreground">
            {entry.value} · {entry.by}
          </p>
        </div>
      ))}
    </div>
  );
}

export function ClientProfileTabs({
  client,
  canTerminateContract = false,
}: ClientProfileTabsProps) {
  return (
    <div className="space-y-jk-lg">
      <div className="gap-jk-md flex flex-col sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-headline-md">
              {client.companyName}
            </h1>
            <ClientStatusBadge status={client.status} />
          </div>
          <p className="text-body-md text-muted-foreground">
            {client.clientNo}
            {client.industry ? ` · ${client.industry}` : ""}
            {client.city ? ` · ${client.city}` : ""}
          </p>
        </div>
        <Button render={<Link href={`/clients/${client.id}/edit`} />}>
          <Pencil className="size-4" />
          Edit client
        </Button>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
          <TabsTrigger value="assignments">Workers</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="audit">Audit History</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <OverviewTab client={client} />
        </TabsContent>
        <TabsContent value="contacts">
          <ClientContactsTab clientId={client.id} />
        </TabsContent>
        <TabsContent value="contracts">
          <ClientContractsTab
            clientId={client.id}
            canTerminate={canTerminateContract}
          />
        </TabsContent>
        <TabsContent value="assignments">
          <ClientWorkerAssignmentsTab clientId={client.id} />
        </TabsContent>
        <TabsContent value="billing">
          <ClientBillingHistoryTab clientId={client.id} />
        </TabsContent>
        <TabsContent value="audit">
          <AuditHistoryTab client={client} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
