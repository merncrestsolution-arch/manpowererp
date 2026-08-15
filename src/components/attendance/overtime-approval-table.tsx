"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { approveOvertimeRecord, useOvertimeList } from "@/hooks/use-attendance";
import { formatColomboDate } from "@/lib/date";

export function OvertimeApprovalTable() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { data, isLoading } = useOvertimeList({
    page,
    pageSize: 10,
    status: "PENDING",
  });

  const handleApprove = async (id: string, status: "APPROVED" | "REJECTED") => {
    setProcessingId(id);

    try {
      await approveOvertimeRecord(id, status);
      await queryClient.invalidateQueries({
        queryKey: ["attendance", "overtime"],
      });
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <p className="text-muted-foreground">Loading overtime requests...</p>
    );
  }

  return (
    <div className="space-y-jk-md">
      <div className="bg-card shadow-card rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data?.items ?? []).length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-muted-foreground text-center"
                >
                  No pending overtime requests.
                </TableCell>
              </TableRow>
            ) : (
              data?.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.employeeName}</p>
                      <p className="text-muted-foreground text-xs">
                        {item.employeeNo}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatColomboDate(new Date(item.date), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell>{item.hours.toFixed(2)}h</TableCell>
                  <TableCell>{item.rateMultiplier}x</TableCell>
                  <TableCell className="text-right">
                    <div className="gap-jk-xs flex justify-end">
                      <Button
                        size="sm"
                        onClick={() => void handleApprove(item.id, "APPROVED")}
                        disabled={processingId === item.id}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => void handleApprove(item.id, "REJECTED")}
                        disabled={processingId === item.id}
                      >
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {data && data.totalPages > 1 ? (
        <div className="gap-jk-sm flex items-center justify-end">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((current) => current - 1)}
          >
            Previous
          </Button>
          <span className="text-muted-foreground text-sm">
            Page {page} of {data.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
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
