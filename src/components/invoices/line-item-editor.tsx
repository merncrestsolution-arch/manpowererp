"use client";

import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/format";

import type { LineItemInput } from "@/types/invoice";

type LineItemEditorProps = {
  items: LineItemInput[];
  onChange: (items: LineItemInput[]) => void;
  disabled?: boolean;
};

export function LineItemEditor({
  items,
  onChange,
  disabled = false,
}: LineItemEditorProps) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );

  const updateItem = (
    index: number,
    field: keyof LineItemInput,
    value: string | number,
  ) => {
    const next = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item,
    );
    onChange(next);
  };

  const addRow = () => {
    onChange([...items, { description: "", quantity: 1, unitPrice: 0 }]);
  };

  const removeRow = (index: number) => {
    if (items.length <= 1) return;
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-jk-md">
      <div className="border-border overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Description</th>
              <th className="w-24 px-3 py-2 text-left font-medium">Qty</th>
              <th className="w-32 px-3 py-2 text-left font-medium">
                Unit Price
              </th>
              <th className="w-32 px-3 py-2 text-right font-medium">
                Line Total
              </th>
              <th className="w-12 px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const lineTotal = item.quantity * item.unitPrice;
              return (
                <tr key={index} className="border-border border-t">
                  <td className="px-3 py-2">
                    <Input
                      value={item.description}
                      onChange={(e) =>
                        updateItem(index, "description", e.target.value)
                      }
                      placeholder="Service or product description"
                      disabled={disabled}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(index, "quantity", Number(e.target.value))
                      }
                      disabled={disabled}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) =>
                        updateItem(index, "unitPrice", Number(e.target.value))
                      }
                      disabled={disabled}
                    />
                  </td>
                  <td className="px-3 py-2 text-right font-medium">
                    {formatCurrency(lineTotal, "LKR")}
                  </td>
                  <td className="px-3 py-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeRow(index)}
                      disabled={disabled || items.length <= 1}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="gap-jk-sm flex flex-wrap items-center justify-between">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addRow}
          disabled={disabled}
        >
          <Plus className="size-4" />
          Add line item
        </Button>
        <div className="text-right">
          <Label className="text-muted-foreground">Subtotal</Label>
          <p className="font-heading text-headline-sm">
            {formatCurrency(subtotal, "LKR")}
          </p>
        </div>
      </div>
    </div>
  );
}
