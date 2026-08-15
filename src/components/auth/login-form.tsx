"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { loginSchema, type LoginInput } from "@/application/dto/login.schema";
import {
  authButtonClassName,
  authInputClassName,
} from "@/components/auth/auth-field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LoginFormProps = {
  callbackUrl?: string;
  resetSuccess?: boolean;
};

export function LoginForm({
  callbackUrl = "/dashboard",
  resetSuccess = false,
}: LoginFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = form.handleSubmit(async (values) => {
    setServerError(null);

    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      rememberMe: String(values.rememberMe),
      redirect: false,
    });

    if (result?.error) {
      if (result.error === "RATE_LIMITED") {
        setServerError(
          "Too many sign-in attempts. Please wait a few minutes and try again.",
        );
      } else if (
        result.error === "DATABASE_UNAVAILABLE" ||
        result.error === "CallbackRouteError"
      ) {
        setServerError(
          "Unable to sign in right now. The database may still be starting — please try again.",
        );
      } else {
        setServerError("Invalid email or password");
      }
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  });

  return (
    <div>
      <p className="text-primary text-xs font-semibold tracking-[0.22em] uppercase">
        Secure access
      </p>
      <h1 className="font-heading text-foreground mt-3 text-3xl tracking-tight">
        Sign in to your workspace
      </h1>
      <p className="text-body-md text-muted-foreground mt-2">
        Enter your employee ID or work email to continue.
      </p>

      {resetSuccess ? (
        <Alert className="mt-6">
          <AlertDescription>
            Your password was reset. You can sign in with your new password.
          </AlertDescription>
        </Alert>
      ) : null}

      {serverError ? (
        <Alert variant="destructive" className="mt-6">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      ) : null}

      <form className="mt-8 flex flex-col gap-5" onSubmit={onSubmit}>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email" className="text-label-md font-medium">
            Employee ID or Email
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

        <div className="flex flex-col gap-2">
          <Label htmlFor="password" className="text-label-md font-medium">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
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

        <div className="flex items-center justify-between gap-3">
          <label className="text-foreground flex items-center gap-2 text-sm">
            <Checkbox
              checked={form.watch("rememberMe")}
              onCheckedChange={(checked) =>
                form.setValue("rememberMe", Boolean(checked))
              }
            />
            Remember me
          </label>
          <Link
            href="/forgot-password"
            className="text-primary text-sm font-medium hover:underline"
          >
            Forgot Password?
          </Link>
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
              Signing in...
            </>
          ) : (
            <>
              Sign In
              <ArrowRight className="size-4" aria-hidden="true" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
