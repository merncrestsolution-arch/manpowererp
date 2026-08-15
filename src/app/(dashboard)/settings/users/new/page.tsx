import Link from "next/link";

import { UserForm } from "@/components/settings/user-form";
import { Button } from "@/components/ui/button";

export default function NewUserPage() {
  return (
    <div className="gap-jk-lg flex flex-col">
      <div className="gap-jk-sm flex flex-wrap items-center justify-between">
        <p className="text-body-md text-muted-foreground">
          Add a new user account with role assignment
        </p>
        <Button variant="outline" render={<Link href="/settings/users" />}>
          Back to users
        </Button>
      </div>
      <UserForm />
    </div>
  );
}
