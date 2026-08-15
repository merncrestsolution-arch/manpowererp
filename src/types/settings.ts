export type CompanySettingsItem = {
  id: string;
  organizationId: string;
  name: string;
  registrationNo: string | null;
  address: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  logoUrl: string | null;
  taxId: string | null;
  fiscalYearStart: number;
  updatedAt: string;
};

export type SettingsUserItem = {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  branchId: string | null;
  branchName: string | null;
  createdAt: string;
};

export type SettingsUserDetail = SettingsUserItem & {
  updatedAt: string;
};

export type PermissionItem = {
  id: string;
  code: string;
  module: string;
  description: string;
};

export type RolePermissionMatrix = {
  roles: string[];
  permissions: PermissionItem[];
  grants: Record<string, Record<string, boolean>>;
};

export type AuditLogItem = {
  id: string;
  userId: string | null;
  userName: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  changes: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
};

export type BackupRecordItem = {
  id: string;
  status: string;
  fileSize: number | null;
  storageLocation: string | null;
  completedAt: string | null;
  errorMessage: string | null;
  triggeredByName: string;
  createdAt: string;
};
