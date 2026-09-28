import React from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { EntradaHistorial } from '../agrupar';
import { separarParadas } from '../agrupar';
import { AvatarPasajero, RouteStops } from '@shared/components/ui';
import { TEXTO_MOTIVO } from '@features/conductor/viaje/cancelacion';
import { desgloseCobro } from '@shared/utils/cobro';
import { hora } from '@shared/utils/fecha';
import { formatSoles } from '@shared/utils/format';
import { useAppTheme } from '@theme/useAppTheme';
import { Type } from '@theme/fonts';
import { BorderRadius, Hit, Spacing, Shadow } from '@theme/spacing';

interface Props {
  entrada: EntradaHistorial;
  comision: number;
  onAbrir: () => void;
  onMenu: () => void;
}

/** Tarjeta de un viaje en el historial: pasajero, ruta completa, ganancia y estado. */
export function TarjetaHistorial({ entrada, comision, onAbrir, onMenu }: Props) {
  const theme = useAppTheme();
  const cancelado = entrada.tipo === 'cancelado';
  const solicitud = cancelado ? entrada.cancelacion.solicitud : entrada.viaje.solicitud;
  const calificacion = cancelado ? null : entrada.viaje.calificacion;
  const { pasajero, metodoPago, precio } = solicitud;
  const { origen, intermedias, destino } = separarParadas(solicitud.paradas);
  const ganancia = desgloseCobro(precio, comision).ganancia;
  const nombre = `${pasajero.nombre} ${pasajero.apellido}`;
  const pendiente = calificacion === 0;

  const resumen = cancelado
    ? `${hora(entrada.fechaMs)}, viaje cancelado con ${nombre}. ${TEXTO_MOTIVO[entrada.cancelacion.motivo]}`
    : `${hora(entrada.fechaMs)}, ${nombre}, ${metodoPago}. Ganaste ${formatSoles(ganancia)}, cobrado ${formatSoles(precio)}. ${
        pendiente ? 'Sin calificar' : `Le diste ${calificacion}`
      }. Ver detalle`;

  const contenido = (
    <>
      <View style={styles.top}>
        <Text style={[Type.smallStrong, { color: theme.text }]}>{hora(entrada.fechaMs)}</Text>
      </View>

      <View style={styles.pax}>
        <AvatarPasajero fotoUrl={pasajero.fotoUrl} nombre={pasajero.nombre} apellido={pasajero.apellido} size={44} />
        <View style={styles.flex}>
          <Text style={[Type.label, styles.nombre, { color: theme.text }]} numberOfLines={1}>{nombre}</Text>
          <View style={styles.meta}>
            <Text style={[Type.caption, { color: theme.textMuted }]}>{metodoPago}</Text>
            {calificacion !== null && (
              pendiente ? (
                <View style={[styles.pill, { backgroundColor: theme.signal }]}>
                  <Text style={[Type.tag, { color: theme.onSignal }]}>Sin calificar</Text>
                </View>
              ) : (
                <View style={styles.meta}>
                  <Text style={[Type.caption, { color: theme.textMuted }]}>·</Text>
                  <Ionicons name="star" size={11} color={theme.textMuted} />
                  <Text style={[Type.caption, { color: theme.textMuted }]}>Le diste {calificacion}</Text>
                </View>
              )
            )}
          </View>
        </View>
      </View>

      {origen && destino && (
        <RouteStops
          conEtiquetas
          origen={{ direccion: origen.direccion }}
          intermedias={intermedias.map((p) => ({ direccion: p.direccion }))}
          destino={{ direccion: destino.direccion }}
        />
      )}

      <View style={[styles.sep, { backgroundColor: theme.divider }]} />

      <View style={styles.pie}>
        {cancelado ? (
          <View style={styles.flex}>
            <Text style={[Type.label, { color: theme.text }]}>{TEXTO_MOTIVO[entrada.cancelacion.motivo]}</Text>
            <Text style={[Type.caption, { color: theme.textMuted }]}>Sin ganancia</Text>
          </View>
        ) : (
          <View style={styles.flex}>
            <Text style={[Type.kpi, { color: theme.text }]}>{formatSoles(ganancia)}</Text>
            <Text style={[Type.caption, { color: theme.textMuted }]}>cobrado {formatSoles(precio)}</Text>
          </View>
        )}
        <View style={[styles.estado, { backgroundColor: cancelado ? theme.dangerSoft : theme.onlineSoft }]}>
          <Text style={[Type.tag, { color: cancelado ? theme.danger : theme.online }]}>
            {cancelado ? 'Cancelado' : 'Completado'}
          </Text>
        </View>
      </View>
    </>
  );

  return (
    <View style={[styles.card, { backgroundColor: theme.surface }]}>
      {cancelado ? (
        // Un cancelado no tiene detalle ni acciones: solo se lee
        <View accessible accessibilityLabel={resumen} style={styles.body}>{contenido}</View>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={resumen}
          onPress={onAbrir}
          style={({ pressed }) => [styles.body, pressed && styles.pressed]}
        >
          {contenido}
        </Pressable>
      )}
      {!cancelado && (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`Más opciones del viaje con ${pasajero.nombre}`}
          onPress={onMenu}
          style={styles.menu}
        >
          <Ionicons name="ellipsis-vertical" size={20} color={theme.text} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: BorderRadius.lg, ...Shadow.sm },
  body: { padding: Spacing.lg, gap: 14 },
  pressed: { opacity: 0.7 },
  flex: { flex: 1, gap: 2 },
  top: { minHeight: 24, justifyContent: 'center', paddingRight: Hit.min - Spacing.lg },
  pax: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  nombre: { fontSize: 16, lineHeight: 21 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs + 2, flexWrap: 'wrap' },
  pill: { paddingHorizontal: 9, paddingVertical: 2, borderRadius: BorderRadius.full },
  sep: { height: 1 },
  pie: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  estado: { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: BorderRadius.full },
  // Encima de la esquina superior derecha, alineado con la hora
  menu: {
    position: 'absolute',
    top: Spacing.lg - 12,
    right: Spacing.xs,
    width: Hit.min,
    height: Hit.min,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
