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

import { BrandHeader } from "@/components/brand-header";
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
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <BrandHeader subtitle="Enterprise ERP" />

          <View style={styles.hero}>
            <Text style={styles.heading}>Welcome back</Text>
            <Text style={styles.description}>
              Sign in to manage schedules, payroll, and your team on the go.
            </Text>
          </View>

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
                style={[styles.checkbox, rememberMe && styles.checkboxChecked]}
              >
                {rememberMe ? <Text style={styles.checkmark}>✓</Text> : null}
              </View>
              <Text style={styles.rememberLabel}>Remember me</Text>
            </Pressable>

            <Button
              title="Sign In"
              loading={isSubmitting}
              onPress={handleSubmit}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  hero: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.onSurface,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.onSurfaceVariant,
  },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.outline,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
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
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.outline,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceContainerLowest,
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
