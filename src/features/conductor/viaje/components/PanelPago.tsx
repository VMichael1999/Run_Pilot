import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { Solicitud } from '@features/conductor/types';
import { mockConductor } from '@features/conductor/data/mockConductor';
import { AppButton } from '@shared/components/ui';
import { formatSoles } from '@shared/utils/format';
import { desgloseCobro, distritoDe, esEfectivo } from '@shared/utils/cobro';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, Type } from '@theme/fonts';
import { BorderRadius, Hit, Spacing } from '@theme/spacing';
import { Duration } from '@theme/motion';

interface Props {
  solicitud: Solicitud;
  /** Km recorridos segun la ruta, si se conocen. */
  distanciaKm?: number;
  onFinalizar: () => void;
}

/**
 * Cobro al terminar el viaje. La pregunta del conductor es "cuanto le cobro",
 * asi que esa cifra va primero y el desglose despues.
 */
export function PanelPago({ solicitud, distanciaKm, onFinalizar }: Props) {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const { precio, metodoPago, pasajero, paradas } = solicitud;

  const origen  = paradas.find((p) => p.esOrigen);
  const destino = paradas.find((p) => !p.esOrigen);
  const efectivo = esEfectivo(metodoPago);
  const { tarifa, comision, ganancia } = desgloseCobro(precio, mockConductor.comision);
  const porcentaje = Math.round(mockConductor.comision * 100);

  const resumen = [
    destino?.duracionMin ? `${destino.duracionMin} min` : undefined,
    distanciaKm ? `${distanciaKm.toFixed(1)} km` : undefined,
    origen && destino ? `${distritoDe(origen.direccion)} → ${distritoDe(destino.direccion)}` : undefined,
  ].filter(Boolean).join(' · ');

  const otroMetodo = () =>
    Alert.alert(
      'Pagó con otro método',
      'Todavía no se puede registrar otro método desde la app. Si el pasajero pagó con Yape o Plin, confírmalo con soporte.',
    );

  return (
    <View style={[StyleSheet.absoluteFillObject, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.pad,
          { paddingTop: insets.top + Spacing.md, paddingBottom: insets.bottom + Spacing.xl + 2 },
        ]}
      >
        <Animated.View entering={FadeIn.duration(Duration.slow)} style={styles.gap}>
          <View style={styles.head}>
            <View style={[styles.okc, { backgroundColor: theme.onlineSoft }]}>
              <Ionicons name="checkmark" size={20} color={theme.online} />
            </View>
            <View style={styles.flex}>
              <Text accessibilityRole="header" style={[Type.heading, { color: theme.text }]}>
                Viaje finalizado
              </Text>
              {resumen ? <Text style={[Type.detail, { color: theme.textMuted }]}>{resumen}</Text> : null}
            </View>
          </View>

          {/* Lo primero: cuanto cobrar y como */}
          <View
            style={[styles.cobra, { backgroundColor: theme.surface, borderColor: theme.divider }]}
            accessible
            accessibilityLabel={
              efectivo
                ? `Cobra en efectivo ${formatSoles(tarifa)}. ${pasajero.nombre} paga al bajar del auto`
                : `Pagado con ${metodoPago} ${formatSoles(tarifa)}. No tienes que cobrar en efectivo`
            }
          >
            <Text style={[styles.k, { color: theme.textMuted }]}>
              {efectivo ? 'Cobra en efectivo' : `Pagado con ${metodoPago}`}
            </Text>
            <Text style={[Type.priceXL, { color: theme.text }]}>
              <Text style={Type.currency}>S/ </Text>
              {tarifa.toFixed(2)}
            </Text>
            <View style={styles.hint}>
              <Ionicons
                name={efectivo ? 'cash-outline' : 'phone-portrait-outline'}
                size={16}
                color={theme.textMuted}
              />
              <Text style={[Type.detail, { color: theme.textMuted }]}>
                {efectivo
                  ? `${pasajero.nombre} paga al bajar del auto`
                  : 'No tienes que cobrar nada en efectivo'}
              </Text>
            </View>
          </View>

          <View style={[styles.rows, { backgroundColor: theme.surface, borderColor: theme.divider }]}>
            <View style={styles.row}>
              <Text style={[styles.rowText, { color: theme.text }]}>Tarifa del viaje</Text>
              <Text style={[styles.rowVal, { color: theme.text }]}>{formatSoles(tarifa)}</Text>
            </View>
            <View style={[styles.row, styles.rowSep, { borderTopColor: theme.divider }]}>
              <Text style={[styles.rowText, { color: theme.text }]}>Comisión Run Pilot ({porcentaje} %)</Text>
              <Text style={[styles.rowVal, { color: theme.text }]}>{formatSoles(-comision)}</Text>
            </View>
            <View style={[styles.row, styles.rowSep, { borderTopColor: theme.divider }]}>
              <Text style={[styles.rowVal, { color: theme.text }]}>Tu ganancia</Text>
              <Text style={[styles.rowVal, styles.total, { color: theme.online }]}>{formatSoles(ganancia)}</Text>
            </View>
          </View>

          <Text style={[Type.detail, { color: theme.textMuted }]}>
            {efectivo
              ? 'La comisión se descuenta de tu billetera, no del efectivo que recibes.'
              : `Recibirás ${formatSoles(ganancia)} en tu billetera.`}
          </Text>

          {/* El boton repite el monto para evitar errores */}
          <AppButton
            label={efectivo ? `Cobré ${formatSoles(tarifa)}` : 'Continuar'}
            onPress={onFinalizar}
          />
          {efectivo && (
            <TouchableOpacity
              accessibilityRole="button"
              onPress={otroMetodo}
              style={styles.textBtn}
              activeOpacity={0.6}
            >
              <Text style={[Type.bodyStrong, styles.underline, { color: theme.textMuted }]}>
                Pagó con otro método
              </Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pad: { paddingHorizontal: 18 },
  gap: { gap: Spacing.lg },
  head: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm + 2 },
  okc: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cobra: {
    gap: Spacing.xs,
    paddingVertical: 18,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
  },
  k: { ...Type.label },
  hint: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rows: { borderRadius: BorderRadius.lg, borderWidth: 1 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: 14,
  },
  rowSep: { borderTopWidth: 1 },
  rowText: { flex: 1, ...Type.row },
  rowVal: { ...Type.label },
  total: { fontSize: Type.heading.fontSize, lineHeight: Type.heading.lineHeight },
  textBtn: { minHeight: Hit.min, alignItems: 'center', justifyContent: 'center' },
  underline: { textDecorationLine: 'underline' },
});
