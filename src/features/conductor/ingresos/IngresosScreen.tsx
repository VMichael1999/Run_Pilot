import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useConductorStore } from '@store/useConductorStore';
import { AppButton, AppHeader, AppSectionTitle, Segmented } from '@shared/components/ui';
import { formatSoles, pluralViajes } from '@shared/utils/format';
import { fechaCorta, nombreMes, rangoSemana } from '@shared/utils/fecha';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, Type } from '@theme/fonts';
import { Spacing } from '@theme/spacing';
import { Duration } from '@theme/motion';
import { mockConductor } from '../data/mockConductor';
import { BarChart } from './components/BarChart';
import { MovRow } from './components/MovRow';
import { periodoHoy, periodoMes, periodoSemana, viajesConGanancia } from './resumen';

type Rango = 'hoy' | 'semana' | 'mes';

const OPCIONES: { value: Rango; label: string }[] = [
  { value: 'hoy', label: 'Hoy' },
  { value: 'semana', label: 'Semana' },
  { value: 'mes', label: 'Mes' },
];

export function IngresosScreen() {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const navigation = useNavigation();
  const historial = useConductorStore((s) => s.historial);
  const [rango, setRango] = useState<Rango>('semana');

  const viajes = useMemo(() => viajesConGanancia(historial, mockConductor.comision), [historial]);
  const p = useMemo(
    () => (rango === 'hoy' ? periodoHoy(viajes) : rango === 'semana' ? periodoSemana(viajes) : periodoMes(viajes)),
    [rango, viajes],
  );

  const subtitulo =
    rango === 'hoy' ? `Hoy · ${pluralViajes(p.viajes)}` :
    rango === 'semana' ? `${rangoSemana()} · ${pluralViajes(p.viajes)}` :
    `${nombreMes()} · ${pluralViajes(p.viajes)}`;

  const kpis = [
    { valor: `${p.horas} h`, label: 'conectado' },
    { valor: p.horas > 0 ? formatSoles(p.total / p.horas) : '—', label: 'por hora' },
    { valor: p.viajes > 0 ? formatSoles(p.total / p.viajes) : '—', label: 'por viaje' },
  ];

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <AppHeader title="Ingresos" />
      <ScrollView contentContainerStyle={[styles.pad, { paddingBottom: insets.bottom + Spacing['2xl'] }]}>
        <Segmented options={OPCIONES} value={rango} onChange={setRango} />

        <Animated.View key={rango} entering={FadeIn.duration(Duration.base)} style={styles.gap}>
          <View style={styles.hero} accessible accessibilityLabel={`Ganaste ${formatSoles(p.total)}. ${subtitulo}`}>
            <Text style={[Type.hero, { color: theme.text }]}>{formatSoles(p.total)}</Text>
            <Text style={[styles.heroSub, { color: theme.textMuted }]}>{subtitulo}</Text>
          </View>

          {p.barras.length > 0 && <BarChart barras={p.barras} />}

          <View style={[styles.kpis, { borderColor: theme.divider }]}>
            {kpis.map((k, i) => (
              <View
                key={k.label}
                style={[styles.kpi, i > 0 && [styles.kpiSep, { borderLeftColor: theme.divider }]]}
                accessible
                accessibilityLabel={`${k.valor} ${k.label}`}
              >
                <Text style={[styles.kpiVal, { color: theme.text }]} numberOfLines={1} adjustsFontSizeToFit>
                  {k.valor}
                </Text>
                <Text style={[styles.kpiLbl, { color: theme.textMuted }]}>{k.label}</Text>
              </View>
            ))}
          </View>

          {p.lista.length > 0 ? (
            <View>
              <AppSectionTitle>Viajes de hoy</AppSectionTitle>
              {p.lista.map((v) => (
                <MovRow
                  key={v.id}
                  titulo={v.ruta}
                  detalle={`${fechaCorta(v.fechaMs)} · ${v.efectivo ? 'efectivo' : 'digital'}`}
                  monto={v.ganancia}
                />
              ))}
            </View>
          ) : (
            <View style={styles.empty}>
              <Text style={[Type.heading, { color: theme.text }]}>Aún no tienes viajes hoy</Text>
              <Text style={[Type.detail, { color: theme.textMuted }]}>
                Conéctate desde el inicio para empezar a recibir solicitudes.
              </Text>
              <AppButton label="Ir al inicio" variant="ghost" size="md" onPress={() => navigation.goBack()} />
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pad: { paddingHorizontal: 18, paddingTop: Spacing.xs, gap: Spacing.lg },
  gap: { gap: Spacing.lg },
  hero: { gap: Spacing.xxs },
  heroSub: { fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 18 },
  kpis: { flexDirection: 'row', borderTopWidth: 1, borderBottomWidth: 1 },
  kpi: { flex: 1, paddingVertical: Spacing.sm + 2, paddingRight: 6 },
  kpiSep: { paddingLeft: Spacing.sm + 2, borderLeftWidth: 1 },
  kpiVal: { fontFamily: FontFamily.bold, fontSize: 17, lineHeight: 22 },
  kpiLbl: { fontFamily: FontFamily.regular, fontSize: 11.5, lineHeight: 15 },
  empty: { gap: Spacing.sm, paddingTop: Spacing.sm },
});
