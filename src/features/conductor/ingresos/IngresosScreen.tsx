import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '@shared/components/ui/AppHeader';
import { useConductorStore } from '@store/useConductorStore';
import { Colors } from '@theme/colors';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing, BorderRadius, Shadow } from '@theme/spacing';

type Tab = 'HOY' | 'SEMANAL';

const { width: SW } = Dimensions.get('window');

const DIAS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const DATOS_SEMANA = [38, 62, 45, 80, 95, 120, 55];
const HOY_IDX = 4; // Viernes (activo)
const MAX_BARRA = Math.max(...DATOS_SEMANA);
const BARRA_MAX_H = 110;

const DESGLOSE = [
  { label: 'Tarifas de viaje',  valor: 432.0  },
  { label: 'Fee de servicio',   valor: -32.4  },
  { label: '+Impuesto',         valor: 18.6   },
  { label: '+Peajes',           valor: 5.0    },
  { label: 'Descuento',         valor: -10.0  },
];

function BarraChart({ hoyIngresos }: { hoyIngresos: number }) {
  const datos = [...DATOS_SEMANA];
  datos[HOY_IDX] = Math.max(datos[HOY_IDX], hoyIngresos > 0 ? hoyIngresos : datos[HOY_IDX]);

  return (
    <View style={styles.chart}>
      {datos.map((val, i) => {
        const isHoy    = i === HOY_IDX;
        const barH     = Math.max(8, (val / MAX_BARRA) * BARRA_MAX_H);
        return (
          <View key={i} style={styles.barCol}>
            {isHoy && (
              <Text style={styles.barValor}>S/{val}</Text>
            )}
            <View
              style={[
                styles.barra,
                { height: barH },
                isHoy ? styles.barraHoy : styles.barraNormal,
              ]}
            />
            <Text style={[styles.barDia, isHoy && styles.barDiaHoy]}>{DIAS[i]}</Text>
          </View>
        );
      })}
    </View>
  );
}

export function IngresosScreen() {
  const ingresosDia = useConductorStore((s) => s.ingresosDia);
  const [tab, setTab] = useState<Tab>('HOY');

  const totalSemana  = 413.2;
  const horasOnline  = '38:30';
  const totalViajes  = 45;

  return (
    <View style={styles.container}>
      <AppHeader title="Ganancias" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Tabs */}
        <View style={styles.tabs}>
          {(['HOY', 'SEMANAL'] as Tab[]).map((t) => (
            <TouchableOpacity key={t} style={styles.tabItem} onPress={() => setTab(t)}>
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
              {tab === t && <View style={styles.tabUnderline} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Balance principal */}
        <View style={styles.balanceSection}>
          {tab === 'HOY' ? (
            <>
              <Text style={styles.balanceLabel}>HOY</Text>
              <Text style={styles.balanceAmount}>S/ {ingresosDia.toFixed(2)}</Text>
              <View style={styles.balanceRow}>
                <Ionicons name="car-outline" size={14} color={Colors.textSecondary} />
                <Text style={styles.balanceSub}>
                  {ingresosDia > 0 ? '-- viajes' : 'Sin viajes hoy'}
                </Text>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.balanceLabel}>ESTA SEMANA</Text>
              <Text style={styles.balanceAmount}>S/ {totalSemana.toFixed(2)}</Text>
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaVal}>{horasOnline}</Text>
                  <Text style={styles.metaLbl}>Horas online</Text>
                </View>
                <View style={styles.metaSep} />
                <View style={styles.metaItem}>
                  <Text style={styles.metaVal}>{totalViajes}</Text>
                  <Text style={styles.metaLbl}>Viajes</Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Bar chart (solo en SEMANAL) */}
        {tab === 'SEMANAL' && (
          <View style={styles.chartCard}>
            <BarraChart hoyIngresos={ingresosDia} />
          </View>
        )}

        {/* Desglose */}
        <View style={styles.desgloseCard}>
          <Text style={styles.seccionLabel}>DESGLOSE</Text>
          {DESGLOSE.map((row) => (
            <View key={row.label} style={styles.desgloseRow}>
              <Text style={styles.desgloseLabel}>{row.label}</Text>
              <Text style={[styles.desgloseValor, row.valor < 0 && styles.desgloseNeg]}>
                {row.valor < 0 ? '-' : '+'}S/ {Math.abs(row.valor).toFixed(2)}
              </Text>
            </View>
          ))}
          <View style={styles.desgloseSep} />
          <View style={styles.desgloseRow}>
            <Text style={styles.totalLabel}>Total ganancias</Text>
            <Text style={styles.totalValor}>
              S/ {(tab === 'HOY' ? ingresosDia : totalSemana).toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={{ height: Spacing['3xl'] }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundLight },

  /* Tabs */
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    ...Shadow.sm,
  },
  tabItem: {
    paddingVertical: Spacing.md,
    marginRight: Spacing.xl,
    alignItems: 'center',
  },
  tabText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    letterSpacing: 0.6,
  },
  tabTextActive: { color: Colors.primary },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.warning,
  },

  /* Balance */
  balanceSection: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing['2xl'],
  },
  balanceLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 1.2,
    marginBottom: Spacing.xs,
  },
  balanceAmount: {
    fontFamily: FontFamily.bold,
    fontSize: 44,
    color: Colors.white,
    letterSpacing: -1,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: Spacing.xs,
  },
  balanceSub: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.6)',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    gap: Spacing.lg,
  },
  metaItem: { alignItems: 'flex-start' },
  metaVal: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.white,
  },
  metaLbl: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 2,
  },
  metaSep: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  /* Bar chart */
  chartCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadow.sm,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: BARRA_MAX_H + 40,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing.xs,
  },
  barValor: {
    fontFamily: FontFamily.bold,
    fontSize: 9,
    color: Colors.warning,
    marginBottom: 2,
  },
  barra: {
    width: '65%',
    borderRadius: 4,
  },
  barraNormal: {
    backgroundColor: Colors.primary,
    opacity: 0.55,
  },
  barraHoy: {
    backgroundColor: Colors.warning,
    opacity: 1,
  },
  barDia: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  barDiaHoy: {
    fontFamily: FontFamily.bold,
    color: Colors.warning,
  },

  /* Desglose */
  desgloseCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadow.sm,
  },
  seccionLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  desgloseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  desgloseLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  desgloseValor: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  desgloseNeg: { color: Colors.error },
  desgloseSep: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: Spacing.sm,
  },
  totalLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  totalValor: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.warning,
  },

  /* KPI grid */
  kpiGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 4,
    ...Shadow.sm,
  },
  kpiVal: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  kpiLbl: {
    fontFamily: FontFamily.regular,
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
