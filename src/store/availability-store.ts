import { create } from "zustand";

export type AvailabilityViewMode = "board" | "list";

type AvailabilityFilterState = {
  department: string;
  designation: string;
  search: string;
  viewMode: AvailabilityViewMode;
  setDepartment: (department: string) => void;
  setDesignation: (designation: string) => void;
  setSearch: (search: string) => void;
  setViewMode: (viewMode: AvailabilityViewMode) => void;
  resetFilters: () => void;
};

const initialState = {
  department: "",
  designation: "",
  search: "",
  viewMode: "board" as AvailabilityViewMode,
};

export const useAvailabilityStore = create<AvailabilityFilterState>((set) => ({
  ...initialState,
  setDepartment: (department) => set({ department }),
  setDesignation: (designation) => set({ designation }),
  setSearch: (search) => set({ search }),
  setViewMode: (viewMode) => set({ viewMode }),
  resetFilters: () => set(initialState),
}));
