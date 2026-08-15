"use client";

import Link from "next/link";
import { useState } from "react";

import { UserTable } from "@/components/settings/user-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUsers } from "@/hooks/use-settings";

export default function UsersSettingsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useUsers({ page, pageSize: 20, search });

  return (
    <div className="gap-jk-lg flex flex-col">
      <div className="gap-jk-sm flex flex-wrap items-center justify-between">
        <p className="text-body-md text-muted-foreground">
          Manage user accounts, roles, and access
        </p>
        <Button render={<Link href="/settings/users/new" />}>Add user</Button>
      </div>

      <Input
        placeholder="Search by name or email"
        value={search}
        onChange={(event) => {
          setSearch(event.target.value);
          setPage(1);
        }}
        className="max-w-sm"
      />

      <UserTable users={data?.items ?? []} isLoading={isLoading} />

      {data && data.totalPages > 1 ? (
        <div className="gap-jk-sm flex items-center">
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((current) => current - 1)}
          >
            Previous
          </Button>
          <span className="text-muted-foreground text-sm">
            Page {data.page} of {data.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page >= data.totalPages}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </Button>
        </div>
      ) : null}
    </div>
  );
}
