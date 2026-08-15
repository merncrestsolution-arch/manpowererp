"use client";

import { Filter, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Select } from "@/components/ui/select";
import {
  defaultClientFilters,
  type ClientFiltersState,
} from "@/hooks/use-client-filters";

import type { ClientFilterOptions } from "@/types/client";

type ClientFiltersProps = {
  filters: ClientFiltersState;
  filterOptions?: ClientFilterOptions;
  onChange: (filters: ClientFiltersState) => void;
  showDeletedToggle?: boolean;
};

export function ClientFilters({
  filters,
  filterOptions,
  onChange,
  showDeletedToggle = false,
}: ClientFiltersProps) {
  const activeCount = [
    filters.industry,
    filters.city,
    filters.status,
    filters.includeDeleted,
  ].filter(Boolean).length;

  const update = (patch: Partial<ClientFiltersState>) => {
    onChange({ ...filters, ...patch });
  };

  return (
    <div className="gap-jk-sm flex flex-wrap items-center">
      <Popover>
        <PopoverTrigger
          render={
            <Button variant="outline" size="sm">
              <Filter className="size-4" />
              Filters
              {activeCount > 0 ? (
                <Badge variant="secondary" className="ml-1">
                  {activeCount}
                </Badge>
              ) : null}
            </Button>
          }
        />
        <PopoverContent className="space-y-jk-md w-80">
          <div className="space-y-2">
            <Label htmlFor="industry-filter">Industry</Label>
            <Select
              id="industry-filter"
              value={filters.industry}
              onChange={(event) => update({ industry: event.target.value })}
            >
              <option value="">All industries</option>
              {filterOptions?.industries.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="city-filter">City</Label>
            <Select
              id="city-filter"
              value={filters.city}
              onChange={(event) => update({ city: event.target.value })}
            >
              <option value="">All cities</option>
              {filterOptions?.cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status-filter">Status</Label>
            <Select
              id="status-filter"
              value={filters.status}
              onChange={(event) =>
                update({
                  status: event.target.value as ClientFiltersState["status"],
                })
              }
            >
              <option value="">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="BLACKLISTED">Blacklisted</option>
            </Select>
          </div>
          {showDeletedToggle ? (
            <label className="text-body-md flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.includeDeleted}
                onChange={(event) =>
                  update({ includeDeleted: event.target.checked })
                }
              />
              Include deleted clients
            </label>
          ) : null}
        </PopoverContent>
      </Popover>
      {activeCount > 0 ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange(defaultClientFilters)}
        >
          <X className="size-4" />
          Clear filters
        </Button>
      ) : null}
      {filters.industry ? (
        <Badge variant="outline">Industry: {filters.industry}</Badge>
      ) : null}
      {filters.city ? (
        <Badge variant="outline">City: {filters.city}</Badge>
      ) : null}
      {filters.status ? (
        <Badge variant="outline">Status: {filters.status}</Badge>
      ) : null}
    </div>
  );
}
