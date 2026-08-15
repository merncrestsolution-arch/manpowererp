"use client";

import {
  Smartphone,
  QrCode,
  MapPin,
  Calendar,
  FileText,
  Home,
  Clock,
  CheckCircle2,
  Lock,
  Sun,
  Moon,
  Sparkles,
  Download,
} from "lucide-react";
import React, { useState } from "react";

import { PageShell } from "@/components/shared/page-shell";
import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function MobilePreviewPage() {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "checkin" | "leave" | "payslip" | "login"
  >("dashboard");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);

  return (
    <PageShell
      title="JK Manpower Field Worker Companion App"
      description="Native mobile UI designed with Google Stitch design tokens for field supervisors and deployed staff."
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="gap-2"
        >
          {isDarkMode ? (
            <Sun className="h-4 w-4 text-amber-500" />
          ) : (
            <Moon className="h-4 w-4 text-slate-700" />
          )}
          {isDarkMode ? "Light Mode" : "Dark Mode"}
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600">
          <Smartphone className="h-3.5 w-3.5" /> Flutter Companion App Shell
        </div>

        {/* Main Emulator Layout */}
        <div className="grid w-full grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* Controls Column */}
          <div className="space-y-4 lg:col-span-5">
            <Card>
              <CardContent className="space-y-4 p-5">
                <h3 className="font-heading flex items-center gap-2 text-base font-semibold">
                  <Sparkles className="text-primary h-4 w-4" /> Screen Selector
                </h3>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Click any screen below to preview how field personnel interact
                  with attendance, leave, payslips, and location tracking on
                  mobile devices.
                </p>

                <div className="flex flex-col gap-2">
                  <Button
                    variant={activeTab === "dashboard" ? "default" : "outline"}
                    className="justify-start gap-3"
                    onClick={() => setActiveTab("dashboard")}
                  >
                    <Home className="h-4 w-4" /> 1. Worker Home Dashboard
                  </Button>
                  <Button
                    variant={activeTab === "checkin" ? "default" : "outline"}
                    className="justify-start gap-3"
                    onClick={() => setActiveTab("checkin")}
                  >
                    <QrCode className="h-4 w-4" /> 2. QR / GPS Check-In Screen
                  </Button>
                  <Button
                    variant={activeTab === "leave" ? "default" : "outline"}
                    className="justify-start gap-3"
                    onClick={() => setActiveTab("leave")}
                  >
                    <Calendar className="h-4 w-4" /> 3. Leave Request Form
                  </Button>
                  <Button
                    variant={activeTab === "payslip" ? "default" : "outline"}
                    className="justify-start gap-3"
                    onClick={() => setActiveTab("payslip")}
                  >
                    <FileText className="h-4 w-4" /> 4. Mobile Payslip Card
                  </Button>
                  <Button
                    variant={activeTab === "login" ? "default" : "outline"}
                    className="justify-start gap-3"
                    onClick={() => setActiveTab("login")}
                  >
                    <Lock className="h-4 w-4" /> 5. Mobile Native Login
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="space-y-2 p-4">
                <h4 className="text-primary text-xs font-semibold tracking-wider uppercase">
                  Field Sync Status
                </h4>
                <p className="text-muted-foreground text-xs">
                  GPS Geofence:{" "}
                  <span className="text-foreground font-semibold">
                    Active (Biyagama Zone 2)
                  </span>
                </p>
                <p className="text-muted-foreground text-xs">
                  Offline Cache:{" "}
                  <span className="font-semibold text-emerald-600">
                    0 Records Pending Sync
                  </span>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Mobile Phone Mockup Device Frame */}
          <div className="flex justify-center lg:col-span-7">
            <div
              className={`relative flex h-[720px] w-[360px] flex-col overflow-hidden rounded-[48px] border-[12px] border-slate-900 shadow-2xl transition-colors ${
                isDarkMode
                  ? "bg-slate-900 text-slate-100"
                  : "bg-slate-50 text-slate-900"
              }`}
            >
              {/* Speaker Notch */}
              <div className="absolute top-0 left-1/2 z-50 flex h-5 w-36 -translate-x-1/2 items-center justify-center rounded-b-2xl bg-slate-900">
                <div className="h-1 w-10 rounded-full bg-slate-700" />
              </div>

              {/* Mobile Status Bar */}
              <div className="text-muted-foreground z-40 flex items-center justify-between px-6 pt-6 pb-2 text-[10px] font-semibold">
                <span>09:41 AM</span>
                <div className="flex items-center gap-1">
                  <span>5G</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Phone Screen Dynamic View Body */}
              <div className="flex-1 space-y-4 overflow-y-auto p-4">
                {/* SCREEN 1: DASHBOARD */}
                {activeTab === "dashboard" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="border-primary h-10 w-10 border">
                          <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                            KP
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-heading text-sm font-bold">
                            Kavinda Perera
                          </h4>
                          <p className="text-muted-foreground text-[11px]">
                            ID: EMP-0482 • Biyagama Plant
                          </p>
                        </div>
                      </div>
                      <StatusBadge status="deployed" size="sm" />
                    </div>

                    {/* Shift Card */}
                    <div className="bg-primary text-primary-foreground space-y-2 rounded-2xl p-4 shadow-md">
                      <div className="flex items-center justify-between text-xs opacity-90">
                        <span>Today&apos;s Shift</span>
                        <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px]">
                          Morning Shift
                        </span>
                      </div>
                      <h3 className="font-heading text-xl font-bold">
                        08:00 AM — 05:00 PM
                      </h3>
                      <p className="flex items-center gap-1 text-xs opacity-90">
                        <MapPin className="h-3.5 w-3.5" /> Ceylon Beverage Corp
                        (Plant 2)
                      </p>
                    </div>

                    {/* Quick Action Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div
                        onClick={() => setActiveTab("checkin")}
                        className="border-border bg-card hover:bg-accent/40 flex cursor-pointer flex-col items-center space-y-1.5 rounded-xl border p-3.5 text-center shadow-sm"
                      >
                        <div className="rounded-full bg-emerald-500/15 p-2.5 text-emerald-600">
                          <QrCode className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-semibold">
                          QR Check-In
                        </span>
                      </div>

                      <div
                        onClick={() => setActiveTab("leave")}
                        className="border-border bg-card hover:bg-accent/40 flex cursor-pointer flex-col items-center space-y-1.5 rounded-xl border p-3.5 text-center shadow-sm"
                      >
                        <div className="bg-primary/10 text-primary rounded-full p-2.5">
                          <Calendar className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-semibold">
                          Request Leave
                        </span>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="space-y-2">
                      <h4 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                        Recent Check-Ins
                      </h4>
                      <div className="border-border bg-card flex items-center justify-between rounded-xl border p-3 text-xs">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          <div>
                            <p className="font-semibold">Shift Checked In</p>
                            <p className="text-muted-foreground text-[10px]">
                              Yesterday, 07:54 AM
                            </p>
                          </div>
                        </div>
                        <span className="font-mono text-[11px]">8.2 hrs</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* SCREEN 2: QR CHECK-IN */}
                {activeTab === "checkin" && (
                  <div className="flex flex-col items-center space-y-4 pt-2 text-center">
                    <div className="rounded-full bg-emerald-500/15 p-3 text-emerald-600">
                      <QrCode className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-heading text-lg font-bold">
                        Scan Plant QR Code
                      </h3>
                      <p className="text-muted-foreground text-xs">
                        Align QR code inside frame or verify GPS geofence
                      </p>
                    </div>

                    {/* Viewfinder Mockup */}
                    <div className="relative my-2 flex h-56 w-56 flex-col items-center justify-center overflow-hidden rounded-2xl border-4 border-dashed border-emerald-500 bg-black/5">
                      <div className="absolute inset-0 animate-pulse bg-emerald-500/5" />
                      <QrCode className="h-24 w-24 text-emerald-600/40" />
                      <span className="mt-2 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">
                        Geofence Verified
                      </span>
                    </div>

                    <div className="w-full space-y-2">
                      <Button
                        onClick={() => setCheckedIn(!checkedIn)}
                        className={`w-full gap-2 rounded-xl py-5 text-sm font-semibold ${
                          checkedIn
                            ? "bg-rose-600 hover:bg-rose-700"
                            : "bg-emerald-600 hover:bg-emerald-700"
                        }`}
                      >
                        <Clock className="h-4 w-4" />
                        {checkedIn ? "CLOCK OUT NOW" : "CLOCK IN NOW"}
                      </Button>
                      <p className="text-muted-foreground text-[11px]">
                        GPS Accuracy: ±3 meters • Location: Biyagama EPZ
                      </p>
                    </div>
                  </div>
                )}

                {/* SCREEN 3: LEAVE REQUEST */}
                {activeTab === "leave" && (
                  <div className="space-y-3">
                    <div className="mb-1 flex items-center gap-2">
                      <Calendar className="text-primary h-5 w-5" />
                      <h3 className="font-heading text-base font-bold">
                        Apply for Leave
                      </h3>
                    </div>

                    <div className="space-y-2 text-left">
                      <label className="text-xs font-semibold">
                        Leave Category
                      </label>
                      <select className="border-border bg-card w-full rounded-xl border p-2.5 text-xs">
                        <option>Casual Leave (Remaining: 6 days)</option>
                        <option>Medical Leave (Remaining: 12 days)</option>
                        <option>Annual Leave (Remaining: 14 days)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-left">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold">
                          Start Date
                        </label>
                        <input
                          type="date"
                          className="border-border bg-card w-full rounded-lg border p-2 text-xs"
                          defaultValue="2026-08-15"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold">
                          End Date
                        </label>
                        <input
                          type="date"
                          className="border-border bg-card w-full rounded-lg border p-2 text-xs"
                          defaultValue="2026-08-16"
                        />
                      </div>
                    </div>

                    <div className="space-y-1 text-left">
                      <label className="text-[11px] font-semibold">
                        Reason for Absence
                      </label>
                      <textarea
                        className="border-border bg-card h-16 w-full rounded-lg border p-2 text-xs"
                        placeholder="Brief explanation..."
                      />
                    </div>

                    <Button className="w-full rounded-xl py-4 text-xs font-semibold">
                      Submit Leave Application
                    </Button>
                  </div>
                )}

                {/* SCREEN 4: MOBILE PAYSLIP */}
                {activeTab === "payslip" && (
                  <div className="space-y-3 text-left">
                    <div className="bg-card border-border space-y-3 rounded-2xl border p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-primary text-xs font-bold">
                          JK MANPOWER ERP
                        </span>
                        <StatusBadge status="paid" size="sm" />
                      </div>
                      <div>
                        <p className="text-muted-foreground text-[10px]">
                          JULY 2026 PAYSLIP
                        </p>
                        <h3 className="font-heading text-xl font-bold text-emerald-600">
                          LKR 124,500.00
                        </h3>
                        <p className="text-muted-foreground text-[11px]">
                          Net Salary Transferred
                        </p>
                      </div>

                      <div className="border-border space-y-1 border-t pt-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Basic Pay:
                          </span>
                          <span className="font-semibold">LKR 95,000.00</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            OT Allowance:
                          </span>
                          <span className="font-semibold">LKR 28,500.00</span>
                        </div>
                        <div className="flex justify-between text-rose-600">
                          <span>EPF (8%):</span>
                          <span>- LKR 7,600.00</span>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-2 text-xs"
                      >
                        <Download className="h-3.5 w-3.5" /> Download PDF
                        Payslip
                      </Button>
                    </div>
                  </div>
                )}

                {/* SCREEN 5: MOBILE LOGIN */}
                {activeTab === "login" && (
                  <div className="space-y-4 pt-6 text-center">
                    <div className="bg-primary text-primary-foreground mx-auto flex h-12 w-12 items-center justify-center rounded-2xl shadow-md">
                      <Lock className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-heading text-lg font-bold">
                        JK Manpower Field Portal
                      </h3>
                      <p className="text-muted-foreground text-xs">
                        Sign in with employee ID
                      </p>
                    </div>

                    <div className="space-y-3 text-left">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold">
                          Employee ID
                        </label>
                        <input
                          className="border-border bg-card w-full rounded-xl border p-2.5 text-xs"
                          defaultValue="EMP-0482"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold">
                          Password
                        </label>
                        <input
                          type="password"
                          className="border-border bg-card w-full rounded-xl border p-2.5 text-xs"
                          defaultValue="••••••••"
                        />
                      </div>
                      <Button className="w-full rounded-xl py-4 text-xs font-semibold">
                        Sign In to Mobile Portal
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Nav Bar */}
              <div className="flex items-center justify-around border-t border-slate-800 bg-slate-900 p-3 text-slate-400">
                <Home
                  onClick={() => setActiveTab("dashboard")}
                  className={`h-5 w-5 cursor-pointer ${activeTab === "dashboard" ? "text-primary" : ""}`}
                />
                <QrCode
                  onClick={() => setActiveTab("checkin")}
                  className={`h-5 w-5 cursor-pointer ${activeTab === "checkin" ? "text-primary" : ""}`}
                />
                <Calendar
                  onClick={() => setActiveTab("leave")}
                  className={`h-5 w-5 cursor-pointer ${activeTab === "leave" ? "text-primary" : ""}`}
                />
                <FileText
                  onClick={() => setActiveTab("payslip")}
                  className={`h-5 w-5 cursor-pointer ${activeTab === "payslip" ? "text-primary" : ""}`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
