"use client";

import { useQueryClient } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDeploymentContracts } from "@/hooks/use-deployment";
import { formatColomboDate } from "@/lib/date";
import { UploadButton } from "@/lib/uploadthing";

type DeploymentContractTabProps = {
  deploymentId: string;
};

export function DeploymentContractTab({
  deploymentId,
}: DeploymentContractTabProps) {
  const queryClient = useQueryClient();
  const { data: contracts = [], isLoading } =
    useDeploymentContracts(deploymentId);
  const [title, setTitle] = useState("Work Order");

  if (isLoading) {
    return (
      <p className="text-body-md text-muted-foreground">Loading contracts...</p>
    );
  }

  return (
    <div className="space-y-jk-md">
      <Card className="shadow-card">
        <CardContent className="gap-jk-md flex flex-wrap items-end pt-(--card-spacing)">
          <div className="space-y-2">
            <Label htmlFor="contractTitle">Document title</Label>
            <Input
              id="contractTitle"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Work order / assignment letter"
            />
          </div>
          <UploadButton
            endpoint="deploymentContract"
            input={{ deploymentId, title }}
            onClientUploadComplete={() => {
              void queryClient.invalidateQueries({
                queryKey: ["deployment", deploymentId, "contracts"],
              });
            }}
            appearance={{
              button:
                "bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md text-sm font-medium",
            }}
          />
        </CardContent>
      </Card>

      {contracts.length === 0 ? (
        <p className="text-body-md text-muted-foreground">
          No deployment work orders uploaded yet.
        </p>
      ) : (
        <div className="space-y-jk-sm">
          {contracts.map((contract) => (
            <div
              key={contract.id}
              className="bg-card px-jk-md py-jk-sm flex items-center justify-between rounded-lg border"
            >
              <div className="gap-jk-sm flex items-center">
                <FileText className="text-muted-foreground size-5" />
                <div>
                  <p className="font-medium">{contract.title}</p>
                  <p className="text-label-md text-muted-foreground">
                    Uploaded {formatColomboDate(new Date(contract.createdAt))}
                    {contract.expiresAt
                      ? ` · Expires ${formatColomboDate(new Date(contract.expiresAt))}`
                      : ""}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                render={
                  <a href={contract.fileUrl} target="_blank" rel="noreferrer" />
                }
              >
                View
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
