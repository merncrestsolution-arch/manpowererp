import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { auth } from "@/infrastructure/auth/auth";

export default async function DashboardGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <DashboardShell
      user={{
        name: session.user.name ?? "User",
        email: session.user.email ?? "",
        image: session.user.image,
      }}
      role={session.user.role}
    >
      {children}
    </DashboardShell>
  );
}
