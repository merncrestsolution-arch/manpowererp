"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { createUserSchema } from "@/application/dto/user.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useCreateUser } from "@/hooks/use-settings";

import type { z } from "zod";

type FormValues = z.input<typeof createUserSchema>;

type UserFormProps = {
  onCreated?: () => void;
};

export function UserForm({ onCreated }: UserFormProps) {
  const [error, setError] = useState<string | null>(null);
  const createUser = useCreateUser();

  const form = useForm<FormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: "",
      name: "",
      password: "",
      role: "EMPLOYEE",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    try {
      const parsed = createUserSchema.parse(values);
      await createUser.mutateAsync(parsed);
      form.reset();
      onCreated?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create user");
    }
  });

  return (
    <form onSubmit={(event) => void onSubmit(event)} className="space-y-jk-md">
      <div className="gap-jk-md grid sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" {...form.register("name")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...form.register("email")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Temporary password</Label>
          <Input id="password" type="password" {...form.register("password")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select
            id="role"
            value={form.watch("role")}
            onChange={(event) =>
              form.setValue("role", event.target.value as FormValues["role"])
            }
          >
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="ADMIN">Admin</option>
            <option value="HR_MANAGER">HR Manager</option>
            <option value="FINANCE_MANAGER">Finance Manager</option>
            <option value="RECRUITER">Recruiter</option>
            <option value="EMPLOYEE">Employee</option>
          </Select>
        </div>
      </div>

      {error ? <p className="text-destructive text-sm">{error}</p> : null}

      <Button type="submit" disabled={createUser.isPending}>
        {createUser.isPending ? "Creating…" : "Create user"}
      </Button>
    </form>
  );
}
