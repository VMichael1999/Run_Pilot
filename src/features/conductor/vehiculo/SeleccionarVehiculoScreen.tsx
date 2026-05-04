import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ConductorStackParamList } from '@navigation/types';
import { useConductorStore } from '@store/useConductorStore';
import { Colors } from '@theme/colors';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing, BorderRadius, Shadow } from '@theme/spacing';

type Props = NativeStackScreenProps<ConductorStackParamList, 'SeleccionarVehiculo'>;

interface Vehiculo {
  id: string;
  marca: string;
  modelo: string;
  placa: string;
  anio: number;
  codigo: string;
}

const MOCK_VEHICULOS: Vehiculo[] = [
  { id: '1', marca: 'BMW',   modelo: 'Serie 3', placa: 'CMT-3948', anio: 2020, codigo: 'XT980' },
  { id: '2', marca: 'Honda', modelo: 'CRV',     placa: 'BS-6888',  anio: 2025, codigo: '9T-998' },
];

const LIMA_REGION = {
  latitude: -12.0464,
  longitude: -77.0428,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

function VehiculoItem({
  item,
  seleccionado,
  onSeleccionar,
}: {
  item: Vehiculo;
  seleccionado: boolean;
  onSeleccionar: (id: string) => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.card, seleccionado && styles.cardSeleccionado]}
      onPress={() => onSeleccionar(item.id)}
      activeOpacity={0.8}
    >
      <View style={styles.cardIcono}>
        <Ionicons name="car" size={22} color={seleccionado ? Colors.primary : Colors.textSecondary} />
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardNombre}>
          {item.marca} {item.modelo}
        </Text>
        <Text style={styles.cardDetalle}>
          {item.codigo} · {item.placa} · {item.anio}
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={18}
        color={seleccionado ? Colors.primary : Colors.textSecondary}
      />
    </TouchableOpacity>
  );
}

export function SeleccionarVehiculoScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const setOnline = useConductorStore((s) => s.setOnline);
  const [vehiculoId, setVehiculoId] = useState<string | null>(null);

  const handleSeleccionar = (id: string) => {
    setVehiculoId(id);
    setTimeout(() => {
      setOnline(true);
      navigation.goBack();
    }, 350);
  };

  return (
    <View style={styles.container}>
      {/* Mapa atenuado al fondo */}
      <View style={styles.mapaContainer}>
        <MapView
          style={StyleSheet.absoluteFillObject}
          provider={PROVIDER_GOOGLE}
          initialRegion={LIMA_REGION}
          scrollEnabled={false}
          zoomEnabled={false}
          pitchEnabled={false}
          rotateEnabled={false}
        />
        <View style={styles.mapaOverlay} />
      </View>

      {/* Panel inferior */}
      <View style={[styles.panel, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <View style={styles.panelHandle} />
        <Text style={styles.panelTitulo}>Seleccionar vehiculo</Text>

        <FlatList
          data={MOCK_VEHICULOS}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
          renderItem={({ item }) => (
            <VehiculoItem
              item={item}
              seleccionado={vehiculoId === item.id}
              onSeleccionar={handleSeleccionar}
            />
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapaContainer: {
    flex: 1,
  },
  mapaOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  panel: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    ...Shadow.lg,
  },
  panelHandle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.divider,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  panelTitulo: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.divider,
    gap: Spacing.md,
  },
  cardSeleccionado: {
    borderColor: Colors.primary,
    backgroundColor: '#eaf2ff',
  },
  cardIcono: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#eef2f7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: { flex: 1 },
  cardNombre: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  cardDetalle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
