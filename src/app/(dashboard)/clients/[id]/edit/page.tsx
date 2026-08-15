"use client";

import { useSession } from "next-auth/react";
import { use } from "react";

import { ClientForm } from "@/components/clients/client-form";
import { PageShell } from "@/components/shared/page-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { useClient } from "@/hooks/use-clients";
import { canBlacklistClient } from "@/infrastructure/auth/roles";

type EditClientPageProps = {
  params: Promise<{ id: string }>;
};

export default function EditClientPage({ params }: EditClientPageProps) {
  const { id } = use(params);
  const { data: session } = useSession();
  const { data: client, isLoading, isError } = useClient(id);

  if (isLoading) {
    return (
      <PageShell title="Edit client" description="Loading client details.">
        <div className="space-y-jk-md">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
      </PageShell>
    );
  }

  if (isError || !client) {
    return (
      <PageShell title="Edit client" description="Update client details.">
        <div className="bg-card p-jk-lg rounded-xl border text-center">
          <p className="font-medium">Client not found</p>
        </div>
      </PageShell>
    );
  }

  const role = session?.user?.role;

  return (
    <PageShell title="Edit client" description={`Update ${client.companyName}`}>
      <ClientForm
        mode="edit"
        client={client}
        canBlacklist={role ? canBlacklistClient(role) : false}
      />
    </PageShell>
  );
}
