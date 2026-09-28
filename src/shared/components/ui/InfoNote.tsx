import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@theme/useAppTheme';
import { Weight, Type } from '@theme/fonts';
import { BorderRadius, Spacing } from '@theme/spacing';

interface Props {
  /** Parte en negrita al inicio. */
  title?: string;
  children: React.ReactNode;
}

/** Nota informativa en el color de "recojo/informacion". */
export function InfoNote({ title, children }: Props) {
  const theme = useAppTheme();
  return (
    <View style={[styles.box, { backgroundColor: theme.pickupSoft }]}>
      <Ionicons name="information-circle-outline" size={20} color={theme.pickup} style={styles.icon} />
      <Text style={[styles.text, { color: theme.text }]}>
        {title ? <Text style={styles.bold}>{title} </Text> : null}
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm + 2,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  icon: { marginTop: 1 },
  text: {
    flex: 1,
    ...Type.note,
  },
  bold: { fontWeight: Weight.semibold },
});
