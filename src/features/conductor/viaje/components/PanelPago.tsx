import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AvatarPasajero } from '@shared/components/ui/AvatarPasajero';
import type { Solicitud } from '@features/conductor/types';
import { Colors } from '@theme/colors';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing, BorderRadius, Shadow } from '@theme/spacing';

interface Props {
  solicitud: Solicitud;
  onFinalizar: () => void;
}

const METODO_ICONO: Record<string, keyof typeof Ionicons.glyphMap> = {
  Efectivo: 'cash-outline',
  Yape:     'phone-portrait-outline',
  Plin:     'phone-portrait-outline',
  Tarjeta:  'card-outline',
};

function buildTripRef(id: string): string {
  const num = (id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 900_000) + 100_000;
  return `TRP-${num}`;
}

function buildFecha(): string {
  const now = new Date();
  return now.toLocaleDateString('es-PE', {
    day: '2-digit', month: 'short', year: 'numeric',
  }) + ' · ' + now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
}

export function PanelPago({ solicitud, onFinalizar }: Props) {
  const insets = useSafeAreaInsets();
  const { precio, simboloMoneda, moneda, metodoPago, pasajero, paradas, id } = solicitud;

  const origen     = paradas.find((p) => p.esOrigen);
  const destino    = paradas.find((p) => !p.esOrigen);
  const iconoPago  = METODO_ICONO[metodoPago] ?? 'wallet-outline';
  const tripRef    = buildTripRef(id);
  const fechaHora  = buildFecha();

  return (
    <View style={[StyleSheet.absoluteFillObject, styles.root]}>

      {/* ══════════════ HEADER ══════════════ */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.xl }]}>

        {/* Check badge */}
        <View style={styles.checkRing}>
          <View style={styles.checkInner}>
            <Ionicons name="checkmark" size={26} color={Colors.white} />
          </View>
        </View>

        <Text style={styles.completadoLabel}>Viaje completado</Text>

        {/* Precio */}
        <View style={styles.precioWrap}>
          <Text style={styles.precioSymbol}>{simboloMoneda}</Text>
          <Text style={styles.precioAmount}>{precio.toFixed(2)}</Text>
        </View>
        <Text style={styles.precioSub}>Ganancia del viaje · {moneda}</Text>

        {/* Referencia */}
        <View style={styles.refChip}>
          <Ionicons name="receipt-outline" size={12} color="rgba(255,255,255,0.6)" />
          <Text style={styles.refText}>{tripRef}</Text>
          <Text style={styles.refSep}>·</Text>
          <Text style={styles.refText}>{fechaHora}</Text>
        </View>
      </View>

      {/* ══════════════ CUERPO ══════════════ */}
      <View style={styles.body}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: Spacing.lg, gap: Spacing.md, paddingBottom: 120 }}
        >

          {/* ── Tarjeta pasajero ── */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="person-circle-outline" size={15} color={Colors.textSecondary} />
              <Text style={styles.cardTitle}>PASAJERO</Text>
            </View>
            <View style={styles.pasajeroRow}>
              <AvatarPasajero fotoUrl={pasajero.fotoUrl} size={52} />
              <View style={{ flex: 1 }}>
                <Text style={styles.pasajeroNombre}>
                  {pasajero.nombre} {pasajero.apellido}
                </Text>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Ionicons
                      key={i}
                      name={i <= Math.round(pasajero.calificacion) ? 'star' : 'star-outline'}
                      size={13}
                      color={Colors.warning}
                    />
                  ))}
                  <Text style={styles.starNum}>{pasajero.calificacion.toFixed(1)}</Text>
                </View>
              </View>
              <View style={styles.viajesBadge}>
                <Text style={styles.viajesNum}>{pasajero.totalViajes}</Text>
                <Text style={styles.viajesLbl}>viajes</Text>
              </View>
            </View>
          </View>

          {/* ── Tarjeta ruta ── */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="map-outline" size={15} color={Colors.textSecondary} />
              <Text style={styles.cardTitle}>RUTA DEL VIAJE</Text>
            </View>

            <View style={styles.rutaContainer}>
              {/* Linea vertical */}
              <View style={styles.rutaLineas}>
                <View style={styles.dotOrigen} />
                <View style={styles.lineaV} />
                <View style={styles.dotDestino} />
              </View>

              {/* Textos */}
              <View style={{ flex: 1, gap: Spacing.lg }}>
                <View>
                  <Text style={styles.rutaTag}>ORIGEN</Text>
                  <Text style={styles.rutaDireccion}>{origen?.direccion ?? '--'}</Text>
                  {origen?.notas ? (
                    <Text style={styles.rutaNotas}>{origen.notas}</Text>
                  ) : null}
                </View>
                <View>
                  <Text style={styles.rutaTag}>DESTINO</Text>
                  <Text style={styles.rutaDireccion}>{destino?.direccion ?? '--'}</Text>
                </View>
              </View>
            </View>

            {/* Chips de meta */}
            {(destino?.duracionMin || destino?.distanciaKm) ? (
              <View style={styles.metaRow}>
                {destino.duracionMin ? (
                  <View style={styles.metaChip}>
                    <Ionicons name="time-outline" size={13} color={Colors.primary} />
                    <Text style={styles.metaChipText}>{destino.duracionMin} min de viaje</Text>
                  </View>
                ) : null}
                {destino.distanciaKm ? (
                  <View style={styles.metaChip}>
                    <Ionicons name="navigate-outline" size={13} color={Colors.primary} />
                    <Text style={styles.metaChipText}>{destino.distanciaKm} km</Text>
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>

          {/* ── Tarjeta pago ── */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="card-outline" size={15} color={Colors.textSecondary} />
              <Text style={styles.cardTitle}>DETALLE DEL COBRO</Text>
            </View>

            {/* Metodo */}
            <View style={styles.pagoMetodoRow}>
              <View style={styles.pagoIconWrap}>
                <Ionicons name={iconoPago} size={20} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.pagoMetodoNombre}>{metodoPago}</Text>
                <Text style={styles.pagoMetodoSub}>Metodo de pago del pasajero</Text>
              </View>
              <View style={styles.pagoPill}>
                <View style={styles.pagoPillDot} />
                <Text style={styles.pagoPillText}>Confirmado</Text>
              </View>
            </View>

            <View style={styles.pagoDivider} />

            {/* Lineas */}
            <View style={styles.pagoLinea}>
              <Text style={styles.pagoLineaLabel}>Tarifa del servicio</Text>
              <Text style={styles.pagoLineaVal}>{simboloMoneda} {precio.toFixed(2)}</Text>
            </View>

            <View style={styles.pagoDivider} />

            {/* Total */}
            <View style={styles.pagoTotal}>
              <Text style={styles.pagoTotalLabel}>Total cobrado</Text>
              <Text style={styles.pagoTotalMonto}>{simboloMoneda} {precio.toFixed(2)}</Text>
            </View>
          </View>

        </ScrollView>

        {/* ── Boton ── */}
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Spacing.lg) }]}>
          <TouchableOpacity style={styles.finalizarBtn} onPress={onFinalizar} activeOpacity={0.88}>
            <Ionicons name="checkmark-circle-outline" size={20} color={Colors.white} />
            <Text style={styles.finalizarText}>FINALIZAR Y COBRAR</Text>
          </TouchableOpacity>
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: Colors.primary,
  },

  /* ══ Header ══ */
  header: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['3xl'],
  },
  checkRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(34,197,94,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  checkInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },
  completadoLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  precioWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
  },
  precioSymbol: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.white,
    marginTop: 10,
  },
  precioAmount: {
    fontFamily: FontFamily.bold,
    fontSize: 58,
    color: Colors.white,
    letterSpacing: -2,
    lineHeight: 64,
  },
  precioSub: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.45)',
    marginTop: 2,
    marginBottom: Spacing.md,
  },
  refChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
  },
  refText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.6)',
  },
  refSep: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: FontSize.xs,
  },

  /* ══ Body ══ */
  body: {
    flex: 1,
    backgroundColor: '#f4f6f9',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,
    overflow: 'hidden',
  },

  /* ── Cards ── */
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadow.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  cardTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    color: Colors.textSecondary,
    letterSpacing: 1.2,
  },

  /* Pasajero */
  pasajeroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#eef2f7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.divider,
  },
  pasajeroNombre: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  starNum: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
    marginLeft: 4,
  },
  viajesBadge: {
    alignItems: 'center',
    backgroundColor: '#f4f6f9',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    minWidth: 52,
  },
  viajesNum: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  viajesLbl: {
    fontFamily: FontFamily.regular,
    fontSize: 10,
    color: Colors.textSecondary,
  },

  /* Ruta */
  rutaContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  rutaLineas: {
    alignItems: 'center',
    paddingTop: 4,
    width: 16,
  },
  dotOrigen: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2.5,
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
  },
  lineaV: {
    width: 2,
    flex: 1,
    minHeight: 36,
    backgroundColor: Colors.divider,
    marginVertical: 4,
  },
  dotDestino: {
    width: 12,
    height: 12,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  rutaTag: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    color: Colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  rutaDireccion: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  rutaNotas: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EEF2FF',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
  },
  metaChipText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.primary,
  },

  /* Pago */
  pagoMetodoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  pagoIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pagoMetodoNombre: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  pagoMetodoSub: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  pagoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(34,197,94,0.1)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  pagoPillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
  },
  pagoPillText: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    color: Colors.success,
  },
  pagoDivider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: Spacing.sm,
  },
  pagoLinea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  pagoLineaLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  pagoLineaVal: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  pagoTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f4f6f9',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  pagoTotalLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  pagoTotalMonto: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.success,
  },

  /* Footer */
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  finalizarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.success,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    ...Shadow.md,
  },
  finalizarText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Colors.white,
    letterSpacing: 0.8,
  },
});
