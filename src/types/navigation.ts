import type { Role } from "@/types/auth";
import type { LucideIcon } from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  allowedRoles: Role[];
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export type NotificationItem = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
};
