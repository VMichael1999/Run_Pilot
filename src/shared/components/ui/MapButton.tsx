import React from 'react';
import { StyleSheet, TouchableOpacity, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@theme/useAppTheme';
import { BorderRadius, Hit, HitSlop, Shadow } from '@theme/spacing';

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  accessibilityLabel: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

/** Boton de icono que flota sobre el mapa. */
export function MapButton({ icon, accessibilityLabel, onPress, style }: Props) {
  const theme = useAppTheme();
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      hitSlop={HitSlop}
      activeOpacity={0.85}
      style={[styles.btn, { backgroundColor: theme.surface }, style]}
    >
      <Ionicons name={icon} size={22} color={theme.text} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: Hit.control,
    height: Hit.control,
    borderRadius: BorderRadius.control,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.raise,
  },
});
