import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ConductorStackParamList } from '@navigation/types';
import { AppHeader, AppSectionTitle, Segmented } from '@shared/components/ui';
import { useThemeStore, type ThemePreference } from '@store/useThemeStore';
import { useAppTheme } from '@theme/useAppTheme';
import { Palette } from '@theme/colors';
import { Type } from '@theme/fonts';
import { BorderRadius, Hit, Spacing } from '@theme/spacing';
import appConfig from '../../../../app.json';
import { usePermisoBurbuja } from '../burbuja/permiso';

type Props = NativeStackScreenProps<ConductorStackParamList, 'Configuracion'>;

const APARIENCIA: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'Automático' },
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Oscuro' },
];

export function ConfiguracionScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const preference = useThemeStore((s) => s.preference);
  const setPreference = useThemeStore((s) => s.setPreference);
  // Aun no se guarda en ningun lado: no hay backend de notificaciones
  const [avisos, setAvisos] = useState(true);
  const burbuja = usePermisoBurbuja();

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <AppHeader title="Configuración" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={[styles.pad, { paddingBottom: insets.bottom + Spacing['2xl'] }]}>
        <View>
          <AppSectionTitle>Apariencia</AppSectionTitle>
          <Segmented options={APARIENCIA} value={preference} onChange={setPreference} />
          <Text style={[Type.caption, styles.hint, { color: theme.textMuted }]}>
            {preference === 'system'
              ? 'Sigue el modo claro u oscuro de tu teléfono.'
              : preference === 'dark'
                ? 'Siempre oscuro: menos brillo manejando de noche.'
                : 'Siempre claro: se lee mejor a pleno sol.'}
          </Text>
        </View>

        <View>
          <AppSectionTitle>Notificaciones</AppSectionTitle>
          <View style={[styles.group, { backgroundColor: theme.surface, borderColor: theme.divider }]}>
            <View style={styles.fila}>
              <View style={styles.flex}>
                <Text style={[Type.label, { color: theme.text }]}>Nuevas solicitudes</Text>
                <Text style={[Type.caption, { color: theme.textMuted }]}>Aviso cuando llega un viaje cerca de ti</Text>
              </View>
              <Switch
                accessibilityLabel="Avisos de nuevas solicitudes"
                value={avisos}
                onValueChange={setAvisos}
                trackColor={{ false: theme.divider, true: theme.online }}
                thumbColor={Palette.white}
              />
            </View>
          </View>
        </View>


        {burbuja.disponible && (
          <View>
            <AppSectionTitle>Viaje</AppSectionTitle>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Burbuja para volver al viaje, ${burbuja.permiso ? 'activada' : 'desactivada'}`}
              onPress={() => navigation.navigate('PermisoBurbuja')}
              style={({ pressed }) => [
                styles.group,
                { backgroundColor: theme.surface, borderColor: theme.divider },
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.fila}>
                <View style={styles.flex}>
                  <Text style={[Type.label, { color: theme.text }]}>Burbuja para volver al viaje</Text>
                  <Text style={[Type.caption, { color: theme.textMuted }]}>
                    {burbuja.permiso
                      ? 'Activada: aparece al salir de la app durante un viaje'
                      : 'Desactivada: falta el permiso para mostrarse sobre otras apps'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
              </View>
            </Pressable>
          </View>
        )}

        {/* Acceso oculto al catalogo de componentes: solo en desarrollo, manteniendo presionada la version */}
        <Pressable
          onLongPress={__DEV__ ? () => navigation.navigate('Catalogo') : undefined}
          delayLongPress={1500}
          accessible={false}
        >
          <Text style={[Type.caption, styles.version, { color: theme.textMuted }]}>
            Run Pilot {appConfig.expo.version}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pad: { paddingHorizontal: 18, paddingTop: Spacing.xs, gap: Spacing.xl },
  hint: { marginTop: Spacing.sm },
  group: { borderRadius: BorderRadius.lg, borderWidth: 1 },
  pressed: { opacity: 0.7 },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    minHeight: Hit.action,
    paddingHorizontal: 14,
    paddingVertical: Spacing.md,
  },
  version: { textAlign: 'center' },
});
