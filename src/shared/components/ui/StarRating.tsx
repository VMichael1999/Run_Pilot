import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useAppTheme } from '@theme/useAppTheme';

const STAR = 'M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4L2.8 9.5l6.4-.8z';
const SIZE = 48;

interface Props {
  value: number;
  onChange: (value: number) => void;
}

/** Cinco estrellas de 48 dp, lima al marcarse. */
export function StarRating({ value, onChange }: Props) {
  const theme = useAppTheme();
  return (
    <View
      style={styles.row}
      accessibilityRole="radiogroup"
      accessibilityLabel={value > 0 ? `Calificación: ${value} de 5` : 'Calificación: sin elegir'}
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const llena = n <= value;
        return (
          <Pressable
            key={n}
            accessibilityRole="radio"
            accessibilityLabel={n === 1 ? '1 estrella' : `${n} estrellas`}
            accessibilityState={{ checked: n === value }}
            onPress={() => {
              void Haptics.selectionAsync();
              onChange(n);
            }}
            style={({ pressed }) => [styles.star, pressed && styles.pressed]}
          >
            <Svg width={SIZE} height={SIZE} viewBox="0 0 24 24">
              <Path
                d={STAR}
                fill={llena ? theme.starFill : 'none'}
                stroke={llena ? theme.starStroke : theme.divider}
                strokeWidth={llena ? 1 : 1.6}
                strokeLinejoin="round"
              />
            </Svg>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  star: { width: SIZE, height: SIZE },
  pressed: { transform: [{ scale: 0.92 }] },
});
