import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@theme/colors';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing, BorderRadius } from '@theme/spacing';

export const DRAWER_WIDTH = Dimensions.get('window').width * 0.82;

export interface DrawerMenuItem {
  label: string;
  icono: keyof typeof Ionicons.glyphMap;
  badge?: string;
  onPress: () => void;
}

interface Props {
  visible: boolean;
  translateX: Animated.Value;
  onClose: () => void;
  items: DrawerMenuItem[];
  nombre: string;
  telefono: string;
  saldo: number;
  simboloMoneda: string;
  onPerfil: () => void;
}

export function DrawerMenu({
  visible,
  translateX,
  onClose,
  items,
  nombre,
  telefono,
  saldo,
  simboloMoneda,
  onPerfil,
}: Props) {
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
      {/* Overlay oscuro */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: translateX.interpolate({
                inputRange: [-DRAWER_WIDTH, 0],
                outputRange: [0, 0.5],
              }),
            },
          ]}
        />
      </TouchableWithoutFeedback>

      {/* Panel del drawer */}
      <Animated.View
        style={[
          styles.drawer,
          { width: DRAWER_WIDTH, transform: [{ translateX }] },
        ]}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarLetra}>
              {nombre.charAt(0).toUpperCase()}
            </Text>
          </View>
          <TouchableOpacity style={styles.perfilRow} onPress={onPerfil} activeOpacity={0.7}>
            <View>
              <Text style={styles.headerNombre}>{nombre}</Text>
              <View style={styles.perfilLinkRow}>
                <Text style={styles.perfilLink}>Mi perfil</Text>
                <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.8)" />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Items */}
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {items.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.item}
              onPress={() => {
                onClose();
                setTimeout(item.onPress, 250);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name={item.icono} size={20} color="#BEC2CE" style={styles.itemIcono} />
              <Text style={styles.itemLabel}>{item.label}</Text>
              {item.badge ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              ) : null}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Telefono al pie */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
          <Text style={styles.footerText}>{telefono}</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.black,
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 16,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetra: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['2xl'],
    color: Colors.primary,
  },
  perfilRow: { flex: 1 },
  headerNombre: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Colors.white,
  },
  perfilLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  perfilLink: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.8)',
  },
  scroll: { flex: 1 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  itemIcono: { marginRight: Spacing.lg },
  itemLabel: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  badge: {
    backgroundColor: Colors.black,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  badgeText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.white,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.divider,
  },
  footerText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
});
