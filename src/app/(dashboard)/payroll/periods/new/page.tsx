import { PayrollPeriodForm } from "@/components/payroll/payroll-period-form";
import { PageShell } from "@/components/shared/page-shell";

export default function NewPayrollPeriodPage() {
  return (
    <PageShell
      title="New payroll period"
      description="Define the pay period and pay date for the next payroll run."
    >
      <PayrollPeriodForm />
    </PageShell>
  );
}
