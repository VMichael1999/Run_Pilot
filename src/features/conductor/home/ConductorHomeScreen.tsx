import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, type Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ConductorStackParamList } from '@navigation/types';
import { useConductorStore } from '@store/useConductorStore';
import { useAuthStore } from '@store/useAuthStore';
import { DrawerMenu, DRAWER_WIDTH } from './DrawerMenu';
import type { DrawerMenuItem } from './DrawerMenu';
import { IncomingRequestOverlay } from './components/IncomingRequestOverlay';
import { mockSolicitudes } from '../data/mockSolicitudes';
import type { Solicitud } from '../types';
import type { LatLng } from '../viaje/services/directionsService';
import { Colors } from '@theme/colors';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing, BorderRadius, Shadow } from '@theme/spacing';

type Nav = NativeStackNavigationProp<ConductorStackParamList>;

const OFFLINE_PANEL_H = 180;

const LIMA_REGION = {
  latitude: -12.0464,
  longitude: -77.0428,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const JOCKEY_PLAZA: LatLng = { latitude: -12.0867, longitude: -76.9981 };

// Mock driver KPIs
const KPI = { calificacion: 4.75, aceptacion: 95, cancelacion: 2.0 };

function crearSolicitudSimulada(driverPos: LatLng): Solicitud {
  const base = mockSolicitudes[Math.floor(Math.random() * mockSolicitudes.length)];
  return {
    ...base,
    id: `sim-${Date.now()}`,
    paradas: [
      {
        id: 'sim-origen',
        direccion: 'Mi ubicacion actual',
        distanciaKm: parseFloat((Math.random() * 2 + 0.5).toFixed(1)),
        duracionMin: Math.floor(Math.random() * 5 + 2),
        coordenadas: driverPos,
        esOrigen: true,
      },
      {
        id: 'sim-destino',
        direccion: 'Jockey Plaza Shopping Center, Surco',
        duracionMin: Math.floor(Math.random() * 15 + 10),
        coordenadas: JOCKEY_PLAZA,
        esOrigen: false,
      },
    ],
  };
}


export function ConductorHomeScreen() {
  const insets      = useSafeAreaInsets();
  const navigation  = useNavigation<Nav>();
  const isOnline          = useConductorStore((s) => s.isOnline);
  const ingresosDia       = useConductorStore((s) => s.ingresosDia);
  const setOnline         = useConductorStore((s) => s.setOnline);
  const setSolicitudActual = useConductorStore((s) => s.setSolicitudActual);
  const phone       = useAuthStore((s) => s.phone);
  const logout      = useAuthStore((s) => s.logout);

  const [toggling,        setToggling]        = useState(false);
  const [drawerVisible,   setDrawerVisible]   = useState(false);
  const [region,          setRegion]          = useState<Region>(LIMA_REGION);
  const [solicitudActiva, setSolicitudActiva] = useState<Solicitud | null>(null);
  const driverPos  = useRef<LatLng | null>(null);
  const simTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);

  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const mapRef     = useRef<MapView>(null);

  // GPS
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const pos: LatLng = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      driverPos.current = pos;
      const r: Region = { ...pos, latitudeDelta: 0.01, longitudeDelta: 0.01 };
      setRegion(r);
      mapRef.current?.animateToRegion(r, 800);
    })();
  }, []);

  // Simulacion de solicitudes entrantes (solo cuando online)
  useEffect(() => {
    if (!isOnline) {
      if (simTimer.current) clearTimeout(simTimer.current);
      setSolicitudActiva(null);
      return;
    }
    const mostrarSiguiente = () => {
      const pos = driverPos.current ?? { latitude: LIMA_REGION.latitude, longitude: LIMA_REGION.longitude };
      setSolicitudActiva(crearSolicitudSimulada(pos));
    };
    simTimer.current = setTimeout(mostrarSiguiente, 3000);
    return () => { if (simTimer.current) clearTimeout(simTimer.current); };
  }, [isOnline]);

  const handleRechazarIncoming = () => {
    setSolicitudActiva(null);
    simTimer.current = setTimeout(() => {
      const pos = driverPos.current ?? { latitude: LIMA_REGION.latitude, longitude: LIMA_REGION.longitude };
      setSolicitudActiva(crearSolicitudSimulada(pos));
    }, 6000);
  };

  const handleAceptarIncoming = (s: Solicitud) => {
    setSolicitudActiva(null);
    if (simTimer.current) clearTimeout(simTimer.current);
    setSolicitudActual(s);
    navigation.navigate('Viaje', { solicitudId: s.id });
  };

  // Drawer
  const abrirDrawer  = () => {
    setDrawerVisible(true);
    Animated.timing(translateX, { toValue: 0, duration: 280, useNativeDriver: true }).start();
  };
  const cerrarDrawer = () => {
    Animated.timing(translateX, { toValue: -DRAWER_WIDTH, duration: 240, useNativeDriver: true })
      .start(() => setDrawerVisible(false));
  };

  const handleToggleOnline = () => {
    if (toggling) return;
    setToggling(true);
    setTimeout(() => { setOnline(!isOnline); setToggling(false); }, 400);
  };

  const nav = (screen: keyof ConductorStackParamList) => {
    cerrarDrawer();
    setTimeout(() => navigation.navigate(screen as any), 260);
  };

  const drawerItems: DrawerMenuItem[] = [
    { label: 'Tablero de solicitudes', icono: 'list-outline',      onPress: () => nav('Solicitudes')          },
    { label: 'Billetera',              icono: 'wallet-outline',    badge: `S/ ${ingresosDia.toFixed(2)}`, onPress: () => nav('Billetera') },
    { label: 'Servicios Programados',  icono: 'calendar-outline',  onPress: () => nav('ServiciosProgramados') },
    { label: 'Ingresos',               icono: 'cash-outline',      onPress: () => nav('Ingresos')             },
    { label: 'Experiencia',           icono: 'star-outline',      onPress: () => nav('Experiencia')          },
    { label: 'Historial de viajes',   icono: 'time-outline',      onPress: () => nav('HistorialViaje')       },
    { label: 'Configuracion',         icono: 'settings-outline',  onPress: () => nav('Configuracion')        },
    { label: 'Cerrar sesion',         icono: 'log-out-outline',   onPress: () => { cerrarDrawer(); setTimeout(logout, 260); } },
  ];

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        showsUserLocation
        showsMyLocationButton={false}
      />

      {/* ── Top bar ── */}
      <View style={[styles.topBar, { paddingTop: insets.top + Spacing.sm }]}>
        <TouchableOpacity style={styles.iconBtn} onPress={abrirDrawer} activeOpacity={0.85}>
          <Ionicons name="menu" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => mapRef.current?.animateToRegion(region, 600)}
          activeOpacity={0.85}
        >
          <Ionicons name="locate" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* ── Floating balance badge ── */}
      <View style={[styles.balanceBadgeWrap, { top: insets.top + 16 }]}>
        <View style={styles.balanceBadge}>
          <Text style={styles.balanceSymbol}>S/</Text>
          <Text style={styles.balanceAmount}>{ingresosDia.toFixed(2)}</Text>
        </View>
      </View>

      {/* ══════════════════════════════
          GO / STOP button (always visible)
      ══════════════════════════════ */}
      <View
        style={[styles.goArea, { bottom: OFFLINE_PANEL_H + Spacing.xl }]}
      >
        <TouchableOpacity
          style={[styles.goBtn, isOnline && styles.stopBtn]}
          onPress={handleToggleOnline}
          activeOpacity={0.88}
        >
          {toggling
            ? <ActivityIndicator color={Colors.white} />
            : <Text style={styles.goText}>{isOnline ? 'STOP' : 'GO'}</Text>
          }
        </TouchableOpacity>
        <Text style={styles.offlineLabel}>
          {isOnline ? 'En linea' : 'Estas desconectado'}
        </Text>
      </View>

      {/* ══════════════════════════════
          KPI stats panel (siempre visible)
      ══════════════════════════════ */}
      <View style={[styles.offlinePanel, { paddingBottom: insets.bottom + Spacing.md }]}>
        <View style={styles.kpiRow}>
          <View style={styles.kpiItem}>
            <Ionicons name="star" size={20} color={Colors.warning} />
            <Text style={styles.kpiVal}>{KPI.calificacion.toFixed(2)}</Text>
            <Text style={styles.kpiLbl}>Calificacion</Text>
          </View>
          <View style={styles.kpiSep} />
          <View style={styles.kpiItem}>
            <Ionicons name="checkmark-circle-outline" size={20} color={Colors.success} />
            <Text style={styles.kpiVal}>{KPI.aceptacion}%</Text>
            <Text style={styles.kpiLbl}>Aceptacion</Text>
          </View>
          <View style={styles.kpiSep} />
          <View style={styles.kpiItem}>
            <Ionicons name="close-circle-outline" size={20} color={Colors.error} />
            <Text style={styles.kpiVal}>{KPI.cancelacion}%</Text>
            <Text style={styles.kpiLbl}>Cancelacion</Text>
          </View>
        </View>
      </View>

      {/* Solicitud entrante — overlay pantalla completa */}
      {isOnline && solicitudActiva && (
        <IncomingRequestOverlay
          solicitud={solicitudActiva}
          onAceptar={() => handleAceptarIncoming(solicitudActiva)}
          onRechazar={handleRechazarIncoming}
        />
      )}

      <DrawerMenu
        visible={drawerVisible}
        translateX={translateX}
        onClose={cerrarDrawer}
        items={drawerItems}
        nombre="Conductor"
        telefono={phone || ''}
        saldo={ingresosDia}
        simboloMoneda="S/"
        onPerfil={() => nav('Cuenta')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  /* Top bar */
  topBar: {
    position: 'absolute',
    top: 0, left: Spacing.lg, right: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center',
    ...Shadow.md,
  },

  /* Floating balance badge */
  balanceBadgeWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  balanceBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
    backgroundColor: Colors.black,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    ...Shadow.md,
  },
  balanceSymbol: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.6)',
  },
  balanceAmount: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.white,
  },

  /* ── OFFLINE ── */
  goArea: {
    position: 'absolute',
    left: 0, right: 0,
    alignItems: 'center',
    gap: Spacing.md,
  },
  goBtn: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    ...Shadow.lg,
  },
  stopBtn: {
    backgroundColor: Colors.error,
  },
  goText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.white,
    letterSpacing: 2,
  },
  offlineLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.white,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  offlinePanel: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: OFFLINE_PANEL_H,
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    justifyContent: 'center',
    ...Shadow.lg,
  },
  kpiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.lg,
  },
  kpiItem: { alignItems: 'center', flex: 1, gap: 4 },
  kpiSep: {
    width: 1, height: 48,
    backgroundColor: Colors.divider,
  },
  kpiVal: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
  },
  kpiLbl: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },

});
