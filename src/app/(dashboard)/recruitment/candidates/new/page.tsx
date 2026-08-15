import { CandidateForm } from "@/components/recruitment/candidate-form";
import { PageShell } from "@/components/shared/page-shell";

export default function NewCandidatePage() {
  return (
    <PageShell title="Add candidate">
      <CandidateForm mode="create" />
    </PageShell>
  );
}
