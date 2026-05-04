import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import type { ConductorStackParamList } from '@navigation/types';
import { mockSolicitudes } from '../data/mockSolicitudes';
import type { Solicitud } from '../types';
import { useConductorStore } from '@store/useConductorStore';
import { AppScreen } from '@shared/components/ui/AppScreen';
import { AppHeader } from '@shared/components/ui/AppHeader';
import { Colors } from '@theme/colors';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing, BorderRadius, Shadow } from '@theme/spacing';

type Nav = NativeStackNavigationProp<ConductorStackParamList>;

function SolicitudItem({ item }: { item: Solicitud }) {
  const navigation = useNavigation<Nav>();
  const setSolicitudActual = useConductorStore((s) => s.setSolicitudActual);
  const origen  = item.paradas.find((p) => p.esOrigen);
  const destino = item.paradas.find((p) => !p.esOrigen);

  const handleAceptar = () => {
    setSolicitudActual(item);
    navigation.navigate('Viaje', { solicitudId: item.id });
  };

  return (
    <View style={styles.card}>
      {/* Cabecera: pasajero + precio */}
      <View style={styles.cardHeader}>
        <View style={styles.pasajeroInfo}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={18} color={Colors.textSecondary} />
          </View>
          <View>
            <Text style={styles.pasajeroNombre}>
              {item.pasajero.nombre} {item.pasajero.apellido}
            </Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={12} color={Colors.warning} />
              <Text style={styles.ratingText}>
                {item.pasajero.calificacion.toFixed(1)} · {item.pasajero.totalViajes} viajes
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.precioBlock}>
          <Text style={styles.precio}>{item.simboloMoneda} {item.precio.toFixed(2)}</Text>
          <Text style={styles.metodoPago}>{item.metodoPago}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Ruta */}
      <View style={styles.rutaBlock}>
        <View style={styles.rutaRow}>
          <View style={styles.dotOrigen} />
          <Text style={styles.rutaDireccion} numberOfLines={1}>{origen?.direccion}</Text>
          {origen?.distanciaKm != null && (
            <Text style={styles.distancia}>{origen.distanciaKm} km</Text>
          )}
        </View>
        <View style={styles.rutaLine} />
        <View style={styles.rutaRow}>
          <View style={styles.dotDestino} />
          <Text style={styles.rutaDireccion} numberOfLines={1}>{destino?.direccion}</Text>
          {origen?.duracionMin != null && (
            <Text style={styles.distancia}>{origen.duracionMin} min</Text>
          )}
        </View>
      </View>

      {item.comentario ? (
        <View style={styles.comentarioRow}>
          <Ionicons name="chatbubble-outline" size={13} color={Colors.textSecondary} />
          <Text style={styles.comentario} numberOfLines={1}>{item.comentario}</Text>
        </View>
      ) : null}

      {/* Boton aceptar */}
      <TouchableOpacity style={styles.aceptarBtn} onPress={handleAceptar} activeOpacity={0.88}>
        <Text style={styles.aceptarText}>ACEPTAR VIAJE</Text>
        <Ionicons name="arrow-forward" size={16} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );
}

export function SolicitudesScreen() {
  return (
    <AppScreen>
      <AppHeader title="Tablero de solicitudes" />
      <FlatList
        data={mockSolicitudes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
        ListHeaderComponent={
          <Text style={styles.subtitulo}>{mockSolicitudes.length} solicitudes disponibles</Text>
        }
        renderItem={({ item }) => <SolicitudItem item={item} />}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['3xl'],
  },
  subtitulo: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    marginTop: Spacing.xs,
  },

  /* Card */
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadow.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  pasajeroInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eef2f7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pasajeroNombre: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  ratingText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  precioBlock: { alignItems: 'flex-end' },
  precio: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.success,
  },
  metodoPago: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginBottom: Spacing.md,
  },

  /* Ruta */
  rutaBlock: { marginBottom: Spacing.md },
  rutaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  rutaLine: {
    width: 2,
    height: 12,
    backgroundColor: Colors.divider,
    marginLeft: 4,
    marginVertical: 2,
  },
  dotOrigen: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: Colors.success,
  },
  dotDestino: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: Colors.error,
  },
  rutaDireccion: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  distancia: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },

  /* Comentario */
  comentarioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  comentario: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },

  /* Boton */
  aceptarBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    ...Shadow.sm,
  },
  aceptarText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Colors.white,
    letterSpacing: 0.8,
  },
});
