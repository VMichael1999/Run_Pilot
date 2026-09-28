import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, Type } from '@theme/fonts';
import { BorderRadius, Shadow } from '@theme/spacing';

interface Props<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

/** Control segmentado (Hoy / Semana / Mes). */
export function Segmented<T extends string>({ options, value, onChange }: Props<T>) {
  const theme = useAppTheme();
  return (
    <View style={[styles.seg, { backgroundColor: theme.divider }]} accessibilityRole="tablist">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(o.value)}
            style={[styles.item, on && [styles.on, { backgroundColor: theme.surface }]]}
          >
            <Text style={[styles.text, { color: on ? theme.text : theme.textMuted }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  seg: { flexDirection: 'row', borderRadius: 13, padding: 3 },
  item: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.sm,
  },
  on: { ...Shadow.sm },
  text: { ...Type.label },
});
