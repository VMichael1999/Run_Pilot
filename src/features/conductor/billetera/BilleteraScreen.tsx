import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ConductorStackParamList } from '@navigation/types';
import { AppHeader } from '@shared/components/ui/AppHeader';
import { Colors } from '@theme/colors';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing, BorderRadius, Shadow } from '@theme/spacing';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

type Props = NativeStackScreenProps<ConductorStackParamList, 'Billetera'>;

interface Movimiento {
  id: string;
  concepto: string;
  monto: number;
  fecha: string;
  detalle?: string;
}

const SALDO_MOCK = 120907.0;

const MOVIMIENTOS_MOCK: Movimiento[] = [
  { id: '1', concepto: 'Cobro diario',          monto: -10.0, fecha: '03 May 2026, 08:00' },
  { id: '2', concepto: 'Cobro diario',          monto: -10.0, fecha: '02 May 2026, 08:00' },
  { id: '3', concepto: 'Cobro diario',          monto: -10.0, fecha: '01 May 2026, 08:00' },
  { id: '4', concepto: 'Servicio #5589',        monto: -1.1,  fecha: '01 May 2026, 14:32', detalle: 'Comision por servicio completado' },
  { id: '5', concepto: 'Billetera Servicio #5589', monto: 3.5, fecha: '01 May 2026, 14:30', detalle: 'Pago recibido del pasajero' },
  { id: '6', concepto: 'Cobro diario',          monto: -10.0, fecha: '30 Abr 2026, 08:00' },
  { id: '7', concepto: 'Cobro diario',          monto: -10.0, fecha: '29 Abr 2026, 08:00' },
  { id: '8', concepto: 'Cobro diario',          monto: -10.0, fecha: '28 Abr 2026, 08:00' },
];

function MovimientoItem({ item }: { item: Movimiento }) {
  const [expandido, setExpandido] = useState(false);
  const esNegativo = item.monto < 0;

  const toggleExpandido = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandido((prev) => !prev);
  };

  return (
    <TouchableOpacity style={styles.movCard} onPress={toggleExpandido} activeOpacity={0.8}>
      <View style={styles.movRow}>
        <Ionicons
          name={expandido ? 'chevron-down' : 'chevron-forward'}
          size={16}
          color={Colors.textSecondary}
          style={styles.movChevron}
        />
        <Text style={styles.movConcepto}>{item.concepto}</Text>
        <Text style={[styles.movMonto, esNegativo ? styles.montoNegativo : styles.montoPositivo]}>
          S/ {item.monto > 0 ? '' : ''}{Math.abs(item.monto).toFixed(2)}
          {esNegativo ? '' : ''}
        </Text>
      </View>
      {expandido && (
        <View style={styles.movDetalle}>
          <View style={styles.movDetalleRow}>
            <Text style={styles.movDetalleLabel}>Fecha</Text>
            <Text style={styles.movDetalleValor}>{item.fecha}</Text>
          </View>
          <View style={styles.movDetalleRow}>
            <Text style={styles.movDetalleLabel}>Monto</Text>
            <Text style={[styles.movDetalleValor, esNegativo ? styles.montoNegativo : styles.montoPositivo]}>
              S/ {item.monto.toFixed(2)}
            </Text>
          </View>
          {item.detalle ? (
            <View style={styles.movDetalleRow}>
              <Text style={styles.movDetalleLabel}>Detalle</Text>
              <Text style={styles.movDetalleValor}>{item.detalle}</Text>
            </View>
          ) : null}
        </View>
      )}
    </TouchableOpacity>
  );
}

export function BilleteraScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <AppHeader
        title="Billetera"
        onBack={() => navigation.goBack()}
        right={
          <TouchableOpacity style={styles.addBtn} activeOpacity={0.7}>
            <Ionicons name="add" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        }
      />

      <FlatList
        data={MOVIMIENTOS_MOCK}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.lista}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.xs }} />}
        ListHeaderComponent={
          <>
            <View style={styles.saldoCard}>
              <Text style={styles.saldoMonto}>S/ {SALDO_MOCK.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</Text>
            </View>
            <Text style={styles.seccionLabel}>Movimientos</Text>
          </>
        }
        renderItem={({ item }) => <MovimientoItem item={item} />}
        ListEmptyComponent={
          <View style={styles.vacio}>
            <Ionicons name="wallet-outline" size={48} color={Colors.textDisabled} />
            <Text style={styles.vacioText}>Sin movimientos</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundLight },
  addBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lista: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing['3xl'] },
  saldoCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    marginVertical: Spacing.lg,
    ...Shadow.sm,
  },
  saldoMonto: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['4xl'],
    color: Colors.textPrimary,
  },
  seccionLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    letterSpacing: 0.3,
  },
  movCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  movRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  movChevron: { marginRight: Spacing.sm },
  movConcepto: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  movMonto: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
  },
  montoNegativo: { color: Colors.error },
  montoPositivo: { color: Colors.textPrimary },
  movDetalle: {
    backgroundColor: '#f9f9f9',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.divider,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  movDetalleRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  movDetalleLabel: {
    width: 60,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  movDetalleValor: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
  },
  vacio: {
    alignItems: 'center',
    marginTop: Spacing['4xl'],
    gap: Spacing.md,
  },
  vacioText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
});
