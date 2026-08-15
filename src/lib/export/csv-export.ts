export type CsvColumn<T extends Record<string, unknown>> = {
  key: keyof T & string;
  header: string;
  format?: (value: T[keyof T], row: T) => string;
};

function escapeCsvValue(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function buildCsvContent<T extends Record<string, unknown>>(
  columns: CsvColumn<T>[],
  rows: T[],
): string {
  const headerLine = columns
    .map((column) => escapeCsvValue(column.header))
    .join(",");
  const dataLines = rows.map((row) =>
    columns
      .map((column) => {
        const raw = row[column.key];
        const formatted = column.format
          ? column.format(raw as T[keyof T], row)
          : raw === null || raw === undefined
            ? ""
            : String(raw);
        return escapeCsvValue(formatted);
      })
      .join(","),
  );

  return [headerLine, ...dataLines].join("\n");
}

export function downloadCsv(
  filename: string,
  columns: CsvColumn<Record<string, unknown>>[],
  rows: Record<string, unknown>[],
): void {
  const content = buildCsvContent(columns, rows);
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
