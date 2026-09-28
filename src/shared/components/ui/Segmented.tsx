import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useAppTheme, useIsDark } from '@theme/useAppTheme';
import { FontFamily } from '@theme/fonts';

interface Props<T extends string> {
  options: { value: T; label: string }[];
  /** Valor seleccionado; si no coincide con ninguna opcion no se marca ninguna. */
  value: T | '';
  onChange: (value: T) => void;
}

/**
 * Control segmentado estilo Cupertino en JavaScript puro,
 * compatible con la Nueva Arquitectura y consistente en iOS y Android.
 */
export function Segmented<T extends string>({ options, value, onChange }: Props<T>) {
  const theme = useAppTheme();
  const isDark = useIsDark();

  const handlePress = (optValue: T) => {
    if (optValue !== value) {
      onChange(optValue);
    }
  };

  const containerBg = isDark ? '#1C1D22' : '#E9EAEF';
  const activeBg = isDark ? '#2E3038' : '#FFFFFF';

  return (
    <View
      accessibilityRole="tablist"
      style={[styles.container, { backgroundColor: containerBg }]}
    >
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            accessibilityRole="tab"
            accessibilityLabel={opt.label}
            accessibilityState={{ selected: isSelected }}
            onPress={() => handlePress(opt.value)}
            style={[
              styles.segment,
              isSelected && [
                styles.segmentActive,
                { backgroundColor: activeBg },
              ],
            ]}
          >
            <Text
              numberOfLines={1}
              style={[
                styles.label,
                {
                  color: isSelected ? theme.text : theme.textMuted,
                  fontFamily: isSelected ? FontFamily.semibold : FontFamily.medium,
                },
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 40,
    borderRadius: 10,
    padding: 3,
    alignItems: 'center',
  },
  segment: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2.5,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    textAlign: 'center',
  },
});
