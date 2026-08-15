import * as Location from "expo-location";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GlassCard, HeroGradient } from "@/components/glass-card";
import { Button } from "@/components/ui/button";
import { colors, spacing } from "@/constants/theme";
import { getMobileDashboard, mobileCheckIn, mobileCheckOut } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function AttendanceScreen() {
  const { token } = useAuth();
  const [status, setStatus] = useState("NOT_RECORDED");
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!token) {
      return;
    }

    const response = await getMobileDashboard(token);

    if (response.success && response.data) {
      setStatus(response.data.todayAttendance.status);
      setCheckInTime(response.data.todayAttendance.checkInTime);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const captureLocation = async () => {
    const permission = await Location.requestForegroundPermissionsAsync();

    if (!permission.granted) {
      throw new Error("Location permission is required for GPS attendance");
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
  };

  const handleCheckIn = async () => {
    if (!token) {
      return;
    }

    setBusy(true);
    setMessage(null);

    try {
      const coords = await captureLocation();
      const response = await mobileCheckIn(token, {
        method: "GPS",
        ...coords,
      });

      if (!response.success) {
        setMessage(response.error ?? "Unable to check in");
      } else {
        setMessage("Checked in successfully");
        await load();
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Check-in failed");
    } finally {
      setBusy(false);
    }
  };

  const handleCheckOut = async () => {
    if (!token) {
      return;
    }

    setBusy(true);
    setMessage(null);

    try {
      const coords = await captureLocation();
      const response = await mobileCheckOut(token, {
        method: "GPS",
        ...coords,
      });

      if (!response.success) {
        setMessage(response.error ?? "Unable to check out");
      } else {
        setMessage("Checked out successfully");
        await load();
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Check-out failed");
    } finally {
      setBusy(false);
    }
  };

  const isOnSite = Boolean(checkInTime) && status !== "CHECKED_OUT";

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <View style={styles.container}>
        <HeroGradient>
          <Text style={styles.kicker}>LIVE SITE</Text>
          <Text style={styles.title}>
            {isOnSite ? "On duty" : "Ready to clock in"}
          </Text>
          <Text style={styles.subtitle}>
            GPS-verified attendance with a cinematic status board.
          </Text>
        </HeroGradient>

        <GlassCard>
          <Text style={styles.statusLabel}>Current status</Text>
          <Text style={styles.statusValue}>{formatStatus(status)}</Text>
          {checkInTime ? (
            <Text style={styles.meta}>In since {checkInTime}</Text>
          ) : (
            <Text style={styles.meta}>No punch recorded for today</Text>
          )}
          {message ? <Text style={styles.message}>{message}</Text> : null}

          <View style={styles.actions}>
            <Button
              title="GPS check-in"
              loading={busy && !isOnSite}
              disabled={busy || isOnSite}
              onPress={() => void handleCheckIn()}
            />
            <Button
              title="Check out"
              variant="secondary"
              loading={busy && isOnSite}
              disabled={busy || !isOnSite}
              onPress={() => void handleCheckOut()}
            />
          </View>
        </GlassCard>
      </View>
    </SafeAreaView>
  );
}

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#eef3fb" },
  container: { flex: 1, padding: spacing.lg, gap: spacing.lg },
  kicker: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
  },
  title: {
    marginTop: 8,
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
  },
  subtitle: { marginTop: 8, color: "#dbeafe", lineHeight: 20 },
  statusLabel: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  statusValue: {
    marginTop: 6,
    fontSize: 24,
    fontWeight: "800",
    color: colors.onSurface,
  },
  meta: { marginTop: 6, color: colors.onSurfaceVariant },
  message: { marginTop: 12, color: colors.secondaryDeep, fontWeight: "600" },
  actions: { marginTop: 20, gap: 12 },
});
