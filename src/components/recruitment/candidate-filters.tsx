"use client";

import { Filter, X } from "lucide-react";

import { CandidateStatusBadge } from "@/components/recruitment/candidate-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Select } from "@/components/ui/select";
import { useJobOpeningOptions } from "@/hooks/use-recruitment";
import {
  defaultCandidateFilters,
  type CandidateFiltersState,
} from "@/hooks/use-recruitment-filters";

type CandidateFiltersProps = {
  filters: CandidateFiltersState;
  onChange: (filters: CandidateFiltersState) => void;
  showDeletedToggle?: boolean;
};

export function CandidateFilters({
  filters,
  onChange,
  showDeletedToggle = false,
}: CandidateFiltersProps) {
  const { data: jobOptions = [] } = useJobOpeningOptions();

  const activeCount = [
    filters.status,
    filters.source,
    filters.jobOpeningId,
    filters.includeDeleted,
  ].filter(Boolean).length;

  const update = (patch: Partial<CandidateFiltersState>) => {
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
            <Label>Status</Label>
            <Select
              value={filters.status}
              onChange={(e) =>
                update({
                  status: e.target.value as CandidateFiltersState["status"],
                })
              }
            >
              <option value="">All statuses</option>
              <option value="APPLIED">Applied</option>
              <option value="SCREENING">Screening</option>
              <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
              <option value="INTERVIEWED">Interviewed</option>
              <option value="OFFERED">Offered</option>
              <option value="PLACED">Placed</option>
              <option value="REJECTED">Rejected</option>
              <option value="WITHDRAWN">Withdrawn</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Source</Label>
            <Select
              value={filters.source}
              onChange={(e) =>
                update({
                  source: e.target.value as CandidateFiltersState["source"],
                })
              }
            >
              <option value="">All sources</option>
              <option value="WEBSITE">Website</option>
              <option value="REFERRAL">Referral</option>
              <option value="AGENCY">Agency</option>
              <option value="WALK_IN">Walk-in</option>
              <option value="OTHER">Other</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Job opening</Label>
            <Select
              value={filters.jobOpeningId}
              onChange={(e) => update({ jobOpeningId: e.target.value })}
            >
              <option value="">All openings</option>
              {jobOptions.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </Select>
          </div>
          {showDeletedToggle ? (
            <label className="text-body-md flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.includeDeleted}
                onChange={(e) => update({ includeDeleted: e.target.checked })}
              />
              Include deleted candidates
            </label>
          ) : null}
        </PopoverContent>
      </Popover>
      {activeCount > 0 ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange(defaultCandidateFilters)}
        >
          <X className="size-4" />
          Clear filters
        </Button>
      ) : null}
      {filters.status ? <CandidateStatusBadge status={filters.status} /> : null}
    </div>
  );
}
