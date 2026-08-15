import { ManualEntryForm } from "@/components/attendance/manual-entry-form";
import { PageShell } from "@/components/shared/page-shell";

export default function ManualAttendancePage() {
  return (
    <PageShell
      title="Manual attendance"
      description="Record a check-in or absence when QR or GPS is not available."
    >
      <ManualEntryForm />
    </PageShell>
  );
}
