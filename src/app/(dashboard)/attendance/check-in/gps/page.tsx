"use client";

import Link from "next/link";
import { useState } from "react";

import { GpsCheckInCard } from "@/components/attendance/gps-check-in-card";
import { PageShell } from "@/components/shared/page-shell";
import { Button } from "@/components/ui/button";

export default function GpsCheckInPage() {
  const [mode, setMode] = useState<"check-in" | "check-out">("check-in");

  return (
    <PageShell
      title="GPS Attendance"
      description="Use your device location to validate check-in at your work site."
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

        <GpsCheckInCard mode={mode} />
      </div>
    </PageShell>
  );
}
