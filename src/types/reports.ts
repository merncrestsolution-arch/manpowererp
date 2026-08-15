export type HeadcountGroup = {
  label: string;
  count: number;
};

export type HeadcountReport = {
  total: number;
  byDepartment: HeadcountGroup[];
  byDesignation: HeadcountGroup[];
  byStatus: HeadcountGroup[];
};

export type LeaveUtilizationLine = {
  type: string;
  count: number;
  days: number;
};

export type LeaveUtilizationReport = {
  periodLabel?: string;
  totalRequests: number;
  approvedDays: number;
  byType: LeaveUtilizationLine[];
  byStatus: { status: string; count: number }[];
};

export type AttendanceSummaryTrendPoint = {
  date: string;
  present: number;
  late: number;
  absent: number;
  onLeave: number;
};

export type AttendanceSummaryReport = {
  periodLabel: string;
  totals: {
    present: number;
    late: number;
    absent: number;
    halfDay: number;
    onLeave: number;
  };
  trend: AttendanceSummaryTrendPoint[];
};

export type RecruitmentFunnelStage = {
  stage: string;
  label: string;
  count: number;
};

export type SourceOfHireLine = {
  source: string;
  label: string;
  total: number;
  placed: number;
};

export type RecruitmentFunnelReport = {
  stages: RecruitmentFunnelStage[];
  sourceOfHire: SourceOfHireLine[];
};

export type TimeToHirePlacement = {
  candidateId: string;
  candidateNo: string;
  name: string;
  daysToHire: number;
  source: string;
  placedAt: string;
};

export type TimeToHireReport = {
  averageDays: number;
  medianDays: number;
  placementCount: number;
  placements: TimeToHirePlacement[];
};

export type DeploymentClientSummary = {
  clientId: string;
  clientName: string;
  activeCount: number;
};

export type DeploymentLocationSummary = {
  locationId: string;
  locationName: string;
  clientName: string;
  activeCount: number;
};

export type DeploymentAvailabilityPoint = {
  date: string;
  active: number;
  scheduled: number;
};

export type DeploymentUtilizationReport = {
  periodLabel?: string;
  activeByClient: DeploymentClientSummary[];
  locationUtilization: DeploymentLocationSummary[];
  availabilityTrend: DeploymentAvailabilityPoint[];
};
