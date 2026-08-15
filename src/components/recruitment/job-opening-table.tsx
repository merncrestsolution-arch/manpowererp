"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useJobOpeningsList } from "@/hooks/use-recruitment";

export function JobOpeningTable() {
  const { data, isLoading } = useJobOpeningsList();

  if (isLoading) {
    return <p className="text-muted-foreground">Loading job openings...</p>;
  }

  const items = data?.items ?? [];

  return (
    <div className="border-border bg-card shadow-card overflow-hidden rounded-2xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Positions</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Candidates</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-muted-foreground text-center"
              >
                No job openings found.
              </TableCell>
            </TableRow>
          ) : (
            items.map((opening) => (
              <TableRow key={opening.id}>
                <TableCell className="font-medium">{opening.title}</TableCell>
                <TableCell>{opening.department ?? "—"}</TableCell>
                <TableCell>{opening.clientName ?? "Internal"}</TableCell>
                <TableCell>{opening.positionsAvailable}</TableCell>
                <TableCell>
                  <Badge variant="outline">{opening.status}</Badge>
                </TableCell>
                <TableCell>{opening.candidateCount}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    render={
                      <Link href={`/recruitment/job-openings/${opening.id}`} />
                    }
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
