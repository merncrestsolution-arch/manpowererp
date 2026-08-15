"use client";

import type { ClientStatus } from "@prisma/client";

export type ClientFiltersState = {
  search: string;
  industry: string;
  city: string;
  status: ClientStatus | "";
  includeDeleted: boolean;
};

export const defaultClientFilters: ClientFiltersState = {
  search: "",
  industry: "",
  city: "",
  status: "",
  includeDeleted: false,
};
