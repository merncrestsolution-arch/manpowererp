import { formatCurrency } from "@/lib/format";

type FinanceBalanceCardsProps = {
  openingBalance: number;
  closingBalance: number;
  currency?: string;
};

export function FinanceBalanceCards({
  openingBalance,
  closingBalance,
  currency = "LKR",
}: FinanceBalanceCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="border-border bg-card shadow-card rounded-2xl border p-5">
        <p className="text-muted-foreground text-[12px] leading-4 font-medium">
          Opening balance
        </p>
        <p className="font-heading text-foreground mt-2 text-[24px] leading-8 font-semibold tracking-tight tabular-nums">
          {formatCurrency(openingBalance, currency)}
        </p>
      </div>
      <div className="border-border bg-card shadow-card rounded-2xl border p-5">
        <p className="text-muted-foreground text-[12px] leading-4 font-medium">
          Closing balance
        </p>
        <p className="font-heading text-foreground mt-2 text-[24px] leading-8 font-semibold tracking-tight tabular-nums">
          {formatCurrency(closingBalance, currency)}
        </p>
      </div>
    </div>
  );
}
