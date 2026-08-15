export function formatCurrency(
  value: number,
  currency = "LKR",
  locale = "en-LK",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number, locale = "en-LK"): string {
  return new Intl.NumberFormat(locale).format(value);
}

export function formatKpiValue(
  value: number,
  format: "number" | "currency" = "number",
  currency = "LKR",
): string {
  if (format === "currency") {
    return formatCurrency(value, currency);
  }

  return formatNumber(value);
}
