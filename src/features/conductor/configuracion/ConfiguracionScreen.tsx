import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ConductorStackParamList } from '@navigation/types';
import { AppHeader } from '@shared/components/ui/AppHeader';
import { useThemeStore } from '@store/useThemeStore';
import { useIsDark } from '@theme/useAppTheme';
import { Colors } from '@theme/colors';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing, BorderRadius, Shadow } from '@theme/spacing';

type Props = NativeStackScreenProps<ConductorStackParamList, 'Configuracion'>;

export function ConfiguracionScreen({ navigation }: Props) {
  const isDark = useIsDark();
  const setPreference = useThemeStore((s) => s.setPreference);

  return (
    <View style={styles.container}>
      <AppHeader title="Configuracion" onBack={() => navigation.goBack()} />

      <View style={styles.content}>
        <Text style={styles.seccionLabel}>Apariencia</Text>

        <View style={styles.grupo}>
          <View style={styles.fila}>
            <Text style={styles.filaLabel}>Modo oscuro</Text>
            <Switch
              value={isDark}
              onValueChange={(dark) => setPreference(dark ? 'dark' : 'light')}
              trackColor={{ false: Colors.divider, true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>
        </View>

        <Text style={styles.seccionLabel}>Notificaciones</Text>

        <View style={styles.grupo}>
          <View style={styles.fila}>
            <View>
              <Text style={styles.filaLabel}>Nuevas solicitudes</Text>
              <Text style={styles.filaSubtitulo}>Recibe alertas de pasajeros cercanos</Text>
            </View>
            <Switch
              value={true}
              onValueChange={() => {}}
              trackColor={{ false: Colors.divider, true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundLight },
  content: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  seccionLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  grupo: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  filaLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  filaSubtitulo: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
