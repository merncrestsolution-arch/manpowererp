import * as Linking from "expo-linking";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GlassCard, HeroGradient } from "@/components/glass-card";
import { Button } from "@/components/ui/button";
import { colors, spacing } from "@/constants/theme";
import { API_BASE_URL, getAndroidApk } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  const handleDownloadApk = async () => {
    const response = await getAndroidApk();

    if (response.success && response.data?.url) {
      await Linking.openURL(response.data.url);
      return;
    }

    await Linking.openURL(`${API_BASE_URL}/download/android`);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <View style={styles.container}>
        <HeroGradient>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0)?.toUpperCase() ?? "?"}
            </Text>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </HeroGradient>

        <GlassCard>
          <Text style={styles.sectionLabel}>ROLE</Text>
          <Text style={styles.role}>{user?.role}</Text>
          <Text style={styles.hint}>
            Install the Android build on company devices from Settings or this
            profile action.
          </Text>
          <View style={styles.actions}>
            <Button
              title="Download APK"
              onPress={() => void handleDownloadApk()}
            />
            <Button
              title="Sign out"
              variant="secondary"
              onPress={() => void handleLogout()}
            />
          </View>
        </GlassCard>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#eef3fb" },
  container: { flex: 1, padding: spacing.lg, gap: spacing.lg },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 28, fontWeight: "800", color: "#fff" },
  name: {
    marginTop: 16,
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
  },
  email: { marginTop: 4, color: "#dbeafe" },
  sectionLabel: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  role: {
    marginTop: 6,
    fontSize: 20,
    fontWeight: "800",
    color: colors.onSurface,
  },
  hint: { marginTop: 8, color: colors.onSurfaceVariant, lineHeight: 20 },
  actions: { marginTop: 20, gap: 12 },
});
