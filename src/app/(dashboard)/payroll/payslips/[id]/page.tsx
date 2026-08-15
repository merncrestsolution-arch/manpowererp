"use client";

import { use } from "react";

import { PayslipDetailView } from "@/components/payroll/payslip-detail-view";

type PayslipDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default function PayslipDetailPage({ params }: PayslipDetailPageProps) {
  const { id } = use(params);
  return <PayslipDetailView payslipId={id} />;
}
