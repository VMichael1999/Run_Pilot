import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { Solicitud } from '@features/conductor/types';
import { Colors } from '@theme/colors';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing, BorderRadius, Shadow } from '@theme/spacing';

const { height: SH } = Dimensions.get('window');
const CARD_H = SH * 0.46;
const TIEMPO  = 30;

interface Props {
  solicitud: Solicitud;
  onAceptar: (s: Solicitud) => void;
  onRechazar: () => void;
}

export function SolicitudIncomingCard({ solicitud, onAceptar, onRechazar }: Props) {
  const insets   = useSafeAreaInsets();
  const slideY   = useRef(new Animated.Value(CARD_H)).current;
  const [seg, setSeg] = useState(TIEMPO);

  const origen  = solicitud.paradas.find((p) => p.esOrigen);
  const destino = solicitud.paradas.find((p) => !p.esOrigen);

  useEffect(() => {
    Animated.spring(slideY, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 4,
      speed: 14,
    }).start();

    const interval = setInterval(() => {
      setSeg((prev) => {
        if (prev <= 1) { clearInterval(interval); onRechazar(); return 0; }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const porcentaje = seg / TIEMPO;
  const timerColor =
    porcentaje > 0.5 ? Colors.success :
    porcentaje > 0.25 ? Colors.warning : Colors.error;

  return (
    <Animated.View
      style={[
        styles.container,
        { paddingBottom: insets.bottom + Spacing.md, transform: [{ translateY: slideY }] },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.tipoPill}>
            <Ionicons name="car" size={12} color={Colors.primary} />
            <Text style={styles.tipoText}>RunPilot</Text>
          </View>
          {solicitud.metodoPago === 'Yape' || solicitud.metodoPago === 'Plin' ? (
            <View style={styles.digitalPill}>
              <Ionicons name="flash" size={11} color="#5b21b6" />
              <Text style={styles.digitalText}>Digital</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.timerRow}>
          <Text style={[styles.timerSeg, { color: timerColor }]}>{seg}s</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={onRechazar} activeOpacity={0.8}>
            <Ionicons name="close" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Precio + rating */}
      <View style={styles.precioRow}>
        <Text style={styles.precio}>
          {solicitud.simboloMoneda} {solicitud.precio.toFixed(2)}
        </Text>
        <Ionicons name="flash" size={18} color={Colors.warning} />
      </View>
      <View style={styles.ratingRow}>
        <Ionicons name="star" size={13} color={Colors.warning} />
        <Text style={styles.ratingText}>{solicitud.pasajero.calificacion.toFixed(2)}</Text>
        <View style={styles.verifiedBadge}>
          <Ionicons name="checkmark-circle" size={13} color={Colors.primary} />
          <Text style={styles.verifiedText}>Verificado</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Ruta */}
      <View style={styles.rutaBlock}>
        <View style={styles.rutaItem}>
          <View style={styles.rutaIconCol}>
            <View style={styles.dotOrigen} />
            <View style={styles.rutaLineV} />
          </View>
          <View style={styles.rutaTexts}>
            <Text style={styles.rutaTiempo}>
              {origen?.duracionMin ?? '--'} min ({origen?.distanciaKm ?? '--'} km) de distancia
            </Text>
            <Text style={styles.rutaDireccion} numberOfLines={1}>{origen?.direccion}</Text>
          </View>
        </View>
        <View style={styles.rutaItem}>
          <View style={styles.rutaIconCol}>
            <View style={styles.dotDestino} />
          </View>
          <View style={styles.rutaTexts}>
            <Text style={styles.rutaTiempo}>
              {destino?.duracionMin ?? '--'} min ({destino?.distanciaKm ?? '--'} km) de viaje
            </Text>
            <Text style={styles.rutaDireccion} numberOfLines={1}>{destino?.direccion}</Text>
          </View>
        </View>
      </View>

      {/* Boton */}
      <TouchableOpacity
        style={styles.aceptarBtn}
        onPress={() => onAceptar(solicitud)}
        activeOpacity={0.88}
      >
        <Text style={styles.aceptarText}>Aceptar</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    ...Shadow.lg,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  tipoPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#eef2ff',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  tipoText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.primary,
  },
  digitalPill: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#f5f3ff',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  digitalText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: '#5b21b6',
  },
  timerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  timerSeg: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
  },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#f0f2f5',
    alignItems: 'center', justifyContent: 'center',
  },

  precioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  precio: {
    fontFamily: FontFamily.bold,
    fontSize: 36,
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: Spacing.md,
  },
  ratingText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  verifiedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    marginLeft: 4,
  },
  verifiedText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.primary,
  },

  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginBottom: Spacing.md,
  },

  rutaBlock: { marginBottom: Spacing.lg },
  rutaItem: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  rutaIconCol: {
    alignItems: 'center',
    width: 14,
    paddingTop: 3,
  },
  dotOrigen: {
    width: 10, height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.white,
    shadowColor: Colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 2,
  },
  rutaLineV: {
    width: 2,
    height: 28,
    backgroundColor: Colors.divider,
    marginVertical: 2,
  },
  dotDestino: {
    width: 10, height: 10,
    borderRadius: 2,
    backgroundColor: Colors.textPrimary,
  },
  rutaTexts: { flex: 1, marginBottom: Spacing.sm },
  rutaTiempo: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  rutaDireccion: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 1,
  },

  aceptarBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    ...Shadow.md,
  },
  aceptarText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.white,
    letterSpacing: 0.5,
  },
});
