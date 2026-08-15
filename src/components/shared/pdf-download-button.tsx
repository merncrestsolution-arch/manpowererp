"use client";

import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";

type PdfDownloadButtonProps = {
  href: string;
  label?: string;
  variant?: "outline" | "ghost";
};

export function PdfDownloadButton({
  href,
  label = "Download PDF",
  variant = "outline",
}: PdfDownloadButtonProps) {
  return (
    <Button variant={variant} render={<a href={href} download />}>
      <Download className="size-4" />
      {label}
    </Button>
  );
}
