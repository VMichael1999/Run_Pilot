import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import type { ConductorStackParamList } from '@navigation/types';
import { useAuthStore } from '@store/useAuthStore';
import { AppHeader, AppListRow, AppSectionTitle, Plate, Tag } from '@shared/components/ui';
import { formatTelefono, pluralViajes } from '@shared/utils/format';
import { confirmarCerrarSesion } from '@shared/utils/sesion';
import { useAppTheme } from '@theme/useAppTheme';
import { Weight, Type } from '@theme/fonts';
import { BorderRadius, Spacing } from '@theme/spacing';
import { mockConductor } from '../data/mockConductor';
import { useVehiculoActivo } from '../vehiculo/useVehiculoActivo';

type Nav = NativeStackNavigationProp<ConductorStackParamList>;

export function CuentaScreen() {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const navigation = useNavigation<Nav>();
  const phone = useAuthStore((s) => s.phone);
  const countryCode = useAuthStore((s) => s.countryCode);
  const logout = useAuthStore((s) => s.logout);
  const c = mockConductor;
  const v = useVehiculoActivo();

  const chevron = <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />;
  const icono = (name: keyof typeof Ionicons.glyphMap, color = theme.text) => (
    <Ionicons name={name} size={20} color={color} />
  );

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <AppHeader title="Cuenta" />
      <ScrollView contentContainerStyle={[styles.pad, { paddingBottom: insets.bottom + Spacing['2xl'] }]}>
        <View style={styles.perfil}>
          <View style={[styles.av, { backgroundColor: theme.signal }]}>
            <Text style={[styles.avText, { color: theme.onSignal }]}>{c.nombre.charAt(0)}{c.apellido.charAt(0)}</Text>
          </View>
          <View style={styles.flex}>
            <Text style={[Type.title, { color: theme.text }]}>{c.nombre} {c.apellido}</Text>
            <Text style={[Type.body, { color: theme.textMuted }]}>
              {phone ? formatTelefono(phone, countryCode) : 'Sin número registrado'}
            </Text>
          </View>
        </View>
        <View style={styles.tags}>
          <Tag label="Conductor verificado" tone="success" />
          <Tag label={`★ ${c.calificacion.toFixed(2)} · ${pluralViajes(c.totalViajes)}`} />
        </View>

        <View>
          <AppSectionTitle>Vehículo activo</AppSectionTitle>
          <View style={[styles.group, { backgroundColor: theme.surface, borderColor: theme.divider }]}>
            <AppListRow
              title={`${v.marca} ${v.modelo}`}
              subtitle={`${v.color} · ${v.anio}`}
              left={<Plate placa={v.placa} />}
              right={chevron}
              accessibilityLabel={`Vehículo activo ${v.marca} ${v.modelo}, placa ${v.placa}. Cambiar vehículo`}
              onPress={() => navigation.navigate('SeleccionarVehiculo')}
              style={styles.rowPad}
            />
          </View>
        </View>

        <View>
          <AppSectionTitle>Mi cuenta</AppSectionTitle>
          <View style={[styles.group, { backgroundColor: theme.surface, borderColor: theme.divider }]}>
            <AppListRow title="Experiencia" left={icono('star-outline')} right={chevron} onPress={() => navigation.navigate('Experiencia')} showDivider style={styles.rowPad} />
            <AppListRow title="Historial de viajes" left={icono('time-outline')} right={chevron} onPress={() => navigation.navigate('HistorialViaje')} showDivider style={styles.rowPad} />
            <AppListRow title="Configuración" left={icono('settings-outline')} right={chevron} onPress={() => navigation.navigate('Configuracion')} style={styles.rowPad} />
          </View>
        </View>

        <View style={[styles.group, { backgroundColor: theme.surface, borderColor: theme.divider }]}>
          <AppListRow
            title="Cerrar sesión"
            left={icono('log-out-outline', theme.danger)}
            titleStyle={{ color: theme.danger }}
            onPress={() => confirmarCerrarSesion(logout)}
            style={styles.rowPad}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pad: { paddingHorizontal: 18, paddingTop: Spacing.xs, gap: Spacing.lg },
  perfil: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  av: { width: 64, height: 64, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  // Medida propia del avatar de 64 dp
  avText: { fontWeight: Weight.bold, fontSize: 22 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  group: { borderRadius: BorderRadius.lg, borderWidth: 1 },
  rowPad: { paddingHorizontal: 14 },
});
