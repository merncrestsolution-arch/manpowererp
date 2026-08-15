import { LoginForm } from "@/components/auth/login-form";

type LoginPageProps = {
  searchParams: Promise<{ callbackUrl?: string; reset?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <LoginForm
      callbackUrl={params.callbackUrl ?? "/dashboard"}
      resetSuccess={params.reset === "success"}
    />
  );
}
