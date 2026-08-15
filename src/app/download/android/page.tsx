import { Download, Smartphone } from "lucide-react";
import Link from "next/link";

import { BrandLogo } from "@/components/brand/brand-logo";
import { buttonVariants } from "@/components/ui/button";
import { getMobileApkUrl } from "@/lib/mobile-apk";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AndroidDownloadPage() {
  const apkUrl = await getMobileApkUrl();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#041433] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(0,136,209,0.4),transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(80,178,254,0.16),transparent_44%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-16">
        <BrandLogo variant="onDark" priority className="w-[200px]" />

        <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
          <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-[#2563eb] shadow-[0_12px_40px_rgba(37,99,235,0.45)]">
            <Smartphone className="size-7" aria-hidden="true" />
          </span>
          <h1 className="font-heading mt-6 text-3xl tracking-tight">
            JK Manpower for Android
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            Check in, view shifts, and get payslips from your phone.
            High-fidelity workforce tools, built for the field.
          </p>

          {apkUrl ? (
            <a
              href={apkUrl}
              download="jk-manpower.apk"
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "mt-8 h-12 w-full rounded-xl bg-[#2563eb] text-base font-semibold",
              )}
            >
              <Download className="size-4" aria-hidden="true" />
              Download APK
            </a>
          ) : (
            <div className="mt-8 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300">
              The Android installer is not published yet. Admins can add the APK
              URL under Settings → Mobile app.
            </div>
          )}

          <p className="mt-4 text-xs text-slate-400">
            Android may warn about installing from this source. Choose{" "}
            <span className="text-white">Install anyway</span> after reviewing
            the app details.
          </p>
        </div>

        <Link
          href="/login"
          className="mt-8 text-center text-sm font-medium text-[#50b2fe] hover:underline"
        >
          Back to web sign-in
        </Link>
      </div>
    </main>
  );
}
