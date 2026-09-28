import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { EstadoViaje } from '../../types';
import type { MotivoCancelacion } from '@store/useConductorStore';
import { AppButton, OptionRow } from '@shared/components/ui';
import { useAppTheme } from '@theme/useAppTheme';
import { Type } from '@theme/fonts';
import { BorderRadius, Spacing } from '@theme/spacing';
import { afectaTasa, opcionesCancelacion } from '../cancelacion';

const ICONOS: Record<MotivoCancelacion, 'person-remove-outline' | 'chatbox-outline' | 'navigate-outline' | 'car-outline' | 'ellipsis-horizontal-circle-outline'> = {
  no_se_presento: 'person-remove-outline',
  pasajero_pidio: 'chatbox-outline',
  no_puedo_llegar: 'navigate-outline',
  problema_vehiculo: 'car-outline',
  otro: 'ellipsis-horizontal-circle-outline',
};

interface Props {
  visible: boolean;
  estado: EstadoViaje;
  esperandoSeg: number;
  nombrePasajero: string;
  onCerrar: () => void;
  onConfirmar: (motivo: MotivoCancelacion) => void;
}

/** Hoja para cancelar un viaje: motivo obligatorio y confirmacion en rojo. */
export function CancelarViajeSheet({ visible, estado, esperandoSeg, nombrePasajero, onCerrar, onConfirmar }: Props) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const [motivo, setMotivo] = useState<MotivoCancelacion | null>(null);
  const opciones = opcionesCancelacion(estado, esperandoSeg);

  // Cada vez que se abre empieza sin motivo elegido
  useEffect(() => {
    if (visible) setMotivo(null);
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCerrar}>
      <Pressable style={[styles.backdrop, { backgroundColor: theme.scrim }]} onPress={onCerrar} accessibilityLabel="Cerrar">
        <Pressable
          style={[styles.sheet, { backgroundColor: theme.surface, paddingBottom: insets.bottom + Spacing.xl }]}
          accessibilityViewIsModal
        >
          <ScrollView contentContainerStyle={styles.gap} bounces={false}>
            <View style={styles.head}>
              <Text accessibilityRole="header" style={[Type.title, { color: theme.text }]}>Cancelar viaje</Text>
              <Text style={[Type.body, { color: theme.textMuted }]}>¿Por qué cancelas el viaje con {nombrePasajero}?</Text>
            </View>
            <View accessibilityRole="radiogroup" style={styles.opciones}>
              {opciones.map((o) => (
                <OptionRow
                  key={o.motivo}
                  titulo={o.titulo}
                  detalle={o.detalle}
                  icono={ICONOS[o.motivo]}
                  selected={motivo === o.motivo}
                  disabled={!o.disponible}
                  onPress={() => setMotivo(o.motivo)}
                />
              ))}
            </View>
            {motivo && afectaTasa(motivo) ? (
              <Text style={[Type.detail, { color: theme.textMuted }]}>
                Este motivo cuenta en tu tasa de cancelación.
              </Text>
            ) : null}
            <AppButton
              label="Cancelar viaje"
              disabled={!motivo}
              onPress={() => motivo && onConfirmar(motivo)}
              style={{ backgroundColor: theme.danger }}
              labelStyle={{ color: theme.onDanger }}
              accessibilityHint={!motivo ? 'Elige primero un motivo' : undefined}
            />
            <AppButton label="Volver al viaje" variant="ghost" size="md" onPress={onCerrar} />
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    maxHeight: '90%',
    borderTopLeftRadius: BorderRadius.sheet,
    borderTopRightRadius: BorderRadius.sheet,
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.lg + 2,
  },
  gap: { gap: 14 },
  head: { gap: Spacing.xs },
  opciones: { gap: Spacing.sm },
});
