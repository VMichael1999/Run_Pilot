import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader, AppSectionTitle, AvatarPasajero } from '@shared/components/ui';
import { haceTiempo, pluralViajes } from '@shared/utils/format';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, Type } from '@theme/fonts';
import { Spacing } from '@theme/spacing';
import { mockConductor } from '../data/mockConductor';
import { mockCalificaciones } from '../data/mockExperiencia';

function Estrellas({ n }: { n: number }) {
  const theme = useAppTheme();
  return (
    <View style={styles.stars} accessible accessibilityLabel={`${n} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons key={i} name={i <= n ? 'star' : 'star-outline'} size={12} color={i <= n ? theme.text : theme.divider} />
      ))}
    </View>
  );
}

export function ExperienciaScreen() {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const c = mockConductor;
  const ahora = Date.now();

  const kpis = [
    { valor: `${c.aceptacion} %`, label: 'aceptación' },
    { valor: `${c.cancelacion.toFixed(1)} %`, label: 'cancelación' },
    { valor: pluralViajes(c.totalViajes), label: 'en total' },
  ];

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <AppHeader title="Experiencia" />
      <ScrollView contentContainerStyle={[styles.pad, { paddingBottom: insets.bottom + Spacing['2xl'] }]}>
        <View accessible accessibilityLabel={`Tu calificación es ${c.calificacion.toFixed(2)} de 5`}>
          <Text style={[styles.k, { color: theme.textMuted }]}>Tu calificación</Text>
          <View style={styles.heroRow}>
            <Text style={[Type.hero, { color: theme.text }]}>{c.calificacion.toFixed(2)}</Text>
            <Ionicons name="star" size={28} color={theme.starFill} />
          </View>
        </View>

        <View style={[styles.kpis, { borderColor: theme.divider }]}>
          {kpis.map((k, i) => (
            <View
              key={k.label}
              style={[styles.kpi, i > 0 && [styles.kpiSep, { borderLeftColor: theme.divider }]]}
              accessible
              accessibilityLabel={`${k.valor} ${k.label}`}
            >
              <Text style={[styles.kpiVal, { color: theme.text }]} numberOfLines={1} adjustsFontSizeToFit>{k.valor}</Text>
              <Text style={[styles.kpiLbl, { color: theme.textMuted }]}>{k.label}</Text>
            </View>
          ))}
        </View>

        <View>
          <AppSectionTitle>Últimas calificaciones</AppSectionTitle>
          {mockCalificaciones.map((r) => (
            <View key={r.id} style={[styles.row, { borderBottomColor: theme.divider }]}>
              <AvatarPasajero nombre={r.nombre} apellido={r.apellido} size={36} />
              <View style={[styles.flex, styles.gap2]}>
                <View style={styles.rowTop}>
                  <Text style={[Type.name, { color: theme.text }]}>{r.nombre} {r.apellido.charAt(0)}.</Text>
                  <Text style={[Type.caption, { color: theme.textMuted }]}>{haceTiempo(ahora - r.haceMs, ahora)}</Text>
                </View>
                <Estrellas n={r.puntaje} />
                {r.comentario ? (
                  <Text style={[Type.detail, { color: theme.text }]}>{r.comentario}</Text>
                ) : null}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gap2: { gap: 3 },
  pad: { paddingHorizontal: 18, paddingTop: Spacing.xs, gap: Spacing.lg },
  k: { ...Type.section },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  kpis: { flexDirection: 'row', borderTopWidth: 1, borderBottomWidth: 1 },
  kpi: { flex: 1, paddingVertical: Spacing.sm + 2, paddingRight: 6 },
  kpiSep: { paddingLeft: Spacing.sm + 2, borderLeftWidth: 1 },
  kpiVal: { ...Type.kpi },
  kpiLbl: { ...Type.kpiLabel },
  stars: { flexDirection: 'row', gap: 2 },
  row: { flexDirection: 'row', gap: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.sm },
});
