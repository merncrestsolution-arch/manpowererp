"use client";

import { Download, Eye, MoreHorizontal, Pencil } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type DocumentRowActionsProps = {
  viewHref: string;
  pdfHref: string;
  editHref?: string;
};

export function DocumentRowActions({
  viewHref,
  pdfHref,
  editHref,
}: DocumentRowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon-sm" className="ml-auto" />}
      >
        <MoreHorizontal className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          render={
            <Link href={viewHref}>
              <Eye className="size-4" />
              View
            </Link>
          }
        />
        {editHref ? (
          <DropdownMenuItem
            render={
              <Link href={editHref}>
                <Pencil className="size-4" />
                Edit
              </Link>
            }
          />
        ) : null}
        <DropdownMenuItem
          render={
            <a href={pdfHref} download>
              <Download className="size-4" />
              Download PDF
            </a>
          }
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
