import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useAppTheme } from '@theme/useAppTheme';
import { Weight, Type } from '@theme/fonts';
import { BorderRadius, Spacing } from '@theme/spacing';

interface Props {
  label: string;
  selected: boolean;
  onToggle: () => void;
}

/** Etiqueta rapida seleccionable (en lugar de escribir). */
export function Chip({ label, selected, onToggle }: Props) {
  const theme = useAppTheme();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      onPress={onToggle}
      hitSlop={{ top: 4, bottom: 4 }}
      style={[
        styles.chip,
        selected
          ? { backgroundColor: theme.text, borderColor: theme.text }
          : { borderColor: theme.divider },
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: selected ? theme.surface : theme.text },
          selected && styles.textOn,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 13,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
  },
  text: { ...Type.small },
  textOn: { fontWeight: Weight.semibold },
});
