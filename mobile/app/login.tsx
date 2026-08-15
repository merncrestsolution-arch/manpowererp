import { LinearGradient } from "expo-linear-gradient";
import { Redirect } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { colors, radius, spacing } from "@/constants/theme";
import { useAuth } from "@/lib/auth";

export default function LoginScreen() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user) {
    return <Redirect href="/(app)/(tabs)/dashboard" />;
  }

  const handleSubmit = async () => {
    setError(null);

    if (!email.trim() || !password) {
      setError("Email and password are required");
      return;
    }

    setIsSubmitting(true);
    const loginError = await login(email.trim(), password, rememberMe);
    setIsSubmitting(false);

    if (loginError) {
      setError(loginError);
    }
  };

  return (
    <LinearGradient
      colors={["#041433", "#0b3d91", "#123a73"]}
      style={styles.flex}
    >
      <SafeAreaView style={styles.flex}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.brandMark}>
              <LinearGradient
                colors={["#50b2fe", "#2563eb"]}
                style={styles.logo}
              >
                <Text style={styles.logoGlyph}>JK</Text>
              </LinearGradient>
              <Text style={styles.brand}>JK Manpower</Text>
              <Text style={styles.kicker}>FIELD COMMAND</Text>
            </View>

            <Text style={styles.heading}>
              Your workforce,{"\n"}in your pocket.
            </Text>
            <Text style={styles.description}>
              Clock in with GPS, follow today&apos;s shift, and keep payroll at
              hand — designed for the floor, not the desktop.
            </Text>

            <View style={styles.card}>
              {error ? (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <Input
                label="Employee ID or Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                textContentType="emailAddress"
              />

              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
                textContentType="password"
              />

              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: rememberMe }}
                onPress={() => setRememberMe((value) => !value)}
                style={styles.rememberRow}
              >
                <View
                  style={[
                    styles.checkbox,
                    rememberMe && styles.checkboxChecked,
                  ]}
                >
                  {rememberMe ? <Text style={styles.checkmark}>✓</Text> : null}
                </View>
                <Text style={styles.rememberLabel}>Remember me</Text>
              </Pressable>

              <Button
                title="Enter workspace"
                loading={isSubmitting}
                onPress={handleSubmit}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
    gap: spacing.md,
    justifyContent: "center",
  },
  brandMark: {
    alignItems: "flex-start",
    gap: 8,
    marginBottom: spacing.sm,
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  logoGlyph: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 1,
  },
  brand: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  kicker: {
    color: colors.accentCyan,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 3,
  },
  heading: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "800",
    color: "#fff",
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: "rgba(226,232,240,0.86)",
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  errorBanner: {
    backgroundColor: colors.errorContainer,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
  },
  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.outline,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.onPrimary,
    fontSize: 12,
    fontWeight: "700",
  },
  rememberLabel: {
    fontSize: 14,
    color: colors.onSurface,
  },
});
