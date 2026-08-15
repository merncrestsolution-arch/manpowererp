import {
  DatabaseBackup,
  ScrollText,
  Settings,
  Shield,
  Smartphone,
  Users,
} from "lucide-react";

import { ModuleCard } from "@/components/shared/module-card";
import { PageShell } from "@/components/shared/page-shell";

const adminLinks = [
  {
    href: "/settings/users",
    title: "Users",
    description: "Create accounts, assign roles, and manage access.",
    icon: Users,
  },
  {
    href: "/settings/roles-permissions",
    title: "Roles & permissions",
    description: "Control what each role can view and change.",
    icon: Shield,
  },
  {
    href: "/settings/company",
    title: "Company settings",
    description: "Organization profile, branding, and fiscal year.",
    icon: Settings,
  },
  {
    href: "/settings/backup",
    title: "Backup",
    description: "Run and download database backups.",
    icon: DatabaseBackup,
  },
  {
    href: "/settings/audit-logs",
    title: "Audit logs",
    description: "Review who changed records and when.",
    icon: ScrollText,
  },
  {
    href: "/mobile-preview",
    title: "Mobile companion",
    description: "Preview the field worker attendance app.",
    icon: Smartphone,
  },
];

export default function AdminPage() {
  return (
    <PageShell
      title="Admin"
      description="System administration, access control, and product tools."
    >
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {adminLinks.map((link) => (
          <ModuleCard key={link.href} {...link} />
        ))}
      </div>
    </PageShell>
  );
}
