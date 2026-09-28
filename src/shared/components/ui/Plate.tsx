import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Palette } from '@theme/colors';
import { FontFamily } from '@theme/fonts';
import { BorderRadius } from '@theme/spacing';

/** Placa peruana: siempre blanca con la franja azul, en dia y en noche, como la real. */
export function Plate({ placa }: { placa: string }) {
  return (
    <View
      accessible
      accessibilityLabel={`Placa ${placa.split('').join(' ')}`}
      style={styles.plate}
    >
      <Text style={styles.band} allowFontScaling={false}>PERÚ</Text>
      <Text style={styles.number} maxFontSizeMultiplier={1.3}>{placa}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  plate: {
    minWidth: 78,
    borderWidth: 1.5,
    borderColor: Palette.ink,
    borderRadius: BorderRadius.xs,
    overflow: 'hidden',
    backgroundColor: Palette.white,
    alignItems: 'stretch',
  },
  band: {
    fontFamily: FontFamily.bold,
    fontSize: 7,
    letterSpacing: 1.3,
    textAlign: 'center',
    color: Palette.white,
    backgroundColor: Palette.plateBlue,
    paddingVertical: 1,
  },
  number: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    letterSpacing: 1,
    textAlign: 'center',
    color: Palette.ink,
    paddingHorizontal: 6,
    paddingTop: 1,
    paddingBottom: 2,
  },
});
