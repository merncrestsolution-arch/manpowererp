"use client";

import { Check } from "lucide-react";
import React from "react";

import { cn } from "@/lib/utils";

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
}

export interface MultiStepWizardProps {
  steps: WizardStep[];
  currentStepIndex: number;
  onStepClick?: (index: number) => void;
  className?: string;
}

export function MultiStepWizard({
  steps,
  currentStepIndex,
  onStepClick,
  className,
}: MultiStepWizardProps) {
  return (
    <div className={cn("w-full py-4", className)}>
      <nav aria-label="Progress">
        <ol className="flex w-full items-center justify-between">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            const isClickable = onStepClick && idx <= currentStepIndex;

            return (
              <li
                key={step.id}
                className={cn(
                  "group relative flex flex-1 flex-col items-center",
                  idx !== steps.length - 1 &&
                    "after:bg-border after:absolute after:top-4 after:left-1/2 after:-z-10 after:h-0.5 after:w-full after:content-['']",
                  idx !== steps.length - 1 && isCompleted && "after:bg-primary",
                )}
              >
                <button
                  type="button"
                  onClick={() => isClickable && onStepClick(idx)}
                  disabled={!isClickable}
                  className={cn(
                    "bg-background flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-all duration-200",
                    isCompleted &&
                      "bg-primary border-primary text-primary-foreground",
                    isCurrent &&
                      "border-primary text-primary ring-primary/15 scale-110 font-bold ring-4",
                    !isCompleted &&
                      !isCurrent &&
                      "border-muted-foreground/30 text-muted-foreground",
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4 stroke-[2.5]" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </button>
                <span className="mt-2 text-center">
                  <span
                    className={cn(
                      "block text-xs font-medium transition-colors",
                      isCurrent
                        ? "text-primary font-semibold"
                        : isCompleted
                          ? "text-foreground"
                          : "text-muted-foreground",
                    )}
                  >
                    {step.title}
                  </span>
                  {step.description && (
                    <span className="text-muted-foreground hidden text-[11px] sm:block">
                      {step.description}
                    </span>
                  )}
                </span>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
