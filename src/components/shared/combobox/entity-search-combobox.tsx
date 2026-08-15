"use client";

import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDebounce } from "@/hooks/use-debounce";
import { fetchApiData } from "@/lib/api-client";
import { cn } from "@/lib/utils";

export type EntitySearchOption = {
  value: string;
  label: string;
  description?: string;
};

type EntitySearchComboboxProps = {
  value: string;
  onChange: (value: string, option?: EntitySearchOption) => void;
  searchUrl: string;
  placeholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  selectedLabel?: string;
};

export function EntitySearchCombobox({
  value,
  onChange,
  searchUrl,
  placeholder = "Search...",
  emptyMessage = "No results found",
  disabled = false,
  selectedLabel,
}: EntitySearchComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<EntitySearchOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (!open || debouncedQuery.trim().length < 2) {
      setOptions([]);
      return;
    }

    let cancelled = false;

    async function loadOptions() {
      setIsLoading(true);

      try {
        const results = await fetchApiData<
          Array<{
            id: string;
            employeeNo: string;
            firstName: string;
            lastName: string;
            designation: string | null;
          }>
        >(`${searchUrl}?q=${encodeURIComponent(debouncedQuery)}&limit=10`);

        if (cancelled) {
          return;
        }

        setOptions(
          results.map((item) => ({
            value: item.id,
            label: `${item.firstName} ${item.lastName}`,
            description: [item.employeeNo, item.designation]
              .filter(Boolean)
              .join(" · "),
          })),
        );
      } catch {
        if (!cancelled) {
          setOptions([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadOptions();

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, open, searchUrl]);

  const displayLabel =
    selectedLabel ??
    options.find((option) => option.value === value)?.label ??
    (value ? "Selected" : placeholder);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
            disabled={disabled}
          />
        }
      >
        <span className={cn(!value && "text-muted-foreground")}>
          {displayLabel}
        </span>
        <ChevronsUpDown className="size-4 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-[var(--anchor-width)] p-2" align="start">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          className="mb-2"
        />
        <div className="max-h-56 overflow-y-auto">
          {isLoading ? (
            <div className="text-muted-foreground flex items-center justify-center py-6">
              <Loader2 className="size-4 animate-spin" />
            </div>
          ) : options.length === 0 ? (
            <p className="text-body-md text-muted-foreground px-2 py-4 text-center">
              {debouncedQuery.trim().length < 2
                ? "Type at least 2 characters"
                : emptyMessage}
            </p>
          ) : (
            options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={cn(
                  "hover:bg-muted flex w-full items-start gap-2 rounded-md px-2 py-2 text-left",
                  value === option.value && "bg-muted",
                )}
                onClick={() => {
                  onChange(option.value, option);
                  setOpen(false);
                  setQuery("");
                }}
              >
                <Check
                  className={cn(
                    "mt-0.5 size-4",
                    value === option.value ? "opacity-100" : "opacity-0",
                  )}
                />
                <span>
                  <span className="block font-medium">{option.label}</span>
                  {option.description ? (
                    <span className="text-label-md text-muted-foreground">
                      {option.description}
                    </span>
                  ) : null}
                </span>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
