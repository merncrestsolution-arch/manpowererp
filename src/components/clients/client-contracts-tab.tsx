"use client";

import { ExternalLink, FileText, Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { ContractStatusBadge } from "@/components/clients/client-status-badge";
import { ContractFormDialog } from "@/components/clients/contract-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useClientContracts } from "@/hooks/use-clients";
import { formatColomboDate } from "@/lib/date";
import { cn } from "@/lib/utils";

import type { ClientContractItem } from "@/types/client";

type ClientContractsTabProps = {
  clientId: string;
  canTerminate?: boolean;
};

export function ClientContractsTab({
  clientId,
  canTerminate = false,
}: ClientContractsTabProps) {
  const { data: contracts = [], isLoading } = useClientContracts(clientId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContract, setEditingContract] =
    useState<ClientContractItem | null>(null);

  if (isLoading) {
    return (
      <p className="text-body-md text-muted-foreground">Loading contracts...</p>
    );
  }

  return (
    <div className="space-y-jk-md">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Contracts</h3>
          <p className="text-body-md text-muted-foreground">
            Track agreements, documents, and expiry dates.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setEditingContract(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="size-4" />
          Add contract
        </Button>
      </div>

      {contracts.length === 0 ? (
        <div className="p-jk-lg text-muted-foreground rounded-lg border border-dashed text-center">
          No contracts on file.
        </div>
      ) : (
        <div className="space-y-jk-sm">
          {contracts.map((contract) => (
            <div
              key={contract.id}
              className={cn(
                "bg-card p-jk-md rounded-lg border",
                contract.isExpiringSoon && "border-amber-500/50 bg-amber-500/5",
              )}
            >
              <div className="gap-jk-sm flex flex-col sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{contract.title}</p>
                    <ContractStatusBadge status={contract.status} />
                    {contract.isExpiringSoon ? (
                      <Badge className="border-amber-500/30 bg-amber-500/10 text-amber-700">
                        Expiring soon
                      </Badge>
                    ) : null}
                  </div>
                  <p className="text-label-md text-muted-foreground">
                    {contract.contractNo}
                  </p>
                  <p className="text-body-md text-muted-foreground mt-1">
                    {formatColomboDate(
                      new Date(contract.startDate),
                      "dd MMM yyyy",
                    )}{" "}
                    –{" "}
                    {formatColomboDate(
                      new Date(contract.endDate),
                      "dd MMM yyyy",
                    )}
                  </p>
                  {contract.terms ? (
                    <p className="text-body-md mt-2">{contract.terms}</p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  {contract.fileUrl ? (
                    <Button
                      variant="outline"
                      size="sm"
                      render={
                        <Link
                          href={contract.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      }
                    >
                      <ExternalLink className="size-4" />
                      View document
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" disabled>
                      <FileText className="size-4" />
                      No document
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingContract(contract);
                      setDialogOpen(true);
                    }}
                  >
                    <Pencil className="size-4" />
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ContractFormDialog
        clientId={clientId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        contract={editingContract}
        canTerminate={canTerminate}
      />
    </div>
  );
}
