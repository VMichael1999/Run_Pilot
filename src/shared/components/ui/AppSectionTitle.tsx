import React from 'react';
import { StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, Type } from '@theme/fonts';
import { Spacing } from '@theme/spacing';

interface AppSectionTitleProps {
  children: React.ReactNode;
  muted?: boolean;
  style?: StyleProp<TextStyle>;
}

/** Encabezado de seccion en oracion normal (nunca en mayusculas). */
export function AppSectionTitle({ children, muted = true, style }: AppSectionTitleProps) {
  const theme = useAppTheme();

  return (
    <Text
      accessibilityRole="header"
      style={[styles.title, { color: muted ? theme.textMuted : theme.text }, style]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  title: {
    ...Type.section,
    paddingTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
});
