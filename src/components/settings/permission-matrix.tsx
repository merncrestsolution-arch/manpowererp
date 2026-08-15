"use client";

import {
  BarChart3,
  Building2,
  Check,
  Clock,
  FileText,
  Landmark,
  MapPinned,
  Receipt,
  Settings,
  ShieldCheck,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";

import {
  usePermissionMatrix,
  useUpdateRolePermission,
} from "@/hooks/use-settings";
import { cn } from "@/lib/utils";

import type { Role } from "@prisma/client";
import type { LucideIcon } from "lucide-react";

const MODULE_ICONS: Record<string, LucideIcon> = {
  Employee: Users,
  Client: Building2,
  Recruitment: UserPlus,
  Deployment: MapPinned,
  Attendance: Clock,
  Payroll: Wallet,
  Expenses: Receipt,
  Invoices: FileText,
  Finance: Landmark,
  Reports: BarChart3,
  Settings: Settings,
};

const ROLE_META: Record<
  string,
  { short: string; label: string; tone: "navy" | "cyan" | "slate" }
> = {
  SUPER_ADMIN: { short: "SA", label: "Super Admin", tone: "navy" },
  ADMIN: { short: "AD", label: "Admin", tone: "cyan" },
  HR_MANAGER: { short: "HR", label: "HR Manager", tone: "slate" },
  FINANCE_MANAGER: { short: "FN", label: "Finance", tone: "slate" },
  RECRUITER: { short: "RC", label: "Recruiter", tone: "slate" },
  EMPLOYEE: { short: "EM", label: "Employee", tone: "slate" },
};

function roleMeta(role: string) {
  return (
    ROLE_META[role] ?? {
      short: role.slice(0, 2),
      label: role.replace(/_/g, " "),
      tone: "slate" as const,
    }
  );
}

function moduleSlug(module: string) {
  return module.toLowerCase().replace(/\s+/g, "-");
}

function ModuleIcon({ module }: { module: string }) {
  const Icon = MODULE_ICONS[module] ?? ShieldCheck;
  return <Icon className="size-4" aria-hidden />;
}

export function PermissionMatrix() {
  const { data: matrix, isLoading } = usePermissionMatrix();
  const updatePermission = useUpdateRolePermission();

  if (isLoading || !matrix) {
    return (
      <div className="space-y-4">
        <div className="h-36 animate-pulse rounded-2xl bg-[#041433]/80" />
        <div className="border-border bg-card h-14 animate-pulse rounded-2xl border" />
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="border-border bg-card h-56 animate-pulse rounded-2xl border"
          />
        ))}
      </div>
    );
  }

  const modules = Array.from(
    new Set(matrix.permissions.map((permission) => permission.module)),
  );

  const totalGrants = matrix.permissions.reduce(
    (sum, permission) =>
      sum +
      matrix.roles.filter((role) => matrix.grants[role]?.[permission.id])
        .length,
    0,
  );
  const totalCells = matrix.permissions.length * matrix.roles.length;

  return (
    <div className="space-y-5">
      <section className="shadow-elevated relative overflow-hidden rounded-2xl bg-[#041433] bg-[linear-gradient(135deg,#041433_0%,#0a2b58_62%,#0869a8_140%)] px-5 py-5 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(80,178,254,0.28),transparent_52%)]" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-[#50b2fe] uppercase">
              Access control
            </p>
            <h2 className="font-heading mt-2 text-[22px] leading-7 font-semibold tracking-tight">
              Roles & permissions
            </h2>
            <p className="mt-2 text-[14px] leading-5 text-white/70">
              Click a box to grant or remove access. Changes save immediately.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Modules", value: modules.length },
              { label: "Permissions", value: matrix.permissions.length },
              { label: "Grants", value: `${totalGrants}/${totalCells}` },
            ].map((stat) => (
              <div
                key={stat.label}
                className="min-w-[96px] rounded-xl border border-white/15 bg-white/10 px-3 py-2.5"
              >
                <p className="text-[11px] font-medium text-white/65">
                  {stat.label}
                </p>
                <p className="font-heading mt-1 text-[18px] leading-6 font-semibold tabular-nums">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {updatePermission.isError ? (
        <p className="border-destructive/20 bg-destructive/5 text-destructive rounded-xl border px-4 py-3 text-sm">
          Could not save that permission. Try again.
        </p>
      ) : null}

      <nav className="border-border bg-card shadow-card flex flex-wrap gap-1 rounded-2xl border p-1.5">
        {modules.map((module) => (
          <a
            key={module}
            href={`#module-${moduleSlug(module)}`}
            className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium transition-colors"
          >
            <ModuleIcon module={module} />
            {module}
          </a>
        ))}
      </nav>

      <div className="space-y-4">
        {modules.map((module) => {
          const modulePermissions = matrix.permissions.filter(
            (permission) => permission.module === module,
          );
          const grantedCount = modulePermissions.reduce(
            (sum, permission) =>
              sum +
              matrix.roles.filter(
                (role) => matrix.grants[role]?.[permission.id],
              ).length,
            0,
          );
          const cellCount = modulePermissions.length * matrix.roles.length;

          return (
            <section
              key={module}
              id={`module-${moduleSlug(module)}`}
              className="border-border bg-card shadow-card scroll-mt-6 overflow-hidden rounded-2xl border"
            >
              <div className="border-border flex flex-wrap items-center justify-between gap-3 border-b bg-[linear-gradient(90deg,rgba(4,20,51,0.04),transparent_70%)] px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="jk-icon-well">
                    <ModuleIcon module={module} />
                  </span>
                  <div>
                    <h3 className="font-heading text-foreground text-[16px] leading-6 font-semibold">
                      {module}
                    </h3>
                    <p className="text-muted-foreground text-[13px] leading-5">
                      {modulePermissions.length} permission
                      {modulePermissions.length === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
                <span className="bg-primary/10 text-primary inline-flex h-7 items-center rounded-full px-3 text-[12px] font-medium">
                  {grantedCount} of {cellCount} granted
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                  <thead>
                    <tr className="border-border bg-muted/40 border-b">
                      <th className="bg-muted/40 text-muted-foreground sticky left-0 z-10 min-w-[240px] px-5 py-3 text-left text-[12px] font-semibold tracking-wide uppercase">
                        Permission
                      </th>
                      {matrix.roles.map((role) => {
                        const meta = roleMeta(role);
                        return (
                          <th
                            key={role}
                            className="min-w-[104px] px-2 py-3 text-center"
                          >
                            <div className="flex flex-col items-center gap-1.5">
                              <span
                                className={cn(
                                  "flex size-8 items-center justify-center rounded-lg text-[11px] font-semibold",
                                  meta.tone === "navy" &&
                                    "bg-[#041433] text-white",
                                  meta.tone === "cyan" &&
                                    "bg-primary text-primary-foreground",
                                  meta.tone === "slate" &&
                                    "bg-secondary text-secondary-foreground",
                                )}
                              >
                                {meta.short}
                              </span>
                              <span className="text-muted-foreground text-[11px] leading-4 font-medium">
                                {meta.label}
                              </span>
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {modulePermissions.map((permission) => (
                      <tr
                        key={permission.id}
                        className="group border-border hover:bg-muted/25 border-b last:border-0"
                      >
                        <td className="bg-card group-hover:bg-muted/25 sticky left-0 z-10 px-5 py-3.5">
                          <p className="text-foreground font-medium">
                            {permission.description}
                          </p>
                        </td>
                        {matrix.roles.map((role) => {
                          const granted =
                            matrix.grants[role]?.[permission.id] ?? false;
                          const meta = roleMeta(role);

                          return (
                            <td
                              key={role}
                              className={cn(
                                "px-2 py-3.5 text-center",
                                granted && "bg-primary/5",
                              )}
                            >
                              <div className="flex justify-center">
                                <button
                                  type="button"
                                  role="checkbox"
                                  aria-checked={granted}
                                  aria-label={`${permission.description} for ${meta.label}`}
                                  onClick={() => {
                                    void updatePermission.mutateAsync({
                                      role: role as Role,
                                      permissionId: permission.id,
                                      isGranted: !granted,
                                    });
                                  }}
                                  className={cn(
                                    "flex size-8 cursor-pointer items-center justify-center rounded-lg border transition-colors",
                                    granted
                                      ? "border-primary bg-primary hover:bg-primary/90 text-white"
                                      : "border-input bg-card hover:border-primary/50 hover:bg-primary/10 hover:text-primary/40 text-transparent",
                                  )}
                                >
                                  <Check className="size-4" strokeWidth={2.5} />
                                </button>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
