import React from 'react';
import { StyleSheet } from 'react-native';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { useAppTheme, useIsDark } from '@theme/useAppTheme';
import { Weight } from '@theme/fonts';

interface Props<T extends string> {
  options: { value: T; label: string }[];
  /** Valor seleccionado; si no coincide con ninguna opcion no se marca ninguna. */
  value: T | '';
  onChange: (value: T) => void;
}

/**
 * Control segmentado estilo Cupertino. En iOS es el UISegmentedControl nativo;
 * en Android la libreria dibuja la misma forma en JS.
 */
export function Segmented<T extends string>({ options, value, onChange }: Props<T>) {
  const theme = useAppTheme();
  const isDark = useIsDark();
  const selectedIndex = options.findIndex((o) => o.value === value);

  return (
    <SegmentedControl
      values={options.map((o) => o.label)}
      selectedIndex={selectedIndex}
      onChange={(e) => {
        const o = options[e.nativeEvent.selectedSegmentIndex];
        if (o) onChange(o.value);
      }}
      appearance={isDark ? 'dark' : 'light'}
      fontStyle={{ fontWeight: Weight.medium, fontSize: 14, color: theme.textMuted }}
      activeFontStyle={{ fontWeight: Weight.semibold, fontSize: 14, color: theme.text }}
      style={styles.seg}
    />
  );
}

const styles = StyleSheet.create({
  // Algo mas alto que el nativo (32) para que se toque bien con el auto en marcha
  seg: { height: 40 },
});
