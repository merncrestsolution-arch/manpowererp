"use client";

import { AlertCircle, CheckCircle2, Loader2, MapPin } from "lucide-react";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { submitCheckIn, submitCheckOut } from "@/hooks/use-attendance";

type GpsCheckInCardProps = {
  mode: "check-in" | "check-out";
};

type GpsState = "idle" | "locating" | "success" | "error";

export function GpsCheckInCard({ mode }: GpsCheckInCardProps) {
  const [state, setState] = useState<GpsState>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleGpsAction = useCallback(() => {
    if (!navigator.geolocation) {
      setState("error");
      setMessage("Geolocation is not supported on this device.");
      return;
    }

    setState("locating");
    setMessage(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const payload = {
            method: "GPS" as const,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };

          if (mode === "check-in") {
            const result = await submitCheckIn(payload);
            setState("success");
            setMessage(
              `Checked in at ${new Date(result.checkInAt).toLocaleTimeString()}`,
            );
          } else {
            const result = await submitCheckOut(payload);
            setState("success");
            setMessage(`Checked out. Worked ${result.workedHours} hours.`);
          }
        } catch (error) {
          setState("error");
          setMessage(
            error instanceof Error ? error.message : "GPS attendance failed",
          );
        }
      },
      (error) => {
        setState("error");
        setMessage(error.message || "Unable to retrieve GPS location");
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }, [mode]);

  return (
    <div className="bg-card p-jk-lg shadow-card mx-auto max-w-lg rounded-xl border">
      <div className="gap-jk-md flex flex-col items-center text-center">
        <div className="bg-primary/10 flex size-16 items-center justify-center rounded-full">
          {state === "locating" ? (
            <Loader2 className="text-primary size-8 animate-spin" />
          ) : state === "success" ? (
            <CheckCircle2 className="size-8 text-green-600" />
          ) : state === "error" ? (
            <AlertCircle className="text-destructive size-8" />
          ) : (
            <MapPin className="text-primary size-8" />
          )}
        </div>

        <div>
          <h2 className="font-heading text-headline-sm">
            {mode === "check-in" ? "GPS Check-in" : "GPS Check-out"}
          </h2>
          <p className="text-muted-foreground text-sm">
            Your location will be validated against your assigned work site.
          </p>
        </div>

        {message ? (
          <p
            className={
              state === "error"
                ? "text-destructive text-sm"
                : "text-sm text-green-700"
            }
          >
            {message}
          </p>
        ) : null}

        <Button
          className="w-full max-w-sm"
          onClick={() => void handleGpsAction()}
          disabled={state === "locating"}
        >
          {state === "locating"
            ? "Getting location..."
            : mode === "check-in"
              ? "Check in with GPS"
              : "Check out with GPS"}
        </Button>
      </div>
    </div>
  );
}
