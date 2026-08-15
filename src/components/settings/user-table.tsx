"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { SettingsUserItem } from "@/types/settings";

type UserTableProps = {
  users: SettingsUserItem[];
  isLoading?: boolean;
};

export function UserTable({ users, isLoading = false }: UserTableProps) {
  if (isLoading) {
    return <div className="bg-muted/40 h-48 animate-pulse rounded-lg border" />;
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last login</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-muted-foreground">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <span
                    className={
                      user.isActive ? "text-success" : "text-destructive"
                    }
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell>
                  {user.lastLoginAt
                    ? new Date(user.lastLoginAt).toLocaleString("en-LK")
                    : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    render={<Link href={`/settings/users/${user.id}`} />}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
