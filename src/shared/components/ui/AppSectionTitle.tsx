import React from 'react';
import { StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing } from '@theme/spacing';

interface AppSectionTitleProps {
  children: React.ReactNode;
  muted?: boolean;
  style?: StyleProp<TextStyle>;
}

export function AppSectionTitle({ children, muted = false, style }: AppSectionTitleProps) {
  const theme = useAppTheme();

  return (
    <Text style={[styles.title, { color: muted ? theme.textMuted : theme.text }, style]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    marginBottom: Spacing.sm,
  },
});
