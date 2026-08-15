"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/application/dto/forgot-password.schema";
import {
  authButtonClassName,
  authInputClassName,
} from "@/components/auth/auth-field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = form.handleSubmit(async (values) => {
    setServerError(null);
    setServerMessage(null);

    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const payload = await response.json();

    if (!response.ok || !payload.success) {
      setServerError(payload.error ?? "Unable to process request");
      return;
    }

    setServerMessage(payload.data.message);
  });

  return (
    <div>
      <p className="text-primary text-xs font-semibold tracking-[0.22em] uppercase">
        Account recovery
      </p>
      <h1 className="font-heading text-foreground mt-3 text-3xl tracking-tight">
        Reset your password
      </h1>
      <p className="text-body-md text-muted-foreground mt-2">
        Enter your email and we&apos;ll send a secure reset link.
      </p>

      {serverError ? (
        <Alert variant="destructive" className="mt-6">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      ) : null}

      {serverMessage ? (
        <Alert className="border-jk-secondary-container bg-jk-secondary-container/20 mt-6">
          <AlertDescription>{serverMessage}</AlertDescription>
        </Alert>
      ) : null}

      <form className="mt-8 flex flex-col gap-5" onSubmit={onSubmit}>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email" className="text-label-md font-medium">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="name@company.com"
            className={authInputClassName}
            {...form.register("email")}
          />
          {form.formState.errors.email ? (
            <p className="text-label-md text-destructive">
              {form.formState.errors.email.message}
            </p>
          ) : null}
        </div>

        <Button
          type="submit"
          size="lg"
          className={authButtonClassName}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" aria-hidden="true" />
              Sending link...
            </>
          ) : (
            "Send reset link"
          )}
        </Button>

        <Link
          href="/login"
          className="text-muted-foreground hover:text-foreground inline-flex items-center justify-center gap-2 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to sign in
        </Link>
      </form>
    </div>
  );
}
