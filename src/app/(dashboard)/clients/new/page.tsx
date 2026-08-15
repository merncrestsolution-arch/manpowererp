import { ClientForm } from "@/components/clients/client-form";
import { PageShell } from "@/components/shared/page-shell";

export default function NewClientPage() {
  return (
    <PageShell title="Add client" description="Create a new client account.">
      <ClientForm mode="create" />
    </PageShell>
  );
}
