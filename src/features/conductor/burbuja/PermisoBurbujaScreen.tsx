import React, { useEffect, useRef } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ConductorStackParamList } from '@navigation/types';
import { BurbujaFlotante } from '@modules/burbuja-flotante';
import { AppButton, AppHeader } from '@shared/components/ui';
import { useAppTheme } from '@theme/useAppTheme';
import { Palette } from '@theme/colors';
import { Type } from '@theme/fonts';
import { BorderRadius, Spacing, Shadow } from '@theme/spacing';
import { usePermisoBurbuja } from './permiso';

type Props = NativeStackScreenProps<ConductorStackParamList, 'PermisoBurbuja'>;

const PASOS = [
  'Toca "Activar burbuja".',
  'En la lista, busca Run Pilot.',
  'Activa "Permitir mostrar sobre otras apps" y vuelve.',
];

/** Explica la burbuja y lleva al ajuste del sistema para concederle el permiso. */
export function PermisoBurbujaScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const { permiso } = usePermisoBurbuja();

  // Vibracion de exito solo cuando el permiso se concede con la pantalla abierta
  const antes = useRef(permiso);
  useEffect(() => {
    if (permiso && !antes.current) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    antes.current = permiso;
  }, [permiso]);

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <AppHeader title="" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={[styles.pad, { paddingBottom: insets.bottom + Spacing['2xl'] }]}>
        {/* Ilustracion: otra app de fondo con la burbuja de Run Pilot en el borde */}
        <View
          style={[styles.telefono, { backgroundColor: theme.surface, borderColor: theme.divider }]}
          importantForAccessibility="no-hide-descendants"
        >
          {[0.8, 0.55, 0.7, 0.4].map((ancho, i) => (
            <View key={i} style={[styles.linea, { width: `${ancho * 100}%`, backgroundColor: theme.divider }]} />
          ))}
          <View style={[styles.burbuja, Shadow.raise]}>
            <Image source={require('../../../../assets/icon.png')} style={styles.icono} />
          </View>
        </View>

        <View style={styles.textos}>
          <Text accessibilityRole="header" style={[Type.title, { color: theme.text }]}>
            Vuelve a tu viaje con un toque
          </Text>
          <Text style={[Type.body, { color: theme.textMuted }]}>
            Durante un viaje, si abres otra app como Waze, Google Maps o WhatsApp, verás una burbuja de Run Pilot.
            Tócala para volver al viaje. Al volver, la burbuja desaparece sola.
          </Text>
        </View>

        {permiso ? (
          <View style={[styles.listo, { backgroundColor: theme.onlineSoft }]} accessibilityLiveRegion="polite">
            <Ionicons name="checkmark-circle" size={24} color={theme.online} />
            <View style={styles.flex}>
              <Text style={[Type.label, { color: theme.text }]}>Burbuja activada</Text>
              <Text style={[Type.caption, { color: theme.textMuted }]}>
                Aparecerá solo mientras tengas un viaje en curso.
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.pasos}>
            {PASOS.map((paso, i) => (
              <View key={paso} style={styles.paso}>
                <View style={[styles.num, { backgroundColor: theme.surface, borderColor: theme.divider }]}>
                  <Text style={[Type.tag, { color: theme.text }]}>{i + 1}</Text>
                </View>
                <Text style={[Type.body, styles.flex, { color: theme.text }]}>{paso}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.acciones}>
          {permiso ? (
            <AppButton label="Listo" onPress={() => navigation.goBack()} />
          ) : (
            <>
              <AppButton label="Activar burbuja" onPress={() => BurbujaFlotante.abrirAjustesPermiso()} />
              <AppButton label="Ahora no" variant="ghost" size="md" onPress={() => navigation.goBack()} />
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pad: { paddingHorizontal: Spacing.lg + 2, gap: Spacing.xl },
  telefono: {
    height: 180,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.md,
    overflow: 'hidden',
  },
  linea: { height: 10, borderRadius: 5 },
  burbuja: {
    position: 'absolute',
    right: Spacing.md,
    top: 64,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Palette.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icono: { width: 60, height: 60, borderRadius: 30 },
  textos: { gap: Spacing.sm },
  listo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  pasos: { gap: Spacing.md },
  paso: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  num: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acciones: { gap: Spacing.sm },
});
