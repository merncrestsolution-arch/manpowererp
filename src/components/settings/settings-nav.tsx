"use client";

import { HubNav } from "@/components/shared/hub-nav";

const settingsNavItems = [
  { label: "Company", href: "/settings/company" },
  { label: "Mobile app", href: "/settings/mobile-app" },
  { label: "Users", href: "/settings/users" },
  { label: "Roles & permissions", href: "/settings/roles-permissions" },
  { label: "Backup", href: "/settings/backup" },
  { label: "Audit logs", href: "/settings/audit-logs" },
];

type SettingsNavProps = {
  className?: string;
};

export function SettingsNav({ className }: SettingsNavProps) {
  return <HubNav items={settingsNavItems} className={className} />;
}
