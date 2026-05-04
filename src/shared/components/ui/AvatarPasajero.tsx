import React, { useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@theme/colors';

interface Props {
  fotoUrl?: string;
  size?: number;
}

export function AvatarPasajero({ fotoUrl, size = 48 }: Props) {
  const [error, setError] = useState(false);
  const radius = size / 2;

  if (fotoUrl && !error) {
    return (
      <Image
        source={{ uri: fotoUrl }}
        style={[styles.img, { width: size, height: size, borderRadius: radius }]}
        onError={() => setError(true)}
      />
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        { width: size, height: size, borderRadius: radius },
      ]}
    >
      <Ionicons name="person" size={size * 0.45} color={Colors.textSecondary} />
    </View>
  );
}

const styles = StyleSheet.create({
  img: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  fallback: {
    backgroundColor: '#eef2f7',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
