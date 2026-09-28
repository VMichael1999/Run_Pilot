import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useAppTheme } from '@theme/useAppTheme';
import { BorderRadius, Spacing } from '@theme/spacing';

interface AppCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  padded?: boolean;
}

/** Superficie con borde fino. Sin sombra: la sombra se reserva para lo que flota sobre el mapa. */
export function AppCard({ children, style, contentStyle, padded = true }: AppCardProps) {
  const theme = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        padded && styles.padded,
        { backgroundColor: theme.surface, borderColor: theme.divider },
        style,
      ]}
    >
      <View style={contentStyle}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  padded: {
    padding: Spacing.lg,
  },
});
