"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

import { QrScanner } from "@/components/attendance/qr-scanner";
import { PageShell } from "@/components/shared/page-shell";
import { Button } from "@/components/ui/button";
import { submitCheckIn, submitCheckOut } from "@/hooks/use-attendance";

export default function QrCheckInPage() {
  const [mode, setMode] = useState<"check-in" | "check-out">("check-in");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleScan = useCallback(
    async (code: string) => {
      if (isProcessing) {
        return;
      }

      setIsProcessing(true);
      setStatusMessage(null);

      try {
        if (mode === "check-in") {
          const result = await submitCheckIn({ method: "QR", qrCode: code });
          setStatusMessage(
            `Checked in successfully at ${new Date(result.checkInAt).toLocaleTimeString()}`,
          );
        } else {
          const result = await submitCheckOut({ method: "QR", qrCode: code });
          setStatusMessage(
            `Checked out successfully. Worked ${result.workedHours} hours.`,
          );
        }
      } catch (error) {
        setStatusMessage(
          error instanceof Error ? error.message : "QR attendance failed",
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [isProcessing, mode],
  );

  return (
    <PageShell
      title="QR Attendance"
      description="Scan the checkpoint QR code at your work location."
      actions={
        <Button variant="outline" render={<Link href="/attendance" />}>
          Back
        </Button>
      }
    >
      <div className="space-y-jk-lg mx-auto w-full max-w-2xl">
        <div className="border-border bg-card shadow-card inline-flex h-9 items-center rounded-xl border p-0.5">
          <Button
            variant={mode === "check-in" ? "default" : "ghost"}
            className="h-8 px-3"
            onClick={() => setMode("check-in")}
          >
            Check in
          </Button>
          <Button
            variant={mode === "check-out" ? "default" : "ghost"}
            className="h-8 px-3"
            onClick={() => setMode("check-out")}
          >
            Check out
          </Button>
        </div>

        <QrScanner onScan={(code) => void handleScan(code)} />

        {statusMessage ? (
          <p className="bg-muted/40 p-jk-sm rounded-lg border text-sm">
            {statusMessage}
          </p>
        ) : null}
      </div>
    </PageShell>
  );
}
