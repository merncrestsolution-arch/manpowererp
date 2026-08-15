import { type ReactNode } from "react";

import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View, type ViewProps } from "react-native";

import { radius, spacing } from "@/constants/theme";

type GlassCardProps = ViewProps & {
  padded?: boolean;
};

export function GlassCard({
  children,
  style,
  padded = true,
  ...props
}: GlassCardProps) {
  return (
    <View style={[styles.card, padded && styles.padded, style]} {...props}>
      {children}
    </View>
  );
}

export function HeroGradient({ children }: { children: ReactNode }) {
  return (
    <LinearGradient
      colors={["#041433", "#0b3d91", "#2563eb"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.hero}
    >
      <View style={styles.orbOne} />
      <View style={styles.orbTwo} />
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)",
    shadowColor: "#041433",
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
    overflow: "hidden",
  },
  padded: {
    padding: spacing.lg,
  },
  hero: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    overflow: "hidden",
  },
  orbOne: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(80,178,254,0.22)",
    top: -50,
    right: -30,
  },
  orbTwo: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(16,185,129,0.18)",
    bottom: -40,
    left: -20,
  },
});
