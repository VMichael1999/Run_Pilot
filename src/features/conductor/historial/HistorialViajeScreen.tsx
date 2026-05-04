import React, { useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ConductorStackParamList } from '@navigation/types';
import type { ViajeCompletado } from '@features/conductor/types';
import { useConductorStore } from '@store/useConductorStore';
import { AvatarPasajero } from '@shared/components/ui/AvatarPasajero';
import { Colors } from '@theme/colors';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing, BorderRadius, Shadow } from '@theme/spacing';

type Props = NativeStackScreenProps<ConductorStackParamList, 'HistorialViaje'>;

/* ── Helpers ── */
function formatHora(ms: number): string {
  return new Date(ms).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
}

function seccionFecha(ms: number): string {
  const hoy   = new Date();
  const fecha = new Date(ms);
  const diffDias = Math.floor(
    (new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).getTime() -
     new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()).getTime()) /
    86_400_000
  );
  if (diffDias === 0) return 'Hoy';
  if (diffDias === 1) return 'Ayer';
  return fecha.toLocaleDateString('es-PE', { weekday: 'long', day: '2-digit', month: 'long' });
}

interface Seccion {
  titulo: string;
  data: ViajeCompletado[];
}

function agruparPorFecha(historial: ViajeCompletado[]): Seccion[] {
  const mapa: Record<string, ViajeCompletado[]> = {};
  for (const v of historial) {
    const key = seccionFecha(v.fechaMs);
    if (!mapa[key]) mapa[key] = [];
    mapa[key].push(v);
  }
  return Object.entries(mapa).map(([titulo, data]) => ({ titulo, data }));
}

/* ── Item de viaje ── */
function ViajeCard({
  viaje,
  onPress,
}: {
  viaje: ViajeCompletado;
  onPress: () => void;
}) {
  const { solicitud, fechaMs, calificacion } = viaje;
  const { pasajero, paradas, precio, simboloMoneda, metodoPago } = solicitud;
  const origen  = paradas.find((p) => p.esOrigen);
  const destino = paradas.find((p) => !p.esOrigen);

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.75} onPress={onPress}>
      {/* Avatar */}
      <AvatarPasajero fotoUrl={pasajero.fotoUrl} size={50} />

      {/* Info centro */}
      <View style={styles.cardInfo}>
        <View style={styles.cardTopRow}>
          <Text style={styles.cardNombre} numberOfLines={1}>
            {pasajero.nombre} {pasajero.apellido}
          </Text>
          <Text style={styles.cardMonto}>{simboloMoneda} {precio.toFixed(2)}</Text>
        </View>

        <Text style={styles.cardRuta} numberOfLines={1}>
          {origen?.direccion?.split(',')[0]} → {destino?.direccion?.split(',')[0]}
        </Text>

        <View style={styles.cardBottomRow}>
          {/* Hora + metodo */}
          <View style={styles.cardMeta}>
            <Ionicons name="time-outline" size={11} color={Colors.textSecondary} />
            <Text style={styles.cardMetaText}>{formatHora(fechaMs)}</Text>
            <Text style={styles.cardMetaSep}>·</Text>
            <Text style={styles.cardMetaText}>{metodoPago}</Text>
          </View>
          {/* Estrellas */}
          <View style={styles.starsRow}>
            {calificacion > 0
              ? [1,2,3,4,5].map((i) => (
                  <Ionicons
                    key={i}
                    name={i <= calificacion ? 'star' : 'star-outline'}
                    size={11}
                    color={Colors.warning}
                  />
                ))
              : <Text style={styles.sinCalif}>Sin calificar</Text>
            }
          </View>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={14} color={Colors.textSecondary} style={{ marginLeft: 2 }} />
    </TouchableOpacity>
  );
}

/* ── Pantalla principal ── */
export function HistorialViajeScreen({ navigation }: Props) {
  const insets   = useSafeAreaInsets();
  const historial = useConductorStore((s) => s.historial);

  const secciones = useMemo(() => agruparPorFecha(historial), [historial]);

  const totalViajes   = historial.length;
  const totalGanado   = historial.reduce((sum, v) => sum + v.solicitud.precio, 0);

  /* FlatList data: mezcla de cabeceras de seccion e items */
  type FlatItem =
    | { type: 'header'; titulo: string }
    | { type: 'item';   viaje: ViajeCompletado };

  const flatData: FlatItem[] = useMemo(() => {
    const items: FlatItem[] = [];
    for (const sec of secciones) {
      items.push({ type: 'header', titulo: sec.titulo });
      for (const v of sec.data) items.push({ type: 'item', viaje: v });
    }
    return items;
  }, [secciones]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historial de viajes</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{totalViajes}</Text>
          <Text style={styles.statLbl}>Viajes</Text>
        </View>
        <View style={styles.statSep} />
        <View style={styles.statItem}>
          <Text style={styles.statNum}>S/ {totalGanado.toFixed(2)}</Text>
          <Text style={styles.statLbl}>Total ganado</Text>
        </View>
        <View style={styles.statSep} />
        <View style={styles.statItem}>
          <Text style={styles.statNum}>
            {totalViajes > 0
              ? (historial.filter((v) => v.calificacion > 0).reduce((s, v) => s + v.calificacion, 0) /
                 Math.max(1, historial.filter((v) => v.calificacion > 0).length)).toFixed(1)
              : '--'}
          </Text>
          <Text style={styles.statLbl}>Calificacion</Text>
        </View>
      </View>

      {/* ── Lista ── */}
      <View style={styles.body}>
        <FlatList
          data={flatData}
          keyExtractor={(item, i) =>
            item.type === 'header' ? `hdr-${item.titulo}` : `viaje-${item.viaje.id}-${i}`
          }
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            if (item.type === 'header') {
              return (
                <View style={styles.seccionHeader}>
                  <Text style={styles.seccionTitulo}>{item.titulo}</Text>
                </View>
              );
            }
            return (
              <ViajeCard
                viaje={item.viaje}
                onPress={() => navigation.navigate('HistorialDetalle', { viajeId: item.viaje.id })}
              />
            );
          }}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
          ListEmptyComponent={
            <View style={styles.vacio}>
              <Ionicons name="car-outline" size={52} color={Colors.textDisabled} />
              <Text style={styles.vacioTitulo}>Sin viajes aun</Text>
              <Text style={styles.vacioSub}>Tus viajes completados apareceran aqui</Text>
            </View>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.primary },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Colors.white,
    textAlign: 'center',
  },

  /* Stats */
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['3xl'],
  },
  statItem: { alignItems: 'center', gap: 3 },
  statNum: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['2xl'],
    color: Colors.white,
    letterSpacing: -0.5,
  },
  statLbl: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.55)',
  },
  statSep: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },

  /* Body */
  body: {
    flex: 1,
    backgroundColor: '#f4f6f9',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
    overflow: 'hidden',
  },
  lista: {
    padding: Spacing.lg,
    paddingBottom: Spacing['4xl'],
  },

  /* Seccion */
  seccionHeader: {
    paddingVertical: Spacing.sm,
    paddingTop: Spacing.md,
  },
  seccionTitulo: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  /* Card */
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    gap: Spacing.md,
    ...Shadow.sm,
  },
  cardInfo: { flex: 1 },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  cardNombre: {
    flex: 1,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    marginRight: Spacing.sm,
  },
  cardMonto: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.success,
  },
  cardRuta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginBottom: 5,
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  cardMetaText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  cardMetaSep: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  sinCalif: {
    fontFamily: FontFamily.regular,
    fontSize: 10,
    color: Colors.textDisabled,
  },

  /* Vacio */
  vacio: {
    alignItems: 'center',
    marginTop: Spacing['5xl'],
    gap: Spacing.sm,
  },
  vacioTitulo: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  vacioSub: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textDisabled,
    textAlign: 'center',
  },
});
