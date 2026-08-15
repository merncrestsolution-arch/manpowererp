"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { placeCandidateSchema } from "@/application/dto/place-candidate.schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { postApiData } from "@/lib/api-client";

import type { EmployeeDetail } from "@/types/employee";
import type { CandidateDetail } from "@/types/recruitment";
import type { z } from "zod";

type PlaceFormValues = z.input<typeof placeCandidateSchema>;

type PlaceCandidateDialogProps = {
  candidate: CandidateDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PlaceCandidateDialog({
  candidate,
  open,
  onOpenChange,
}: PlaceCandidateDialogProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<PlaceFormValues>({
    resolver: zodResolver(placeCandidateSchema),
    defaultValues: {
      department: "",
      designation: candidate.appliedFor ?? candidate.jobOpeningTitle,
      joinedAt: "",
      basicSalary: 0,
      employmentType: "PERMANENT",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const result = await postApiData<{
      candidate: CandidateDetail;
      employee: EmployeeDetail;
    }>(`/api/recruitment/candidates/${candidate.id}/place`, values);

    await queryClient.invalidateQueries({ queryKey: ["recruitment"] });
    onOpenChange(false);
    router.push(`/employees/${result.employee.id}`);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Place candidate</DialogTitle>
          <DialogDescription>
            Create an employee record for{" "}
            <strong>
              {candidate.firstName} {candidate.lastName}
            </strong>
            . This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-jk-md">
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input id="department" {...form.register("department")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="designation">Designation</Label>
            <Input id="designation" {...form.register("designation")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="joinedAt">Joining date</Label>
            <Input id="joinedAt" type="date" {...form.register("joinedAt")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="basicSalary">Basic salary (LKR)</Label>
            <Input
              id="basicSalary"
              type="number"
              min={0}
              {...form.register("basicSalary")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="employmentType">Employment type</Label>
            <Select
              id="employmentType"
              value={form.watch("employmentType")}
              onChange={(e) =>
                form.setValue(
                  "employmentType",
                  e.target.value as PlaceFormValues["employmentType"],
                )
              }
            >
              <option value="PERMANENT">Permanent</option>
              <option value="CONTRACT">Contract</option>
              <option value="TEMPORARY">Temporary</option>
            </Select>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              Place as employee
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
