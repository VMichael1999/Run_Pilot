import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '@shared/components/ui/AppHeader';
import { Colors } from '@theme/colors';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing, BorderRadius, Shadow } from '@theme/spacing';

interface Calificacion {
  id: string;
  nombre: string;
  puntaje: number;
  viajes: number;
  comentario?: string;
}

const MOCK_CALIFICACIONES: Calificacion[] = [
  { id: '1', nombre: 'Ana Torres',    puntaje: 5, viajes: 12, comentario: 'Excelente conductor, muy puntual.' },
  { id: '2', nombre: 'Luis Garcia',   puntaje: 4, viajes: 3 },
  { id: '3', nombre: 'Maria Flores',  puntaje: 5, viajes: 7,  comentario: 'Muy amable y el auto impecable.' },
  { id: '4', nombre: 'Carlos Rojas',  puntaje: 4, viajes: 20 },
];

function EstrellasFijas({ puntaje }: { puntaje: number }) {
  return (
    <View style={styles.estrellas}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Ionicons
          key={i}
          name={i < puntaje ? 'star' : 'star-outline'}
          size={13}
          color={i < puntaje ? Colors.warning : Colors.textDisabled}
        />
      ))}
    </View>
  );
}

function CalificacionItem({ item }: { item: Calificacion }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardAvatar}>
        <Ionicons name="person" size={18} color={Colors.textSecondary} />
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardNombre}>{item.nombre}</Text>
        <EstrellasFijas puntaje={item.puntaje} />
        {item.comentario ? (
          <Text style={styles.cardComentario} numberOfLines={2}>
            "{item.comentario}"
          </Text>
        ) : null}
      </View>
      <Text style={styles.cardViajes}>{item.viajes} viajes</Text>
    </View>
  );
}

export function ExperienciaScreen() {
  const promedio =
    MOCK_CALIFICACIONES.reduce((acc, r) => acc + r.puntaje, 0) / (MOCK_CALIFICACIONES.length || 1);

  return (
    <View style={styles.container}>
      <AppHeader title="Mi experiencia" />
      <View style={styles.resumen}>
        <Text style={styles.resumenLabel}>Calificacion promedio</Text>
        <View style={styles.resumenPuntaje}>
          <Ionicons name="star" size={28} color={Colors.warning} />
          <Text style={styles.resumenNumero}>{promedio.toFixed(1)}</Text>
        </View>
        <Text style={styles.resumenTotal}>{MOCK_CALIFICACIONES.length} calificaciones</Text>
      </View>

      <FlatList
        data={MOCK_CALIFICACIONES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.lista}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
        renderItem={({ item }) => <CalificacionItem item={item} />}
        ListHeaderComponent={
          <Text style={styles.listaHeader}>Ultimas calificaciones</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundLight },
  resumen: {
    backgroundColor: Colors.white,
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
    ...Shadow.sm,
  },
  resumenLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  resumenPuntaje: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  resumenNumero: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['4xl'],
    color: Colors.primary,
  },
  resumenTotal: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  lista: {
    padding: Spacing.lg,
  },
  listaHeader: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Shadow.sm,
  },
  cardAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#eef2f7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: { flex: 1 },
  cardNombre: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  estrellas: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 4,
  },
  cardComentario: {
    fontFamily: FontFamily.italic,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  cardViajes: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
});
