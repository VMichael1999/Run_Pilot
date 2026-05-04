import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import type { ConductorStackParamList } from '@navigation/types';
import { useAuthStore } from '@store/useAuthStore';
import { Colors } from '@theme/colors';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing, BorderRadius, Shadow } from '@theme/spacing';

type Nav = NativeStackNavigationProp<ConductorStackParamList>;

interface MenuItem {
  label: string;
  icono: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  peligro?: boolean;
}

export function CuentaScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const phone = useAuthStore((s) => s.phone);
  const logout = useAuthStore((s) => s.logout);

  const menuItems: MenuItem[] = [
    {
      label: 'Historial de viajes',
      icono: 'time-outline',
      onPress: () => navigation.navigate('HistorialViaje'),
    },
    {
      label: 'Configuracion',
      icono: 'settings-outline',
      onPress: () => navigation.navigate('Configuracion'),
    },
    {
      label: 'Cerrar sesion',
      icono: 'log-out-outline',
      onPress: logout,
      peligro: true,
    },
  ];

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={[styles.perfilHeader, { paddingTop: insets.top + Spacing.md }]}>
        <TouchableOpacity style={styles.btnBack} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="chevron-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <View style={styles.avatar}>
          <Text style={styles.avatarLetra}>C</Text>
        </View>
        <Text style={styles.nombre}>Conductor</Text>
        <Text style={styles.telefono}>{phone || 'Sin numero'}</Text>
        <View style={styles.rolChip}>
          <Ionicons name="car" size={12} color={Colors.white} />
          <Text style={styles.rolText}>Conductor verificado</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.seccionLabel}>Mi cuenta</Text>

        <View style={styles.menuGroup}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              style={[
                styles.menuItem,
                index < menuItems.length - 1 && styles.menuItemBorder,
              ]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIcono, item.peligro && styles.menuIconoPeligro]}>
                <Ionicons
                  name={item.icono}
                  size={18}
                  color={item.peligro ? Colors.error : Colors.primary}
                />
              </View>
              <Text style={[styles.menuLabel, item.peligro && styles.menuLabelPeligro]}>
                {item.label}
              </Text>
              {!item.peligro && (
                <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundLight },
  perfilHeader: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    paddingBottom: Spacing['3xl'],
    paddingHorizontal: Spacing.lg,
  },
  btnBack: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  avatarLetra: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['2xl'],
    color: Colors.primary,
  },
  nombre: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.white,
  },
  telefono: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  rolChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    marginTop: Spacing.md,
  },
  rolText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.white,
  },
  scroll: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  seccionLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  menuGroup: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  menuIcono: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eef2f7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconoPeligro: {
    backgroundColor: '#fff0f0',
  },
  menuLabel: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  menuLabelPeligro: {
    color: Colors.error,
  },
});
