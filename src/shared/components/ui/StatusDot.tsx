import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useAppTheme } from '@theme/useAppTheme';

/** Punto de estado del conductor: gris desconectado, verde con halo conectado. */
export function StatusDot({ online }: { online: boolean }) {
  const theme = useAppTheme();
  return (
    <View
      style={[
        styles.halo,
        { backgroundColor: online ? theme.onlineSoft : 'transparent' },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: online ? theme.online : theme.offline }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  halo: {
    width: 17,
    height: 17,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: -4,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
});
