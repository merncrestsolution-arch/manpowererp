"use client";

import { useQueryClient } from "@tanstack/react-query";
import { QrCode } from "lucide-react";
import { useState } from "react";

import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { generateQrCheckpoint, useQrCheckpoints } from "@/hooks/use-attendance";
import { useWorkLocationsList } from "@/hooks/use-deployment";
import { formatColomboDate } from "@/lib/date";

export function QrCheckpointGenerator() {
  const queryClient = useQueryClient();
  const [workLocationId, setWorkLocationId] = useState("");
  const [expiresInHours, setExpiresInHours] = useState("24");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: locations } = useWorkLocationsList({
    page: 1,
    pageSize: 100,
    filters: {
      search: "",
      clientId: "",
      status: "ACTIVE",
      includeDeleted: false,
    },
    sortBy: "name",
    sortOrder: "asc",
  });

  const { data: checkpoints, isLoading } = useQrCheckpoints();

  const handleGenerate = async () => {
    if (!workLocationId) {
      setError("Select a work location");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      await generateQrCheckpoint({
        workLocationId,
        expiresInHours: Number(expiresInHours),
      });
      await queryClient.invalidateQueries({
        queryKey: ["attendance", "qr-checkpoints"],
      });
    } catch (generateError) {
      setError(
        generateError instanceof Error
          ? generateError.message
          : "Failed to generate QR checkpoint",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const activeCheckpoints = checkpoints ?? [];

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <SectionCard
        title="Generate QR checkpoint"
        description="Create a signed QR code for a work location check-in point."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="workLocationId">Work location</Label>
            <Select
              id="workLocationId"
              value={workLocationId}
              onChange={(event) => setWorkLocationId(event.target.value)}
            >
              <option value="">Select location</option>
              {(locations?.items ?? []).map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="expiresInHours">Expires in (hours)</Label>
            <Input
              id="expiresInHours"
              type="number"
              min={1}
              max={168}
              value={expiresInHours}
              onChange={(event) => setExpiresInHours(event.target.value)}
            />
          </div>
        </div>

        {error ? (
          <p className="text-destructive mt-3 text-sm">{error}</p>
        ) : null}

        <Button
          className="mt-4"
          onClick={() => void handleGenerate()}
          disabled={isGenerating}
        >
          {isGenerating ? "Generating..." : "Generate QR code"}
        </Button>
      </SectionCard>

      <SectionCard
        title="Active checkpoints"
        description="QR codes currently valid for field check-in."
      >
        {isLoading ? (
          <p className="text-muted-foreground text-sm">Loading checkpoints…</p>
        ) : activeCheckpoints.length === 0 ? (
          <div className="border-border flex flex-col items-center justify-center rounded-xl border border-dashed px-4 py-8 text-center">
            <QrCode className="text-muted-foreground mb-2 size-8" />
            <p className="text-foreground text-[14px] font-medium">
              No active checkpoints
            </p>
            <p className="text-muted-foreground mt-1 text-[13px]">
              Generate a QR code to start location check-ins.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {activeCheckpoints.map((checkpoint) => (
              <div
                key={checkpoint.id}
                className="border-border flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-medium">{checkpoint.workLocationName}</p>
                  <p className="text-muted-foreground text-sm">
                    {checkpoint.clientName}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Created{" "}
                    {formatColomboDate(
                      new Date(checkpoint.createdAt),
                      "dd MMM yyyy, hh:mm a",
                    )}
                  </p>
                  {checkpoint.expiresAt ? (
                    <p className="text-muted-foreground text-xs">
                      Expires{" "}
                      {formatColomboDate(
                        new Date(checkpoint.expiresAt),
                        "dd MMM yyyy, hh:mm a",
                      )}
                    </p>
                  ) : null}
                </div>
                {checkpoint.qrDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={checkpoint.qrDataUrl}
                    alt={`QR for ${checkpoint.workLocationName}`}
                    className="size-28 rounded-lg border bg-white p-2"
                  />
                ) : null}
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
