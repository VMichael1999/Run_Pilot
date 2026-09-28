import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useAppTheme } from '@theme/useAppTheme';
import { Type } from '@theme/fonts';
import { BorderRadius, Spacing } from '@theme/spacing';

interface Props {
  value: string;
  onChange: (value: string) => void;
  accessibilityLabel: string;
  error?: string;
  simbolo?: string;
}

/** Normaliza lo que escribe el conductor a un monto con hasta 2 decimales. */
export function limpiarMonto(texto: string): string {
  const t = texto.replace(',', '.').replace(/[^\d.]/g, '');
  const [ent, ...resto] = t.split('.');
  const dec = resto.join('').slice(0, 2);
  return resto.length ? `${ent.slice(0, 5)}.${dec}` : ent.slice(0, 5);
}

/** Campo grande de monto "S/ 50.00". */
export function AmountField({ value, onChange, accessibilityLabel, error, simbolo = 'S/' }: Props) {
  const theme = useAppTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.field,
          {
            backgroundColor: theme.surface,
            borderColor: error ? theme.danger : focused ? theme.text : theme.divider,
          },
        ]}
      >
        <Text style={[Type.currency, { color: theme.textMuted }]}>{simbolo}</Text>
        <TextInput
          accessibilityLabel={accessibilityLabel}
          value={value}
          onChangeText={(t) => onChange(limpiarMonto(t))}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          keyboardType="decimal-pad"
          placeholder="0.00"
          placeholderTextColor={theme.textMuted}
          style={[Type.price, styles.input, { color: theme.text }]}
        />
      </View>
      {error ? (
        <Text accessibilityLiveRegion="polite" style={[Type.detail, { color: theme.danger }]}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.xs },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    minHeight: 76,
    borderWidth: 1.5,
    borderRadius: BorderRadius.xl,
  },
  input: { flex: 1, paddingVertical: Spacing.sm },
});
