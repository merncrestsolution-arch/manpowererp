"use client";

import { Download } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ApkDownloadButtonProps = {
  className?: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  label?: string;
};

export function ApkDownloadButton({
  className,
  variant = "outline",
  size = "sm",
  label = "Download APK",
}: ApkDownloadButtonProps) {
  return (
    <Link
      href="/download/android"
      className={cn(buttonVariants({ variant, size }), "gap-2", className)}
    >
      <Download className="size-4" aria-hidden="true" />
      {label}
    </Link>
  );
}
