import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useAppTheme } from '@theme/useAppTheme';
import { BorderRadius, Shadow, Spacing } from '@theme/spacing';

interface AppCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  padded?: boolean;
}

export function AppCard({ children, style, contentStyle, padded = true }: AppCardProps) {
  const theme = useAppTheme();

  return (
    <View style={[styles.card, padded && styles.padded, { backgroundColor: theme.surface }, style]}>
      <View style={contentStyle}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    ...Shadow.sm,
  },
  padded: {
    padding: Spacing.lg,
  },
});
