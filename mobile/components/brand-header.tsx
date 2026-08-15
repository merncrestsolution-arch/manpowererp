import { StyleSheet, Text, View } from "react-native";
import { SymbolView } from "expo-symbols";

import { colors, radius, spacing } from "@/constants/theme";

type BrandHeaderProps = {
  subtitle?: string;
};

export function BrandHeader({ subtitle }: BrandHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.logo}>
        <SymbolView
          name={{ ios: "briefcase.fill", android: "work", web: "work" }}
          size={22}
          tintColor={colors.onPrimary}
        />
      </View>
      <View>
        <Text style={styles.title}>JK Manpower</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.onSurface,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 14,
    color: colors.onSurfaceVariant,
  },
});
