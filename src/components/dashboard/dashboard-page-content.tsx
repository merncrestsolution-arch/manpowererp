"use client";

import { FileText, Plus, QrCode, Receipt } from "lucide-react";
import Link from "next/link";

import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { AttendanceSummaryCard } from "@/components/dashboard/attendance-summary-card";
import { ExpenseChart } from "@/components/dashboard/expense-chart";
import { KpiGrid } from "@/components/dashboard/kpi-grid";
import { OperationsSnapshotCard } from "@/components/dashboard/operations-snapshot-card";
import { PayrollSummaryCard } from "@/components/dashboard/payroll-summary-card";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { Button } from "@/components/ui/button";
import { useDashboardSummary } from "@/hooks/use-dashboard-summary";
import { useExpenseBreakdown } from "@/hooks/use-expense-breakdown";
import { useRevenueTrend } from "@/hooks/use-revenue-trend";

function greetingForNow(): string {
  const hour = new Date().getHours();
  if (hour < 12) {
    return "Good morning";
  }
  if (hour < 17) {
    return "Good afternoon";
  }
  return "Good evening";
}

export function DashboardPageContent() {
  const summaryQuery = useDashboardSummary();
  const revenueQuery = useRevenueTrend();
  const expenseQuery = useExpenseBreakdown();

  const summary = summaryQuery.data;
  const revenue = revenueQuery.data;
  const expenses = expenseQuery.data;

  return (
    <div className="flex flex-col gap-6">
      <section className="shadow-elevated relative overflow-hidden rounded-2xl bg-[#041433] bg-[linear-gradient(135deg,#041433_0%,#0a2b58_58%,#0869a8_140%)] px-6 py-6 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(80,178,254,0.28),transparent_52%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl min-w-0">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-[#50b2fe] uppercase">
              Workspace
            </p>
            <h2 className="font-heading mt-2 text-[24px] leading-8 font-semibold tracking-tight md:text-[28px] md:leading-9">
              {greetingForNow()}. Here&apos;s your operations snapshot.
            </h2>
            <p className="mt-2 text-[14px] leading-5 text-white/70">
              Attendance, payroll, invoices, and deployments — live from JK
              Manpower.
            </p>
          </div>
          <div className="grid w-full shrink-0 grid-cols-2 gap-2 lg:w-[352px]">
            <Button
              className="h-9 w-full justify-center"
              render={<Link href="/employees/new" />}
            >
              <Plus className="size-4" />
              Add employee
            </Button>
            <Button
              variant="outline"
              className="h-9 w-full justify-center border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white"
              render={<Link href="/invoices/new" />}
            >
              <FileText className="size-4" />
              New invoice
            </Button>
            <Button
              variant="outline"
              className="h-9 w-full justify-center border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white"
              render={<Link href="/attendance/check-in/qr" />}
            >
              <QrCode className="size-4" />
              QR check-in
            </Button>
            <Button
              variant="outline"
              className="h-9 w-full justify-center border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white"
              render={<Link href="/expenses/new" />}
            >
              <Receipt className="size-4" />
              Record expense
            </Button>
          </div>
        </div>
      </section>

      <KpiGrid kpis={summary?.kpis} isLoading={summaryQuery.isLoading} />

      <OperationsSnapshotCard
        operations={summary?.operations}
        isLoading={summaryQuery.isLoading}
      />

      <div className="grid grid-cols-1 items-stretch gap-6 xl:grid-cols-2">
        <RevenueChart
          data={revenue?.points ?? []}
          periodLabel={revenue?.periodLabel}
          isLoading={revenueQuery.isLoading}
          currency={summary?.payroll.currency}
        />
        <ExpenseChart
          data={expenses?.categories ?? []}
          periodLabel={expenses?.periodLabel}
          isLoading={expenseQuery.isLoading}
          currency={summary?.payroll.currency}
        />
      </div>

      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
        <PayrollSummaryCard
          summary={summary?.payroll}
          isLoading={summaryQuery.isLoading}
        />
        <AttendanceSummaryCard
          summary={summary?.attendance}
          isLoading={summaryQuery.isLoading}
        />
      </div>

      <div className="grid grid-cols-1 items-stretch gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)]">
        <ActivityFeed
          activities={summary?.activities ?? []}
          isLoading={summaryQuery.isLoading}
        />
        <QuickActions />
      </div>
    </div>
  );
}
