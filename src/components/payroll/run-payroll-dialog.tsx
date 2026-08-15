"use client";

import { useQueryClient } from "@tanstack/react-query";
import { PlayCircle } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { runPayrollForPeriod } from "@/hooks/use-payroll";

import type { RunPayrollResult } from "@/types/payroll";

type RunPayrollDialogProps = {
  periodId: string;
  periodLabel: string;
};

export function RunPayrollDialog({
  periodId,
  periodLabel,
}: RunPayrollDialogProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunPayrollResult | null>(null);

  const handleRun = async () => {
    setRunning(true);
    try {
      const payrollResult = await runPayrollForPeriod(periodId);
      setResult(payrollResult);
      await queryClient.invalidateQueries({ queryKey: ["payroll"] });
    } finally {
      setRunning(false);
    }
  };

  const closeDialog = () => {
    setOpen(false);
    setResult(null);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <PlayCircle className="size-4" />
        Run payroll
      </Button>

      <Dialog
        open={open}
        onOpenChange={(next) =>
          !running && (next ? setOpen(true) : closeDialog())
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Run payroll</DialogTitle>
            <DialogDescription>
              Generate draft payslips for all active employees with a basic
              salary for {periodLabel}.
            </DialogDescription>
          </DialogHeader>

          {result ? (
            <div className="space-y-jk-sm bg-muted/30 p-jk-md rounded-lg border text-sm">
              <p>
                <span className="font-medium">{result.created}</span> payslips
                created
              </p>
              <p>
                <span className="font-medium">{result.skipped}</span> skipped
              </p>
              {result.failed > 0 ? (
                <p className="text-destructive">
                  <span className="font-medium">{result.failed}</span> failed
                </p>
              ) : null}
              {result.errors.length > 0 ? (
                <ul className="text-destructive list-disc pl-5">
                  {result.errors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : (
            <p className="text-body-md text-muted-foreground">
              This will pull approved overtime from attendance and apply each
              employee&apos;s effective salary components.
            </p>
          )}

          <DialogFooter>
            {result ? (
              <Button onClick={closeDialog}>Done</Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={closeDialog}
                  disabled={running}
                >
                  Cancel
                </Button>
                <Button onClick={handleRun} disabled={running}>
                  {running ? "Running..." : "Confirm run"}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
