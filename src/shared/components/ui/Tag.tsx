import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '@theme/useAppTheme';
import { Type } from '@theme/fonts';
import { BorderRadius, Spacing } from '@theme/spacing';

type Tone = 'neutral' | 'cash' | 'digital' | 'success' | 'signal';

/** Etiqueta chica de estado: tipo de servicio, metodo de pago. */
export function Tag({ label, tone = 'neutral' }: { label: string; tone?: Tone }) {
  const theme = useAppTheme();
  const colors = {
    neutral: { bg: theme.background, fg: theme.text },
    cash:    { bg: theme.cashSoft,   fg: theme.cash },
    digital: { bg: theme.digitalSoft, fg: theme.digital },
    success: { bg: theme.onlineSoft, fg: theme.online },
    signal:  { bg: theme.signal,     fg: theme.onSignal },
  }[tone];
  return (
    <View style={[styles.tag, { backgroundColor: colors.bg }]}>
      <Text style={[Type.tag, { color: colors.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
});
