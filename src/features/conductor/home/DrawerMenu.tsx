import React, { useEffect } from 'react';
import { BackHandler, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInLeft, SlideOutLeft } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Plate } from '@shared/components/ui';
import { useAppTheme } from '@theme/useAppTheme';
import { Palette } from '@theme/colors';
import { Weight, Type } from '@theme/fonts';
import { BorderRadius, Hit, Spacing } from '@theme/spacing';
import { Duration } from '@theme/motion';

export interface DrawerMenuItem {
  label: string;
  icono: keyof typeof Ionicons.glyphMap;
  badge?: string;
  /** Cerrar sesion: va al final y en color de peligro. */
  salida?: boolean;
  onPress: () => void;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  items: DrawerMenuItem[];
  perfil: {
    nombre: string;
    apellido: string;
    calificacion: number;
    viajes: string;
    placa: string;
    vehiculo: string;
    vehiculoDetalle: string;
  };
  onPerfil: () => void;
}

/**
 * Menu lateral. El perfil muestra la calificacion y la placa porque es lo que
 * el conductor revisa antes de salir. Se renderiza como dos hermanos (fondo y
 * panel) para que sus animaciones de salida corran al cerrarse.
 */
export function DrawerMenu({ visible, onClose, items, perfil, onPerfil }: Props) {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();

  // Atras de Android cierra el menu en lugar de salir de la app
  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [visible, onClose]);

  if (!visible) return null;

  const principales = items.filter((i) => !i.salida);
  const salida = items.find((i) => i.salida);

  const fila = (item: DrawerMenuItem) => (
    <Pressable
      key={item.label}
      accessibilityRole="button"
      accessibilityLabel={item.badge ? `${item.label}, ${item.badge}` : item.label}
      onPress={item.onPress}
      style={({ pressed }) => [styles.item, pressed && { backgroundColor: theme.background }]}
    >
      <Ionicons name={item.icono} size={20} color={item.salida ? theme.danger : theme.text} />
      <Text style={[styles.itemLabel, { color: item.salida ? theme.danger : theme.text }]}>{item.label}</Text>
      {item.badge ? (
        <View style={[styles.badge, { backgroundColor: theme.onlineSoft }]}>
          <Text style={[Type.tag, { color: theme.online }]}>{item.badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );

  return (
    <>
      <Animated.View
        entering={FadeIn.duration(Duration.base)}
        exiting={FadeOut.duration(Duration.fast)}
        style={[StyleSheet.absoluteFillObject, { backgroundColor: theme.scrim }]}
      >
        <Pressable
          style={StyleSheet.absoluteFillObject}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Cerrar menú"
        />
      </Animated.View>

      <Animated.View
        entering={SlideInLeft.duration(Duration.base)}
        exiting={SlideOutLeft.duration(Duration.fast)}
        accessibilityViewIsModal
        style={[
          styles.drawer,
          {
            backgroundColor: theme.surface,
            paddingTop: insets.top + Spacing.lg,
            paddingBottom: insets.bottom + Spacing.lg,
          },
        ]}
      >
        <View style={styles.brand}>
          <Image source={require('../../../../assets/icon.png')} style={styles.logo} accessibilityIgnoresInvertColors />
          <Text style={[styles.brandText, { color: theme.text }]}>Run Pilot</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${perfil.nombre} ${perfil.apellido}, ${perfil.calificacion} estrellas, ${perfil.viajes}. Vehículo ${perfil.vehiculo}, placa ${perfil.placa}. Ver cuenta`}
          onPress={onPerfil}
          style={({ pressed }) => [
            styles.prof,
            { backgroundColor: theme.background, borderColor: theme.divider },
            pressed && styles.pressed,
          ]}
        >
          {/* Fila 1: Conductor */}
          <View style={styles.driverRow}>
            <View style={[styles.av, { backgroundColor: theme.signal }]}>
              <Text style={[styles.avText, { color: theme.onSignal }]}>
                {perfil.nombre.charAt(0)}{perfil.apellido.charAt(0)}
              </Text>
            </View>
            <View style={styles.driverInfo}>
              <Text style={[Type.name, { color: theme.text }]} numberOfLines={1}>
                {perfil.nombre} {perfil.apellido}
              </Text>
              <View style={styles.rating}>
                <Ionicons name="star" size={12} color={theme.signal} />
                <Text style={[Type.detail, { color: theme.textMuted }]}>
                  {perfil.calificacion.toFixed(2)} · {perfil.viajes}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
          </View>

          {/* Separador sutil */}
          <View style={[styles.divider, { backgroundColor: theme.divider }]} />

          {/* Fila 2: Vehículo + Placa */}
          <View style={styles.vehRow}>
            <View style={styles.vehInfo}>
              <Text style={[styles.veh, { color: theme.text }]} numberOfLines={1}>{perfil.vehiculo}</Text>
              <Text style={[Type.detail, { color: theme.textMuted }]}>{perfil.vehiculoDetalle}</Text>
            </View>
            <Plate placa={perfil.placa} />
          </View>
        </Pressable>

        <ScrollView style={styles.flex} contentContainerStyle={styles.menu} showsVerticalScrollIndicator={false}>
          {principales.map(fila)}
        </ScrollView>
        {salida && fila(salida)}
      </Animated.View>
    </>
  );
}


const styles = StyleSheet.create({
  flex: { flex: 1 },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '84%',
    maxWidth: 360,
    paddingHorizontal: 14,
    gap: 14,
    shadowColor: Palette.black,
    shadowOffset: { width: 8, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 30,
    elevation: 16,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm + 2, paddingHorizontal: Spacing.xs },
  logo: { width: 40, height: 40, borderRadius: 10 },
  brandText: { ...Type.kpi, letterSpacing: -0.2 },
  prof: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  pressed: { opacity: 0.7 },
  driverRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm + 2 },
  driverInfo: { flex: 1, gap: 2 },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 2 },
  vehRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm },
  vehInfo: { flex: 1, gap: 1 },
  av: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  // Medida propia del avatar de 42 dp
  avText: { fontWeight: Weight.bold, fontSize: 15 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  veh: { ...Type.smallStrong },
  menu: { paddingBottom: Spacing.sm },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: Hit.min,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  itemLabel: { flex: 1, ...Type.menu },
  badge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: BorderRadius.full },
});
