import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Solicitud } from '@features/conductor/types';
import { Colors } from '@theme/colors';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing, BorderRadius, Shadow } from '@theme/spacing';

const COUNTDOWN = 20;

interface Props {
  solicitud: Solicitud;
  onAceptar: () => void;
  onRechazar: () => void;
}

export function IncomingRequestCard({ solicitud, onAceptar, onRechazar }: Props) {
  const { pasajero, paradas, precio, simboloMoneda, metodoPago } = solicitud;
  const origen  = paradas.find((p) => p.esOrigen);
  const destino = paradas.find((p) => !p.esOrigen);

  const [segundos, setSegundos] = useState(COUNTDOWN);
  const slideY = useRef(new Animated.Value(500)).current;

  useEffect(() => {
    Animated.spring(slideY, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 4,
      speed: 14,
    }).start();

    const interval = setInterval(() => {
      setSegundos((s) => {
        if (s <= 1) { clearInterval(interval); onRechazar(); return 0; }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Animated.View style={[styles.card, { transform: [{ translateY: slideY }] }]}>

      {/* Top row */}
      <View style={styles.topRow}>
        <View style={styles.topLeft}>
          <View style={styles.tipoPill}>
            <Ionicons name="person" size={11} color={Colors.white} />
            <Text style={styles.tipoText}>RunX</Text>
          </View>
          <View style={styles.exclusivoPill}>
            <Text style={styles.exclusivoText}>Exclusivo</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.closeBtn} onPress={onRechazar} activeOpacity={0.75}>
          <Ionicons name="close" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Precio */}
      <View style={styles.precioRow}>
        <Text style={styles.precio}>{simboloMoneda} {precio.toFixed(2)}</Text>
        <Ionicons name="flash" size={20} color={Colors.warning} style={{ marginTop: 6 }} />
      </View>

      {/* Rating + verificado */}
      <View style={styles.ratingRow}>
        <Ionicons name="star" size={14} color={Colors.warning} />
        <Text style={styles.ratingNum}>{pasajero.calificacion.toFixed(2)}</Text>
        <View style={styles.verificadoBadge}>
          <Ionicons name="checkmark-circle" size={14} color={Colors.primary} />
          <Text style={styles.verificadoText}>Verificado</Text>
        </View>
        <View style={{ flex: 1 }} />
        <Text style={styles.timerText}>{segundos}s</Text>
      </View>

      <View style={styles.divider} />

      {/* Ruta */}
      <View style={styles.rutaContainer}>
        <View style={styles.rutaLineas}>
          <View style={styles.dotTop} />
          <View style={styles.lineaV} />
          <View style={styles.dotBottom} />
        </View>
        <View style={styles.rutaTextos}>
          <View style={styles.rutaItem}>
            <Text style={styles.rutaTiempo}>
              {origen?.duracionMin ?? '--'} min ({origen?.distanciaKm ?? '--'} km) de distancia
            </Text>
            <Text style={styles.rutaDireccion} numberOfLines={1}>{origen?.direccion}</Text>
          </View>
          <View style={styles.rutaItem}>
            <Text style={styles.rutaTiempo}>
              {destino?.duracionMin ?? '--'} min de viaje
            </Text>
            <Text style={styles.rutaDireccion} numberOfLines={1}>{destino?.direccion}</Text>
          </View>
        </View>
      </View>

      {/* Boton */}
      <TouchableOpacity style={styles.aceptarBtn} onPress={onAceptar} activeOpacity={0.88}>
        <Text style={styles.aceptarText}>Aceptar</Text>
      </TouchableOpacity>

    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    bottom: 200,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadow.lg,
  },

  /* Top */
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  topLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  tipoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.textPrimary,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  tipoText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.white,
  },
  exclusivoPill: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  exclusivoText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.primary,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.md,
    backgroundColor: '#f0f2f5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Precio */
  precioRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  precio: {
    fontFamily: FontFamily.bold,
    fontSize: 42,
    color: Colors.textPrimary,
    letterSpacing: -1,
    lineHeight: 50,
  },

  /* Rating */
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  ratingNum: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    marginRight: 2,
  },
  verificadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  verificadoText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.primary,
  },
  timerText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },

  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginBottom: Spacing.md,
  },

  /* Ruta */
  rutaContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  rutaLineas: {
    alignItems: 'center',
    paddingTop: 4,
  },
  dotTop: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: Colors.textPrimary,
    backgroundColor: Colors.white,
  },
  lineaV: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.divider,
    marginVertical: 3,
  },
  dotBottom: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: Colors.textPrimary,
  },
  rutaTextos: {
    flex: 1,
    gap: Spacing.md,
  },
  rutaItem: { gap: 2 },
  rutaTiempo: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  rutaDireccion: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },

  /* Boton */
  aceptarBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md + 2,
    alignItems: 'center',
    ...Shadow.sm,
  },
  aceptarText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Colors.white,
    letterSpacing: 0.5,
  },
});
