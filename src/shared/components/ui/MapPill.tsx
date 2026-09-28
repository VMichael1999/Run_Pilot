import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useAppTheme } from '@theme/useAppTheme';
import { BorderRadius, Shadow, Spacing } from '@theme/spacing';

interface Props {
  children: React.ReactNode;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

/** Pastilla flotante sobre el mapa (estado, ganancias del dia). */
export function MapPill({ children, accessibilityLabel, style }: Props) {
  const theme = useAppTheme();
  return (
    <View
      accessible={!!accessibilityLabel}
      accessibilityLabel={accessibilityLabel}
      style={[styles.pill, { backgroundColor: theme.surface }, style]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    minHeight: 36,
    paddingVertical: Spacing.xs,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.md + 2,
    borderRadius: BorderRadius.full,
    ...Shadow.raise,
  },
});
