"use client";

import { useSession } from "next-auth/react";
import { use } from "react";

import { ClientProfileTabs } from "@/components/clients/client-profile-tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useClient } from "@/hooks/use-clients";
import { canTerminateContract } from "@/infrastructure/auth/roles";

type ClientProfilePageProps = {
  params: Promise<{ id: string }>;
};

export default function ClientProfilePage({ params }: ClientProfilePageProps) {
  const { id } = use(params);
  const { data: session } = useSession();
  const { data: client, isLoading, isError } = useClient(id);

  if (isLoading) {
    return (
      <div className="max-w-container space-y-jk-md mx-auto">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !client) {
    return (
      <div className="max-w-container bg-card p-jk-lg mx-auto rounded-xl border text-center">
        <p className="font-medium">Client not found</p>
        <p className="text-body-md text-muted-foreground">
          The client record may have been removed or you may not have access.
        </p>
      </div>
    );
  }

  const role = session?.user?.role;

  return (
    <div className="max-w-container mx-auto">
      <ClientProfileTabs
        client={client}
        canTerminateContract={role ? canTerminateContract(role) : false}
      />
    </div>
  );
}
