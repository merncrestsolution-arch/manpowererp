"use client";

import { useSession } from "next-auth/react";
import { use } from "react";

import { CandidateProfileTabs } from "@/components/recruitment/candidate-profile-tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useCandidate } from "@/hooks/use-recruitment";
import { canManageRecruitment } from "@/infrastructure/auth/roles";

type CandidateProfilePageProps = {
  params: Promise<{ id: string }>;
};

export default function CandidateProfilePage({
  params,
}: CandidateProfilePageProps) {
  const { id } = use(params);
  const { data: session } = useSession();
  const { data: candidate, isLoading, isError } = useCandidate(id);

  if (isLoading) {
    return (
      <div className="max-w-container space-y-jk-md mx-auto">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !candidate) {
    return (
      <div className="max-w-container bg-card p-jk-lg mx-auto rounded-xl border text-center">
        <p className="font-medium">Candidate not found</p>
      </div>
    );
  }

  const role = session?.user?.role;

  return (
    <div className="max-w-container mx-auto">
      <CandidateProfileTabs
        candidate={candidate}
        canManage={role ? canManageRecruitment(role) : false}
      />
    </div>
  );
}
