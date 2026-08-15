import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type TimesheetSummaryCardProps = {
  totalWorkedHours: number;
  totalOvertimeHours: number;
  presentDays: number;
  periodStart: string;
  periodEnd: string;
};

export function TimesheetSummaryCard({
  totalWorkedHours,
  totalOvertimeHours,
  presentDays,
  periodStart,
  periodEnd,
}: TimesheetSummaryCardProps) {
  return (
    <div className="gap-jk-md grid md:grid-cols-3">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-muted-foreground text-sm font-medium">
            Period
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-heading text-title-lg">
            {periodStart} – {periodEnd}
          </p>
        </CardContent>
      </Card>
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-muted-foreground text-sm font-medium">
            Worked hours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-heading text-title-lg">{totalWorkedHours}h</p>
          <p className="text-muted-foreground text-sm">
            {presentDays} present days
          </p>
        </CardContent>
      </Card>
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-muted-foreground text-sm font-medium">
            Overtime
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-heading text-title-lg">{totalOvertimeHours}h</p>
        </CardContent>
      </Card>
    </div>
  );
}
