import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@theme/useAppTheme';
import { Type } from '@theme/fonts';
import { BorderRadius, Spacing } from '@theme/spacing';
import { LogosPago, type LogoPago } from './logosPago';

interface Props {
  titulo: string;
  detalle?: string;
  icono: keyof typeof Ionicons.glyphMap;
  /** Logo del medio de pago; si esta, reemplaza al icono. */
  logo?: LogoPago;
  selected: boolean;
  /** Opcion visible pero no elegible (el detalle explica por que). */
  disabled?: boolean;
  onPress: () => void;
}

/** Opcion de una lista de eleccion unica (metodo de pago, destino del retiro). */
export function OptionRow({ titulo, detalle, icono, logo, selected, disabled = false, onPress }: Props) {
  const theme = useAppTheme();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      accessibilityLabel={detalle ? `${titulo}. ${detalle}` : titulo}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: theme.surface,
          borderColor: selected ? theme.text : theme.divider,
          borderWidth: selected ? 2 : 1,
        },
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      {logo ? (
        <Image
          source={LogosPago[logo]}
          style={styles.logo}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
      ) : (
        <View style={[styles.icon, { backgroundColor: theme.background }]}>
          <Ionicons name={icono} size={20} color={theme.text} />
        </View>
      )}
      <View style={styles.flex}>
        <Text style={[Type.label, { color: theme.text }]}>{titulo}</Text>
        {detalle ? <Text style={[Type.caption, { color: theme.textMuted }]}>{detalle}</Text> : null}
      </View>
      <Ionicons
        name={selected ? 'radio-button-on' : 'radio-button-off'}
        size={22}
        color={selected ? theme.text : theme.textMuted}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 2 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    minHeight: 64,
    paddingHorizontal: 14,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.lg,
  },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.5 },
  logo: { width: 40, height: 40 },
  icon: { width: 40, height: 40, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
});
