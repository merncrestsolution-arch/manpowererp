import { useCallback, useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GlassCard, HeroGradient } from "@/components/glass-card";
import { colors, radius, spacing } from "@/constants/theme";
import { getMobileDashboard } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { MobileDashboard } from "@/lib/types";

export default function DashboardScreen() {
  const { user, token } = useAuth();
  const [data, setData] = useState<MobileDashboard | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!token) {
      return;
    }

    const response = await getMobileDashboard(token);

    if (response.success && response.data) {
      setData(response.data);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const firstName =
    data?.employee.firstName ?? user?.name?.split(" ")[0] ?? "there";
  const attendance = data?.todayAttendance;
  const checkedIn = Boolean(attendance?.checkInTime);
  const checkedOut = Boolean(attendance?.checkOutTime);

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <HeroGradient>
          <Text style={styles.kicker}>TODAY</Text>
          <Text style={styles.greeting}>Good to see you, {firstName}</Text>
          <Text style={styles.role}>{formatRole(user?.role)}</Text>
          <View style={styles.shiftChip}>
            <Text style={styles.shiftChipText}>
              {data?.activeDeployment
                ? `${data.activeDeployment.shiftName} · ${data.activeDeployment.shiftStart}–${data.activeDeployment.shiftEnd}`
                : "No active deployment"}
            </Text>
          </View>
        </HeroGradient>

        <View style={styles.statsRow}>
          <Stat
            label="Hours"
            value={`${Math.round(attendance?.workingHoursPercent ?? 0)}%`}
          />
          <Stat label="Alerts" value={String(data?.unreadNotifications ?? 0)} />
          <Stat label="Leave" value={String(data?.pendingLeaveCount ?? 0)} />
        </View>

        <GlassCard>
          <Text style={styles.cardLabel}>Attendance pulse</Text>
          <Text style={styles.cardTitle}>
            {checkedOut
              ? "Shift complete"
              : checkedIn
                ? "You are on site"
                : "Not checked in"}
          </Text>
          <Text style={styles.cardMeta}>
            {data?.activeDeployment?.workLocationName ??
              "Open Attendance to clock in with GPS"}
          </Text>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(attendance?.workingHoursPercent ?? 0, 100)}%`,
                },
              ]}
            />
          </View>
        </GlassCard>

        <Text style={styles.sectionTitle}>Command deck</Text>
        <View style={styles.grid}>
          {[
            {
              title: "Attendance",
              detail: "GPS check-in and live hours",
              tone: "#2563eb",
            },
            {
              title: "Payslip",
              detail: data?.latestPayslip
                ? `Net ${data.latestPayslip.netSalary ?? 0}`
                : "Waiting for payroll run",
              tone: "#10b981",
            },
            {
              title: "Schedule",
              detail: data?.activeDeployment?.shiftName ?? "No shift assigned",
              tone: "#0b3d91",
            },
            {
              title: "Leave",
              detail: `${data?.pendingLeaveCount ?? 0} pending requests`,
              tone: "#f59e0b",
            },
          ].map((item) => (
            <View key={item.title} style={styles.actionCard}>
              <View style={[styles.dot, { backgroundColor: item.tone }]} />
              <Text style={styles.actionTitle}>{item.title}</Text>
              <Text style={styles.actionDescription}>{item.detail}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function formatRole(role?: string) {
  if (!role) {
    return "Employee";
  }

  return role
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#eef3fb" },
  container: { padding: spacing.lg, gap: spacing.lg, paddingBottom: 40 },
  kicker: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
  },
  greeting: {
    marginTop: 8,
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
  },
  role: { marginTop: 4, color: "#dbeafe", fontWeight: "600" },
  shiftChip: {
    alignSelf: "flex-start",
    marginTop: 16,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  shiftChipText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  statsRow: { flexDirection: "row", gap: spacing.md },
  stat: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  statValue: { fontSize: 22, fontWeight: "800", color: colors.primaryDark },
  statLabel: { marginTop: 2, color: colors.onSurfaceVariant, fontSize: 12 },
  cardLabel: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  cardTitle: {
    marginTop: 6,
    fontSize: 20,
    fontWeight: "800",
    color: colors.onSurface,
  },
  cardMeta: { marginTop: 4, color: colors.onSurfaceVariant, fontSize: 13 },
  progressTrack: {
    marginTop: 16,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#e2e8f0",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.secondary,
    borderRadius: 999,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.onSurface,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  actionCard: {
    width: "47%",
    backgroundColor: "#fff",
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: 6,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  actionTitle: { fontSize: 16, fontWeight: "700", color: colors.onSurface },
  actionDescription: {
    fontSize: 12,
    lineHeight: 17,
    color: colors.onSurfaceVariant,
  },
});
