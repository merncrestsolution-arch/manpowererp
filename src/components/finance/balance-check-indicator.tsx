"use client";

import { CheckCircle2, XCircle } from "lucide-react";

import { formatCurrency } from "@/lib/format";

type BalanceCheckIndicatorProps = {
  isBalanced: boolean;
  difference: number;
  currency?: string;
};

export function BalanceCheckIndicator({
  isBalanced,
  difference,
  currency = "LKR",
}: BalanceCheckIndicatorProps) {
  return (
    <div
      className={`px-jk-md py-jk-sm flex items-center gap-3 rounded-lg border ${
        isBalanced
          ? "border-success/30 bg-success/10 text-success"
          : "border-destructive/30 bg-destructive/10 text-destructive"
      }`}
    >
      {isBalanced ? (
        <CheckCircle2 className="size-5 shrink-0" />
      ) : (
        <XCircle className="size-5 shrink-0" />
      )}
      <div>
        <p className="font-medium">
          {isBalanced
            ? "Balance sheet reconciles"
            : "Balance sheet does not reconcile"}
        </p>
        {!isBalanced ? (
          <p className="text-sm">
            Difference: {formatCurrency(Math.abs(difference), currency)}
          </p>
        ) : null}
      </div>
    </div>
  );
}
