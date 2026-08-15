"use client";

import {
  Users,
  Briefcase,
  Building2,
  DollarSign,
  TrendingUp,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Layers,
  ChevronRight,
} from "lucide-react";
import React, { useState } from "react";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { KpiCard } from "@/components/shared/kpi-card";
import { MultiStepWizard } from "@/components/shared/multi-step-wizard";
import { PageShell } from "@/components/shared/page-shell";
import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DesignSystemCatalogPage() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);

  return (
    <PageShell
      title="JK Manpower ERP — Component Library & Design Tokens"
      description="Executive precision component catalog adhering strictly to Stitch tokens, Tailwind custom properties, and WCAG AA contrast standards."
      actions={
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" onClick={() => setConfirmOpen(true)}>
            Test Confirm Dialog
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Create Component
          </Button>
        </div>
      }
    >
      <div className="bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold">
        Google Stitch Design Reference System
      </div>

      <Tabs defaultValue="foundations" className="space-y-8">
        <TabsList className="bg-muted rounded-lg p-1">
          <TabsTrigger value="foundations" className="gap-2">
            <Layers className="h-4 w-4" /> Foundations & Buttons
          </TabsTrigger>
          <TabsTrigger value="inputs" className="gap-2">
            <Search className="h-4 w-4" /> Form Inputs & Controls
          </TabsTrigger>
          <TabsTrigger value="badges" className="gap-2">
            <CheckCircle2 className="h-4 w-4" /> Badges & Statuses
          </TabsTrigger>
          <TabsTrigger value="kpis" className="gap-2">
            <TrendingUp className="h-4 w-4" /> KPI & Data Cards
          </TabsTrigger>
          <TabsTrigger value="patterns" className="gap-2">
            <FileText className="h-4 w-4" /> Wizards & Feedback
          </TabsTrigger>
        </TabsList>

        {/* Foundations & Buttons */}
        <TabsContent value="foundations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-xl">
                Buttons & Variants
              </CardTitle>
              <CardDescription>
                Primary, secondary, ghost, destructive, and icon button states
                in all operational sizes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h4 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                  Standard Variants
                </h4>
                <div className="flex flex-wrap gap-3">
                  <Button variant="default">Primary Button</Button>
                  <Button variant="secondary">Secondary Button</Button>
                  <Button variant="outline">Outline Button</Button>
                  <Button variant="ghost">Ghost Button</Button>
                  <Button variant="destructive" className="gap-2">
                    <Trash2 className="h-4 w-4" /> Destructive
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                  Button Sizes
                </h4>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="sm">Small (sm)</Button>
                  <Button size="default">Default (md)</Button>
                  <Button size="lg">Large (lg)</Button>
                  <Button size="icon" variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-xl">
                Avatars & Initials
              </CardTitle>
              <CardDescription>
                User and employee avatars with automated initial fallbacks and
                status indicators.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <Avatar className="border-primary h-12 w-12 border-2">
                  <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" />
                  <AvatarFallback className="bg-primary/20 text-primary font-bold">
                    KP
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">Kavinda Perera</p>
                  <p className="text-muted-foreground text-xs">
                    Senior Field Supervisor
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-emerald-500/20 font-bold text-emerald-700 dark:text-emerald-300">
                    DS
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">Dilshan Silva</p>
                  <p className="text-muted-foreground text-xs">
                    Recruitment Lead
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inputs */}
        <TabsContent value="inputs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-xl">
                Form Controls & Input States
              </CardTitle>
              <CardDescription>
                Interactive text inputs, search comboboxes, checkboxes, and
                validation states.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sample-name">Employee Name</Label>
                <Input
                  id="sample-name"
                  placeholder="e.g. Nirmala Fernando"
                  defaultValue="Nirmala Fernando"
                />
                <p className="text-muted-foreground text-xs">
                  Enter complete official name per National ID.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sample-error" className="text-rose-600">
                  Basic Salary (LKR)
                </Label>
                <Input
                  id="sample-error"
                  placeholder="LKR 0.00"
                  className="border-rose-500 focus-visible:ring-rose-500"
                  defaultValue="INVALID_VAL"
                />
                <p className="flex items-center gap-1 text-xs font-medium text-rose-600">
                  <AlertCircle className="h-3.5 w-3.5" /> Salary must be a valid
                  positive numerical amount.
                </p>
              </div>

              <div className="space-y-3">
                <Label>Department Assignment</Label>
                <RadioGroup defaultValue="field">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="field" id="r1" />
                    <Label htmlFor="r1" className="cursor-pointer">
                      Field Operations
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="office" id="r2" />
                    <Label htmlFor="r2" className="cursor-pointer">
                      HQ Administration
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label>Employee Benefits</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="c1" defaultChecked />
                    <Label htmlFor="c1" className="cursor-pointer">
                      EPF & ETF Statutory Allowance
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="c2" defaultChecked />
                    <Label htmlFor="c2" className="cursor-pointer">
                      Overtime Rate (1.5x)
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Badges */}
        <TabsContent value="badges" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-xl">
                Semantic Status Badges
              </CardTitle>
              <CardDescription>
                Comprehensive set of badge indicators for operational,
                financial, and HR workflows.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status="active" />
                <StatusBadge status="pending" />
                <StatusBadge status="approved" />
                <StatusBadge status="rejected" />
                <StatusBadge status="paid" />
                <StatusBadge status="overdue" />
                <StatusBadge status="deployed" />
                <StatusBadge status="available" />
                <StatusBadge status="on_leave" />
                <StatusBadge status="inactive" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* KPIs */}
        <TabsContent value="kpis" className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              title="Total Active Workforce"
              value="1,480"
              change={12.4}
              icon={Users}
              badgeText="Active"
              badgeVariant="emerald"
            />
            <KpiCard
              title="Active Client Contracts"
              value="42"
              change={4.1}
              icon={Building2}
              badgeText="Enterprise"
              badgeVariant="blue"
            />
            <KpiCard
              title="Monthly Payroll Disbursed"
              value="LKR 48.2M"
              change={8.7}
              icon={DollarSign}
              badgeText="Disbursed"
              badgeVariant="emerald"
            />
            <KpiCard
              title="Pending Candidate Pipeline"
              value="156"
              change={-2.3}
              icon={Briefcase}
              badgeText="Review Required"
              badgeVariant="amber"
            />
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="font-heading text-xl">
                Skeleton Loading States
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <KpiCard title="" value="" isLoading={true} />
              <KpiCard title="" value="" isLoading={true} />
              <KpiCard title="" value="" isLoading={true} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Patterns */}
        <TabsContent value="patterns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-xl">
                Multi-Step Process Wizard
              </CardTitle>
              <CardDescription>
                Visual stepper pattern for complex flows like Run Payroll or
                Create Quotation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <MultiStepWizard
                steps={[
                  {
                    id: "step1",
                    title: "Select Period",
                    description: "Choose pay cycle",
                  },
                  {
                    id: "step2",
                    title: "Review Attendance",
                    description: "Verify OT hours",
                  },
                  {
                    id: "step3",
                    title: "Calculate Payroll",
                    description: "Apply EPF/ETF",
                  },
                  {
                    id: "step4",
                    title: "Disburse & Lock",
                    description: "Generate payslips",
                  },
                ]}
                currentStepIndex={wizardStep}
                onStepClick={(idx) => setWizardStep(idx)}
              />

              <div className="border-border flex justify-between border-t pt-4">
                <Button
                  variant="outline"
                  onClick={() => setWizardStep((prev) => Math.max(0, prev - 1))}
                  disabled={wizardStep === 0}
                >
                  Previous Step
                </Button>
                <Button
                  onClick={() => setWizardStep((prev) => Math.min(3, prev + 1))}
                  disabled={wizardStep === 3}
                  className="gap-2"
                >
                  Next Step <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-xl">
                Standard Empty State Pattern
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={FileText}
                title="No Invoices Issued Yet"
                description="There are currently no active invoices for the selected financial month. Generate a new invoice or import quotation data."
                actionLabel="Create New Invoice"
                onAction={() => alert("Action Triggered")}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirm Destructive Action"
        description="Are you sure you want to terminate this active employee deployment contract? This action cannot be undone."
        confirmLabel="Yes, Terminate"
        onConfirm={() => alert("Confirmed")}
      />
    </PageShell>
  );
}
