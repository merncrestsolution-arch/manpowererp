"use client";

import Link from "next/link";
import { use, useState } from "react";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import {
  useForcePasswordReset,
  useUpdateUser,
  useUser,
} from "@/hooks/use-settings";

import type { Role } from "@prisma/client";

type UserDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = use(params);
  const { data: user, isLoading } = useUser(id);
  const updateUser = useUpdateUser(id);
  const forceReset = useForcePasswordReset(id);
  const [message, setMessage] = useState<string | null>(null);

  if (isLoading || !user) {
    return <div className="bg-muted/40 h-48 animate-pulse rounded-lg border" />;
  }

  return (
    <div className="gap-jk-lg flex flex-col">
      <div className="gap-jk-sm flex flex-wrap items-center justify-between">
        <p className="text-body-md text-muted-foreground">{user.email}</p>
        <Button variant="outline" render={<Link href="/settings/users" />}>
          Back to users
        </Button>
      </div>

      <div className="gap-jk-md bg-card p-jk-md shadow-card grid rounded-lg border md:grid-cols-2">
        <div>
          <p className="text-muted-foreground text-sm">Role</p>
          <Select
            value={user.role}
            onChange={(event) => {
              void updateUser.mutateAsync({
                role: event.target.value as Role,
              });
            }}
          >
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="ADMIN">Admin</option>
            <option value="HR_MANAGER">HR Manager</option>
            <option value="FINANCE_MANAGER">Finance Manager</option>
            <option value="RECRUITER">Recruiter</option>
            <option value="EMPLOYEE">Employee</option>
          </Select>
        </div>
        <div>
          <p className="text-muted-foreground text-sm">Status</p>
          <p className="font-medium">{user.isActive ? "Active" : "Inactive"}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-sm">Last login</p>
          <p className="font-medium">
            {user.lastLoginAt
              ? new Date(user.lastLoginAt).toLocaleString("en-LK")
              : "Never"}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-sm">Branch</p>
          <p className="font-medium">{user.branchName ?? "—"}</p>
        </div>
      </div>

      <div className="gap-jk-sm flex flex-wrap">
        <Button
          variant="outline"
          onClick={() => {
            void updateUser
              .mutateAsync({ isActive: !user.isActive })
              .then(() =>
                setMessage(
                  user.isActive ? "User deactivated" : "User reactivated",
                ),
              );
          }}
        >
          {user.isActive ? "Deactivate user" : "Reactivate user"}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            void forceReset.mutateAsync().then((result) => {
              setMessage(result.message);
            });
          }}
          disabled={forceReset.isPending}
        >
          {forceReset.isPending ? "Sending…" : "Force password reset"}
        </Button>
      </div>

      {message ? (
        <p className="text-muted-foreground text-sm">{message}</p>
      ) : null}
    </div>
  );
}
