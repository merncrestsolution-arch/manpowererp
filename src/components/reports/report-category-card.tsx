import { ModuleCard } from "@/components/shared/module-card";

import type { LucideIcon } from "lucide-react";

type ReportCategoryCardProps = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

export function ReportCategoryCard(props: ReportCategoryCardProps) {
  return <ModuleCard {...props} />;
}
