import { CalendarCheck, MapPinned, ShieldCheck, Wallet } from "lucide-react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { cn } from "@/lib/utils";

const capabilities = [
  {
    icon: CalendarCheck,
    title: "Live attendance",
    detail: "QR check-in, shifts, and exception tracking.",
  },
  {
    icon: Wallet,
    title: "Payroll in one pass",
    detail: "Runs, payslips, and statutory calculations.",
  },
  {
    icon: MapPinned,
    title: "Client deployments",
    detail: "Place people, track contracts, stay in control.",
  },
];

type AuthShellProps = {
  children: React.ReactNode;
  className?: string;
};

export function AuthShell({ children, className }: AuthShellProps) {
  const year = new Date().getFullYear();

  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      <aside className="relative hidden overflow-hidden bg-[#041433] text-white lg:flex lg:flex-col">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(0,136,209,0.38),transparent_52%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(80,178,254,0.14),transparent_46%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="bg-primary/30 pointer-events-none absolute top-24 -left-24 size-72 rounded-full blur-3xl" />
        <div className="bg-jk-cyan-soft/10 pointer-events-none absolute -right-16 bottom-10 size-80 rounded-full blur-3xl" />

        <div className="relative z-10 flex min-h-screen flex-col justify-between px-12 py-12 xl:px-16 xl:py-14">
          <BrandLogo
            variant="onDark"
            priority
            className="w-[220px] max-w-full"
          />

          <div className="max-w-xl">
            <p className="text-xs font-semibold tracking-[0.28em] text-[#50b2fe] uppercase">
              Workforce command
            </p>
            <h2 className="font-heading mt-4 text-[2.6rem] leading-[1.12] tracking-tight xl:text-5xl">
              Run your workforce with precision.
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-slate-300">
              Attendance, payroll, deployments, and client operations — one
              secure workspace for JK Manpower.
            </p>

            <ul className="mt-10 grid gap-3">
              {capabilities.map((item) => (
                <li
                  key={item.title}
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 backdrop-blur-sm"
                >
                  <span className="bg-primary/80 mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl text-white">
                    <item.icon className="size-4" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-white">
                      {item.title}
                    </span>
                    <span className="mt-0.5 block text-sm text-slate-300">
                      {item.detail}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-between gap-6 border-t border-white/10 pt-6">
            <p className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck
                className="size-3.5 text-[#50b2fe]"
                aria-hidden="true"
              />
              Encrypted sign-in · Role-based access
            </p>
            <p className="text-xs text-slate-500">© {year} JK Manpower ERP</p>
          </div>
        </div>
      </aside>

      <main className="bg-background relative flex min-h-screen flex-col justify-center px-5 py-10 sm:px-10 lg:px-14 xl:px-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,136,209,0.08),transparent_42%)]" />

        <div className="relative mx-auto w-full max-w-[440px]">
          <div className="mb-10 lg:hidden">
            <BrandLogo variant="color" priority className="h-16 w-auto" />
          </div>

          <div className={cn("flex flex-col", className)}>{children}</div>
        </div>
      </main>
    </div>
  );
}
