"use client";

import { useEffect, useState } from "react";

import type { EmployeeStatus, EmploymentType } from "@prisma/client";

export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export type EmployeeFiltersState = {
  search: string;
  department: string;
  designation: string;
  employmentType: EmploymentType | "";
  status: EmployeeStatus | "";
  includeDeleted: boolean;
};

export const defaultEmployeeFilters: EmployeeFiltersState = {
  search: "",
  department: "",
  designation: "",
  employmentType: "",
  status: "",
  includeDeleted: false,
};
