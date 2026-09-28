import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ConductorStackParamList } from '@navigation/types';
import { useConductorStore } from '@store/useConductorStore';
import { AppHeader, Plate, Tag } from '@shared/components/ui';
import { useAppTheme } from '@theme/useAppTheme';
import { Weight, Type } from '@theme/fonts';
import { BorderRadius, Spacing } from '@theme/spacing';
import { Duration } from '@theme/motion';
import { mockConductor } from '../data/mockConductor';
import { useVehiculoActivo } from './useVehiculoActivo';

type Props = NativeStackScreenProps<ConductorStackParamList, 'SeleccionarVehiculo'>;

/**
 * Elegir con que vehiculo salir. Solo cambia el vehiculo activo y vuelve;
 * conectarse es un paso aparte ("Conectarme" en el inicio).
 */
export function SeleccionarVehiculoScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const setVehiculo = useConductorStore((s) => s.setVehiculo);
  const [elegido, setElegido] = useState<string | null>(null);
  const activo = useVehiculoActivo().id;

  // Elegir solo cambia el vehiculo; conectarse sigue siendo "Conectarme" en el inicio
  const elegir = (id: string) => {
    if (elegido) return;
    setElegido(id);
    setVehiculo(id);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => navigation.goBack(), Duration.slow);
  };

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <AppHeader title="Vehículo" />
      <ScrollView contentContainerStyle={[styles.pad, { paddingBottom: insets.bottom + Spacing['2xl'] }]}>
        <Text style={[Type.body, { color: theme.textMuted }]}>
          Elige con qué vehículo vas a salir. Luego conéctate desde el inicio para recibir viajes.
        </Text>
        {mockConductor.vehiculos.map((v) => {
          const sel = elegido === v.id;
          return (
            <Pressable
              key={v.id}
              accessibilityRole="button"
              accessibilityState={{ selected: sel, disabled: !!elegido }}
              accessibilityLabel={`${v.marca} ${v.modelo} ${v.color} ${v.anio}, placa ${v.placa}${v.id === activo ? ', vehículo activo' : ''}. Usar este vehículo`}
              onPress={() => elegir(v.id)}
              style={({ pressed }) => [
                styles.card,
                { backgroundColor: theme.surface, borderColor: sel ? theme.text : theme.divider },
                sel && styles.cardSel,
                pressed && styles.pressed,
              ]}
            >
              <Plate placa={v.placa} />
              <View style={styles.flex}>
                <Text style={[styles.nombre, { color: theme.text }]}>{v.marca} {v.modelo}</Text>
                <Text style={[Type.detail, { color: theme.textMuted }]}>{v.color} · {v.anio}</Text>
              </View>
              {sel ? (
                <Ionicons name="checkmark-circle" size={24} color={theme.online} />
              ) : v.id === activo ? (
                <Tag label="Activo" tone="success" />
              ) : (
                <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pad: { paddingHorizontal: 18, paddingTop: Spacing.xs, gap: Spacing.md },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    minHeight: 72,
    padding: 14,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  cardSel: { borderWidth: 2 },
  pressed: { opacity: 0.7 },
  nombre: { ...Type.bodyStrong },
});
