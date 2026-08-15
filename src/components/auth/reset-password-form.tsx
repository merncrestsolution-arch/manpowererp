"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/application/dto/reset-password.schema";
import {
  authButtonClassName,
  authInputClassName,
} from "@/components/auth/auth-field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ResetPasswordFormProps = {
  token: string;
};

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
      password: "",
      confirmPassword: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = form.handleSubmit(async (values) => {
    setServerError(null);

    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const payload = await response.json();

    if (!response.ok || !payload.success) {
      setServerError(payload.error ?? "Unable to reset password");
      return;
    }

    router.push("/login?reset=success");
  });

  return (
    <div>
      <p className="text-primary text-xs font-semibold tracking-[0.22em] uppercase">
        Account recovery
      </p>
      <h1 className="font-heading text-foreground mt-3 text-3xl tracking-tight">
        Choose a new password
      </h1>
      <p className="text-body-md text-muted-foreground mt-2">
        Choose a strong password for your account.
      </p>

      {serverError ? (
        <Alert variant="destructive" className="mt-6">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      ) : null}

      <form className="mt-8 flex flex-col gap-5" onSubmit={onSubmit}>
        <input type="hidden" {...form.register("token")} />

        <div className="flex flex-col gap-2">
          <Label htmlFor="password" className="text-label-md font-medium">
            New password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Enter a new password"
              className={`${authInputClassName} pr-11`}
              {...form.register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="size-4" aria-hidden="true" />
              ) : (
                <Eye className="size-4" aria-hidden="true" />
              )}
            </button>
          </div>
          {form.formState.errors.password ? (
            <p className="text-label-md text-destructive">
              {form.formState.errors.password.message}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <Label
            htmlFor="confirmPassword"
            className="text-label-md font-medium"
          >
            Confirm password
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Re-enter your password"
              className={`${authInputClassName} pr-11`}
              {...form.register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((visible) => !visible)}
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
              aria-label={
                showConfirmPassword
                  ? "Hide confirm password"
                  : "Show confirm password"
              }
            >
              {showConfirmPassword ? (
                <EyeOff className="size-4" aria-hidden="true" />
              ) : (
                <Eye className="size-4" aria-hidden="true" />
              )}
            </button>
          </div>
          {form.formState.errors.confirmPassword ? (
            <p className="text-label-md text-destructive">
              {form.formState.errors.confirmPassword.message}
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
              Updating...
            </>
          ) : (
            "Update password"
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
