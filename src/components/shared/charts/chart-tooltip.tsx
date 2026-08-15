"use client";

import { formatCurrency, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

type ChartTooltipPayloadItem = {
  name?: string;
  value?: number;
  color?: string;
  payload?: {
    label?: string;
  };
};

type ChartTooltipProps = {
  active?: boolean;
  payload?: ChartTooltipPayloadItem[];
  label?: string;
  valueFormat?: "number" | "currency";
  currency?: string;
};

export function ChartTooltip({
  active,
  payload,
  label,
  valueFormat = "number",
  currency = "LKR",
}: ChartTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const items = payload;

  return (
    <div className="border-border bg-card shadow-card rounded-lg border px-3 py-2">
      {label ? (
        <p className="text-label-md text-muted-foreground mb-1.5 font-medium">
          {label}
        </p>
      ) : null}
      <div className="space-y-1">
        {items.map((item, index) => {
          const displayLabel =
            item.payload?.label ?? item.name ?? `Series ${index + 1}`;
          const value = item.value ?? 0;
          const formattedValue =
            valueFormat === "currency"
              ? formatCurrency(value, currency)
              : formatNumber(value);

          return (
            <div
              key={`${displayLabel}-${index}`}
              className="flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn("size-2 rounded-full")}
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-body-md text-foreground">
                  {displayLabel}
                </span>
              </div>
              <span className="text-body-md text-foreground font-medium">
                {formattedValue}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
