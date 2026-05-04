import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ConductorStackParamList } from '@navigation/types';
import { AppHeader } from '@shared/components/ui/AppHeader';
import { Colors } from '@theme/colors';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing, BorderRadius, Shadow } from '@theme/spacing';

type Props = NativeStackScreenProps<ConductorStackParamList, 'ServiciosProgramados'>;

type EstadoServicio = 'ACEPTADO' | 'PENDIENTE' | 'COMPLETADO';

interface ServicioProgramado {
  id: string;
  origen: string;
  destino: string;
  fecha: string;
  estado: EstadoServicio;
}

const MOCK_SERVICIOS: ServicioProgramado[] = [
  {
    id: '1',
    origen:  'Granadillas, La Molina, Peru',
    destino: 'Av. Circunvalacion del Golf los Incas 134, Santiago de Surco',
    fecha:   '24/4/2026 12:51 p. m.',
    estado:  'ACEPTADO',
  },
  {
    id: '2',
    origen:  'Av. Javier Prado Este 4200, San Borja',
    destino: 'Aeropuerto Internacional Jorge Chavez',
    fecha:   '25/4/2026 08:00 a. m.',
    estado:  'PENDIENTE',
  },
];

const ESTADO_COLORES: Record<EstadoServicio, string> = {
  ACEPTADO:   Colors.success,
  PENDIENTE:  Colors.warning,
  COMPLETADO: Colors.textSecondary,
};

function ServicioItem({ item }: { item: ServicioProgramado }) {
  return (
    <View style={styles.card}>
      <View style={styles.ruta}>
        <View style={styles.rutaLeft}>
          <View style={styles.dotOrigen} />
          <View style={styles.rutaLinea} />
          <View style={styles.dotDestino} />
        </View>
        <View style={styles.rutaTextos}>
          <Text style={styles.rutaDireccion} numberOfLines={1}>
            {item.origen}
          </Text>
          <View style={{ height: Spacing.md }} />
          <Text style={styles.rutaDireccion} numberOfLines={1}>
            {item.destino}
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
        <Text style={styles.fechaText}>{item.fecha}</Text>
        <TouchableOpacity style={styles.estadoChip} activeOpacity={0.8}>
          <Text style={[styles.estadoText, { color: ESTADO_COLORES[item.estado] }]}>
            {item.estado}
          </Text>
          <Ionicons name="chevron-forward" size={13} color={ESTADO_COLORES[item.estado]} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function ServiciosProgramadosScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <AppHeader title="Servicios Programados" onBack={() => navigation.goBack()} />

      <FlatList
        data={MOCK_SERVICIOS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.lista}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
        renderItem={({ item }) => <ServicioItem item={item} />}
        ListEmptyComponent={
          <View style={styles.vacio}>
            <Ionicons name="calendar-outline" size={48} color={Colors.textDisabled} />
            <Text style={styles.vacioText}>Sin servicios programados</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundLight },
  lista: { padding: Spacing.lg },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadow.sm,
  },
  ruta: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  rutaLeft: {
    alignItems: 'center',
    paddingTop: 3,
  },
  dotOrigen: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.success,
  },
  rutaLinea: {
    width: 2,
    flex: 1,
    backgroundColor: '#C1C0C8',
    marginVertical: 3,
    minHeight: 20,
  },
  dotDestino: {
    width: 12,
    height: 12,
    borderRadius: 2,
    backgroundColor: Colors.error,
  },
  rutaTextos: { flex: 1, justifyContent: 'space-between' },
  rutaDireccion: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.divider,
    paddingTop: Spacing.sm,
  },
  fechaText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  estadoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  estadoText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
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
