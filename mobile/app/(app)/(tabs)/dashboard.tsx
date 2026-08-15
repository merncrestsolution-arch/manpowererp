import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, radius, spacing } from "@/constants/theme";
import { useAuth } from "@/lib/auth";

const quickActions = [
  { title: "Attendance", description: "Clock in and track hours" },
  { title: "Payroll", description: "View payslips and earnings" },
  { title: "Schedule", description: "Shifts and assignments" },
  { title: "Team", description: "Connect with colleagues" },
];

export default function DashboardScreen() {
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <View style={styles.container}>
        <View style={styles.heroCard}>
          <Text style={styles.greeting}>
            Hello, {user?.name?.split(" ")[0] ?? "there"}
          </Text>
          <Text style={styles.role}>{formatRole(user?.role)}</Text>
          <Text style={styles.heroText}>
            Your workforce hub is ready. More ERP modules will appear here as
            they roll out on web.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Quick actions</Text>

        <View style={styles.grid}>
          {quickActions.map((action) => (
            <View key={action.title} style={styles.actionCard}>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionDescription}>{action.description}</Text>
              <Text style={styles.comingSoon}>Coming soon</Text>
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
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
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  container: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  heroCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.onPrimary,
  },
  role: {
    fontSize: 14,
    fontWeight: "600",
    color: "#dbeafe",
  },
  heroText: {
    marginTop: spacing.sm,
    fontSize: 14,
    lineHeight: 20,
    color: "#eff6ff",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.onSurface,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  actionCard: {
    width: "47%",
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.outline,
    gap: spacing.xs,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.onSurface,
  },
  actionDescription: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.onSurfaceVariant,
  },
  comingSoon: {
    marginTop: spacing.sm,
    fontSize: 12,
    fontWeight: "600",
    color: colors.secondary,
  },
});
