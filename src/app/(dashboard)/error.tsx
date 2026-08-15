"use client";

import { Button } from "@/components/ui/button";

type DashboardErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  return (
    <div className="border-border bg-card shadow-card flex min-h-[320px] flex-col items-center justify-center rounded-2xl border px-6 py-12 text-center">
      <h2 className="font-heading text-foreground text-[20px] font-semibold">
        This page could not load
      </h2>
      <p className="text-muted-foreground mt-2 max-w-md text-[14px] leading-5">
        {error.message || "An unexpected error occurred. Try again."}
      </p>
      <Button className="mt-5" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
