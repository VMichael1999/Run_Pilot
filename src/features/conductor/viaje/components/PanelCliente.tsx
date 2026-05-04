import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AvatarPasajero } from '@shared/components/ui/AvatarPasajero';
import type { Solicitud, EstadoViaje } from '@features/conductor/types';
import { Colors } from '@theme/colors';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing, BorderRadius, Shadow } from '@theme/spacing';

interface Props {
  solicitud: Solicitud;
  estadoViaje: EstadoViaje;
  bottomOffset: number; // pixels from screen bottom (sits above BotonAccion)
}

const PRODUCTO = 'Economico';

function buildTiempoLabel(estado: EstadoViaje, elapsedMin: number): string {
  if (estado === 'aceptado' || estado === 'en_camino') return 'En camino hacia ti';
  if (estado === 'esperando') return 'El conductor ha llegado';
  if (estado === 'iniciado') {
    return elapsedMin === 0
      ? 'Comenzo hace menos de 1 min'
      : `Comenzo hace ${elapsedMin} min`;
  }
  return 'Viaje en curso';
}

export function PanelCliente({ solicitud, estadoViaje, bottomOffset }: Props) {
  const { pasajero, precio, simboloMoneda, metodoPago } = solicitud;

  // Elapsed timer for 'iniciado' state
  const [elapsedMin, setElapsedMin] = useState(0);
  useEffect(() => {
    if (estadoViaje !== 'iniciado') {
      setElapsedMin(0);
      return;
    }
    const iv = setInterval(() => setElapsedMin((m) => m + 1), 60_000);
    return () => clearInterval(iv);
  }, [estadoViaje]);

  const tiempoLabel = buildTiempoLabel(estadoViaje, elapsedMin);

  // Bottom sheet animation
  // sheetY = 0          => expanded (all content visible above BotonAccion)
  // sheetY = expandableH => collapsed (only handle + header visible)
  const expandableH  = useRef(0);
  const layoutDone   = useRef(false);
  // Start far down so nothing flashes before layout measurement
  const sheetY   = useRef(new Animated.Value(500)).current;
  const dragBase = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dy) > 4,
      onPanResponderGrant: () => {
        sheetY.stopAnimation((val) => { dragBase.current = val; });
      },
      onPanResponderMove: (_, gs) => {
        const next = Math.max(0, Math.min(expandableH.current, dragBase.current + gs.dy));
        sheetY.setValue(next);
      },
      onPanResponderRelease: (_, gs) => {
        const projected = dragBase.current + gs.dy;
        const threshold = expandableH.current * 0.45;
        const collapse  = projected > threshold || gs.vy > 0.8;
        Animated.spring(sheetY, {
          toValue: collapse ? expandableH.current : 0,
          useNativeDriver: true,
          bounciness: 5,
          speed: 14,
        }).start();
      },
    })
  ).current;

  return (
    <Animated.View
      style={[styles.panel, { bottom: bottomOffset, transform: [{ translateY: sheetY }] }]}
    >
      {/* ── Drag zone: handle + header ── */}
      <View {...panResponder.panHandlers}>
        <View style={styles.handleArea}>
          <View style={styles.handle} />
        </View>

        <View style={styles.pasajeroRow}>
          <AvatarPasajero fotoUrl={pasajero.fotoUrl} size={50} />

          <View style={styles.pasajeroInfo}>
            <Text style={styles.nombre}>
              {pasajero.nombre} {pasajero.apellido}
            </Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={12} color={Colors.warning} />
              <Text style={styles.ratingText}>
                {pasajero.calificacion.toFixed(1)}
              </Text>
              <Text style={styles.separador}>·</Text>
              <Text style={styles.tiempoText}>{tiempoLabel}</Text>
            </View>
          </View>

          {pasajero.telefono ? (
            <TouchableOpacity style={styles.msgBtn} activeOpacity={0.8}>
              <Ionicons name="chatbubble" size={18} color={Colors.white} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* ── Expandable content (measured for snap offset) ── */}
      <View
        onLayout={(e) => {
          const h = e.nativeEvent.layout.height;
          expandableH.current = h;
          if (!layoutDone.current) {
            layoutDone.current = true;
            // Snap to collapsed without animation on first render
            sheetY.setValue(h);
          }
        }}
      >
        {/* Info rows */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Producto</Text>
            <Text style={styles.infoVal}>{PRODUCTO}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total</Text>
            <Text style={styles.infoVal}>
              {simboloMoneda} {precio.toFixed(2)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Forma de pago</Text>
            <Text style={styles.infoVal}>{metodoPago}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Action rows */}
        <TouchableOpacity style={styles.actionRow} activeOpacity={0.7}>
          <Ionicons
            name="document-text-outline"
            size={20}
            color={Colors.textSecondary}
            style={styles.actionIcon}
          />
          <Text style={styles.actionLabel}>Servicios Programados</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionRow} activeOpacity={0.7}>
          <View style={styles.cancelIconWrap}>
            <Ionicons name="close" size={13} color={Colors.error} />
          </View>
          <Text style={[styles.actionLabel, { color: Colors.error }]}>
            Cancelar servicio
          </Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.error} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    ...Shadow.lg,
  },

  /* Handle */
  handleArea: {
    alignItems: 'center',
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.divider,
    borderRadius: 2,
  },

  /* Pasajero header */
  pasajeroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#eef2f7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.divider,
  },
  pasajeroInfo: { flex: 1 },
  nombre: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  ratingText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
  },
  separador: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
  },
  tiempoText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  msgBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2d3748',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },

  /* Info rows */
  infoSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
    gap: Spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  infoLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    width: 110,
  },
  infoVal: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },

  /* Divider */
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },

  /* Action rows */
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  actionIcon: {
    width: 22,
  },
  actionLabel: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  cancelIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
