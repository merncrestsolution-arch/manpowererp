"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchApiData, patchApiData, postApiData } from "@/lib/api-client";

import type { UpdateCompanySettingsInput } from "@/application/dto/company-settings.schema";
import type {
  ListAuditLogsQuery,
  UpdateRolePermissionInput,
} from "@/application/dto/role-permission.schema";
import type {
  CreateUserInput,
  ListUsersQuery,
  UpdateUserInput,
} from "@/application/dto/user.schema";
import type { PaginatedResult } from "@/types/employee";
import type {
  AuditLogItem,
  BackupRecordItem,
  CompanySettingsItem,
  RolePermissionMatrix,
  SettingsUserDetail,
  SettingsUserItem,
} from "@/types/settings";

export function useCompanySettings() {
  return useQuery({
    queryKey: ["settings", "company"],
    queryFn: () =>
      fetchApiData<CompanySettingsItem | null>("/api/settings/company"),
  });
}

export function useUpdateCompanySettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateCompanySettingsInput) =>
      patchApiData<CompanySettingsItem>("/api/settings/company", input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["settings", "company"] });
    },
  });
}

export function useUsers(query: ListUsersQuery) {
  const searchParams = new URLSearchParams({
    page: String(query.page),
    pageSize: String(query.pageSize),
  });
  if (query.search) searchParams.set("search", query.search);
  if (query.role) searchParams.set("role", query.role);
  if (query.isActive) searchParams.set("isActive", query.isActive);

  return useQuery({
    queryKey: ["settings", "users", query],
    queryFn: () =>
      fetchApiData<PaginatedResult<SettingsUserItem>>(
        `/api/settings/users?${searchParams.toString()}`,
      ),
  });
}

export function useUser(userId: string) {
  return useQuery({
    queryKey: ["settings", "users", userId],
    queryFn: () =>
      fetchApiData<SettingsUserDetail>(`/api/settings/users/${userId}`),
    enabled: Boolean(userId),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateUserInput) =>
      postApiData<SettingsUserDetail>("/api/settings/users", input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["settings", "users"] });
    },
  });
}

export function useUpdateUser(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateUserInput) =>
      patchApiData<SettingsUserDetail>(`/api/settings/users/${userId}`, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["settings", "users"] });
      void queryClient.invalidateQueries({
        queryKey: ["settings", "users", userId],
      });
    },
  });
}

export function useForcePasswordReset(userId: string) {
  return useMutation({
    mutationFn: () =>
      postApiData<{ message: string }>(
        `/api/settings/users/${userId}/reset-password`,
        {},
      ),
  });
}

export function usePermissionMatrix() {
  return useQuery({
    queryKey: ["settings", "permissions"],
    queryFn: () =>
      fetchApiData<RolePermissionMatrix>("/api/settings/permissions"),
  });
}

export function useUpdateRolePermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateRolePermissionInput) =>
      patchApiData<RolePermissionMatrix>("/api/settings/permissions", input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({
        queryKey: ["settings", "permissions"],
      });
      const previous = queryClient.getQueryData<RolePermissionMatrix>([
        "settings",
        "permissions",
      ]);

      if (previous) {
        queryClient.setQueryData<RolePermissionMatrix>(
          ["settings", "permissions"],
          {
            ...previous,
            grants: {
              ...previous.grants,
              [input.role]: {
                ...(previous.grants[input.role] ?? {}),
                [input.permissionId]: input.isGranted,
              },
            },
          },
        );
      }

      return { previous };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["settings", "permissions"], context.previous);
      }
    },
    onSuccess: (matrix) => {
      queryClient.setQueryData(["settings", "permissions"], matrix);
    },
  });
}

export function useBackupHistory() {
  return useQuery({
    queryKey: ["settings", "backup", "history"],
    queryFn: () =>
      fetchApiData<BackupRecordItem[]>("/api/settings/backup/history"),
  });
}

export function useTriggerBackup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => postApiData<BackupRecordItem>("/api/settings/backup", {}),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["settings", "backup", "history"],
      });
    },
  });
}

export function useAuditLogs(query: ListAuditLogsQuery) {
  const searchParams = new URLSearchParams({
    page: String(query.page),
    pageSize: String(query.pageSize),
  });
  if (query.userId) searchParams.set("userId", query.userId);
  if (query.action) searchParams.set("action", query.action);
  if (query.entityType) searchParams.set("entityType", query.entityType);
  if (query.dateFrom) searchParams.set("dateFrom", query.dateFrom);
  if (query.dateTo) searchParams.set("dateTo", query.dateTo);

  return useQuery({
    queryKey: ["settings", "audit-logs", query],
    queryFn: () =>
      fetchApiData<PaginatedResult<AuditLogItem>>(
        `/api/settings/audit-logs?${searchParams.toString()}`,
      ),
  });
}
