import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ConductorStackParamList } from '@navigation/types';
import { AppHeader, AppSectionTitle, Segmented } from '@shared/components/ui';
import { useThemeStore, type ThemePreference } from '@store/useThemeStore';
import { useAppTheme } from '@theme/useAppTheme';
import { Type } from '@theme/fonts';
import { BorderRadius, Hit, Spacing } from '@theme/spacing';
import appConfig from '../../../../app.json';

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
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        <Text style={[Type.caption, styles.version, { color: theme.textMuted }]}>
          Run Pilot {appConfig.expo.version}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pad: { paddingHorizontal: 18, paddingTop: Spacing.xs, gap: Spacing.xl },
  hint: { marginTop: Spacing.sm },
  group: { borderRadius: BorderRadius.lg, borderWidth: 1 },
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
