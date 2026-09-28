import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ConductorStackParamList } from '@navigation/types';
import { mockSolicitudes } from '../data/mockSolicitudes';
import { useConductorStore } from '@store/useConductorStore';
import { IncomingRequestOverlay } from '../home/components/IncomingRequestOverlay';
import { MapButton } from '@shared/components/ui';
import { Spacing } from '@theme/spacing';

type Props = NativeStackScreenProps<ConductorStackParamList, 'SolicitudDetalle'>;

/**
 * Solicitud abierta desde el tablero. Se ve y se acepta igual que una solicitud
 * entrante (deslizar para aceptar, 30 s); rechazar o que se acabe el tiempo vuelve al tablero.
 */
export function SolicitudDetalleScreen({ route, navigation }: Props) {
  const { solicitudId } = route.params;
  const insets = useSafeAreaInsets();
  const setSolicitudActual = useConductorStore((s) => s.setSolicitudActual);
  const solicitud = mockSolicitudes.find((s) => s.id === solicitudId);

  if (!solicitud) return null;

  const volver = () => {
    if (navigation.canGoBack()) navigation.goBack();
  };

  return (
    <View style={styles.flex}>
      <IncomingRequestOverlay
        solicitud={solicitud}
        onAceptar={() => {
          setSolicitudActual(solicitud);
          navigation.replace('Viaje', { solicitudId: solicitud.id });
        }}
        onRechazar={volver}
      />
      <MapButton
        icon="arrow-back"
        accessibilityLabel="Volver al tablero"
        onPress={volver}
        style={[styles.back, { top: insets.top + Spacing.sm }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  back: { position: 'absolute', left: Spacing.md },
});
