import { EmployeeForm } from "@/components/employees/employee-form";
import { PageShell } from "@/components/shared/page-shell";

export default function NewEmployeePage() {
  return (
    <PageShell
      title="Add employee"
      description="Create a new employee record in the directory."
    >
      <EmployeeForm mode="create" />
    </PageShell>
  );
}
