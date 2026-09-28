import React, { useState } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '@theme/useAppTheme';
import { Weight } from '@theme/fonts';

interface Props {
  fotoUrl?: string;
  nombre?: string;
  apellido?: string;
  size?: number;
}

function iniciales(nombre?: string, apellido?: string): string {
  return `${nombre?.[0] ?? ''}${apellido?.[0] ?? ''}`.toUpperCase();
}

/** Foto del pasajero con respaldo de iniciales si no hay foto o no carga. */
export function AvatarPasajero({ fotoUrl, nombre, apellido, size = 40 }: Props) {
  const theme = useAppTheme();
  const [error, setError] = useState(false);
  const radius = Math.round(size * 0.3);
  const label = [nombre, apellido].filter(Boolean).join(' ');

  if (fotoUrl && !error) {
    return (
      <Image
        accessibilityLabel={label ? `Foto de ${label}` : 'Foto del pasajero'}
        source={{ uri: fotoUrl }}
        style={{ width: size, height: size, borderRadius: radius, backgroundColor: theme.divider }}
        onError={() => setError(true)}
      />
    );
  }

  return (
    <View
      accessible
      accessibilityLabel={label || 'Pasajero'}
      style={[
        styles.fallback,
        { width: size, height: size, borderRadius: radius, backgroundColor: theme.text },
      ]}
    >
      <Text style={[styles.initials, { color: theme.surface, fontSize: Math.round(size * 0.35) }]}>
        {iniciales(nombre, apellido)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontWeight: Weight.bold,
  },
});
