import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { ConductorStackParamList } from '@navigation/types';
import { mockSolicitudes } from '../data/mockSolicitudes';
import type { Solicitud } from '../types';
import { AppButton, AppHeader, RouteStops, Tag } from '@shared/components/ui';
import { esEfectivo } from '@shared/utils/cobro';
import { formatSoles } from '@shared/utils/format';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, Type } from '@theme/fonts';
import { BorderRadius, Spacing } from '@theme/spacing';

type Nav = NativeStackNavigationProp<ConductorStackParamList>;

/** Tarjeta resumida: precio y recojo se leen primero; aceptar se hace en el detalle. */
function SolicitudCard({ item, onAbrir }: { item: Solicitud; onAbrir: () => void }) {
  const theme = useAppTheme();
  const origen = item.paradas.find((p) => p.esOrigen);
  const destino = item.paradas.find((p) => !p.esOrigen);
  const recojo = [
    origen?.duracionMin ? `Recojo a ${origen.duracionMin} min` : undefined,
    origen?.distanciaKm ? `${origen.distanciaKm} km` : undefined,
  ].filter(Boolean).join(' · ');
  const { pasajero } = item;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${formatSoles(item.precio)}, ${item.metodoPago}. ${recojo}. Desde ${origen?.direccion} hasta ${destino?.direccion}. ${pasajero.nombre}. Ver solicitud`}
      onPress={onAbrir}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.surface, borderColor: theme.divider },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.top}>
        <Text style={[styles.precio, { color: theme.text }]}>{formatSoles(item.precio)}</Text>
        <Tag label={item.metodoPago} tone={esEfectivo(item.metodoPago) ? 'cash' : 'digital'} />
      </View>
      {recojo ? <Text style={[styles.eta, { color: theme.text }]}>{recojo}</Text> : null}
      {origen && destino && (
        <RouteStops origen={{ direccion: origen.direccion }} destino={{ direccion: destino.direccion }} />
      )}
      <View style={styles.bottom}>
        <View style={styles.pax}>
          <Ionicons name="star" size={12} color={theme.textMuted} />
          <Text style={[Type.detail, { color: theme.textMuted }]}>
            {pasajero.nombre} {pasajero.apellido.charAt(0)}. · {pasajero.calificacion.toFixed(1)}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
      </View>
      {item.comentario ? (
        <View style={[styles.nota, { backgroundColor: theme.background }]}>
          <Ionicons name="chatbox-outline" size={14} color={theme.textMuted} />
          <Text style={[Type.detail, styles.flex, { color: theme.text }]}>{item.comentario}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export function SolicitudesScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const solicitudes = mockSolicitudes;

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <AppHeader title="Tablero de solicitudes" />
      <FlatList
        data={solicitudes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + Spacing['2xl'] }]}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
        ListHeaderComponent={
          solicitudes.length > 0 ? (
            <Text style={[styles.sub, { color: theme.textMuted }]}>
              {solicitudes.length === 1 ? '1 solicitud cerca de ti' : `${solicitudes.length} solicitudes cerca de ti`}
            </Text>
          ) : null
        }
        renderItem={({ item }) => (
          <SolicitudCard
            item={item}
            onAbrir={() => navigation.navigate('SolicitudDetalle', { solicitudId: item.id })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[Type.heading, { color: theme.text }]}>No hay solicitudes cerca por ahora</Text>
            <Text style={[Type.detail, { color: theme.textMuted }]}>
              Conéctate desde el inicio y te avisaremos cuando llegue una.
            </Text>
            <AppButton label="Ir al inicio" variant="ghost" size="md" onPress={() => navigation.goBack()} />
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { paddingHorizontal: 18 },
  sub: { ...Type.section, marginBottom: Spacing.md, marginTop: Spacing.xs },
  card: { borderRadius: BorderRadius.lg, borderWidth: 1, padding: 14, gap: Spacing.sm + 2 },
  pressed: { opacity: 0.7 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  precio: { ...Type.priceCard },
  eta: { ...Type.label },
  bottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pax: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  nota: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
  },
  empty: { gap: Spacing.sm, paddingTop: Spacing.xl },
});
