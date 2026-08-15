import { SettingsNav } from "@/components/settings/settings-nav";
import { PageShell } from "@/components/shared/page-shell";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageShell
      title="Settings"
      description="Organization profile, mobile app, users, permissions, and backups."
    >
      <SettingsNav />
      {children}
    </PageShell>
  );
}
