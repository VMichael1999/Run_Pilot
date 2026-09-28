import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import MapView, { PROVIDER_GOOGLE, type Region } from 'react-native-maps';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ConductorStackParamList } from '@navigation/types';
import { useConductorStore } from '@store/useConductorStore';
import { useAuthStore } from '@store/useAuthStore';
import { DrawerMenu } from './DrawerMenu';
import type { DrawerMenuItem } from './DrawerMenu';
import { IncomingRequestOverlay } from './components/IncomingRequestOverlay';
import { ViajeEnCursoBanner } from './components/ViajeEnCursoBanner';
import { mockSolicitudes } from '../data/mockSolicitudes';
import { mockConductor } from '../data/mockConductor';
import { mockBilletera } from '../data/mockIngresos';
import type { Solicitud } from '../types';
import type { LatLng } from '../viaje/services/directionsService';
import { AppButton, InfoNote, MapButton, MapPill, Plate, StatusDot } from '@shared/components/ui';
import { formatSoles, haceTiempo, inicioDelDia, pluralViajes } from '@shared/utils/format';
import { confirmarCerrarSesion } from '@shared/utils/sesion';
import { useAppTheme } from '@theme/useAppTheme';
import { useMapStyle } from '@shared/components/map/mapStyle';
import { Weight, Type } from '@theme/fonts';
import { Spacing, BorderRadius, Hit, Shadow } from '@theme/spacing';
import { Duration } from '@theme/motion';

type Nav = NativeStackNavigationProp<ConductorStackParamList>;

const LIMA_REGION = {
  latitude: -12.0464,
  longitude: -77.0428,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const JOCKEY_PLAZA: LatLng = { latitude: -12.0867, longitude: -76.9981 };

function crearSolicitudSimulada(driverPos: LatLng): Solicitud {
  const base = mockSolicitudes[Math.floor(Math.random() * mockSolicitudes.length)];
  return {
    ...base,
    id: `sim-${Date.now()}`,
    paradas: [
      {
        id: 'sim-origen',
        direccion: 'Mi ubicación actual',
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
  const theme       = useAppTheme();
  const mapStyle = useMapStyle();
  const isOnline          = useConductorStore((s) => s.isOnline);
  const historial         = useConductorStore((s) => s.historial);
  const setOnline         = useConductorStore((s) => s.setOnline);
  const setSolicitudActual = useConductorStore((s) => s.setSolicitudActual);
  const solicitudActual   = useConductorStore((s) => s.solicitudActual);
  const estadoViaje       = useConductorStore((s) => s.estadoViaje);
  const esperandoDesde    = useConductorStore((s) => s.esperandoDesde);
  // Viaje aceptado que aun no termina de cobrarse
  const viajeActivo = solicitudActual && estadoViaje && estadoViaje !== 'finalizado'
    ? { solicitud: solicitudActual, estado: estadoViaje }
    : null;
  const logout      = useAuthStore((s) => s.logout);

  const [toggling,        setToggling]        = useState(false);
  const [drawerVisible,   setDrawerVisible]   = useState(false);
  const [region,          setRegion]          = useState<Region>(LIMA_REGION);
  const [solicitudActiva, setSolicitudActiva] = useState<Solicitud | null>(null);
  const driverPos  = useRef<LatLng | null>(null);
  const simTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Simulacion de solicitudes entrantes: solo conectado y sin viaje en curso.
  // Al terminar un viaje se reanuda (antes no llegaban mas despues del primero).
  const hayViaje = viajeActivo !== null;
  useEffect(() => {
    if (!isOnline || hayViaje) {
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
  }, [isOnline, hayViaje]);

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

  // Menu lateral
  const abrirDrawer  = () => setDrawerVisible(true);
  const cerrarDrawer = () => setDrawerVisible(false);

  const handleToggleOnline = () => {
    if (toggling) return;
    setToggling(true);
    setTimeout(() => {
      setOnline(!isOnline);
      setToggling(false);
      // Confirma el cambio de estado sin tener que mirar la pantalla
      void Haptics.notificationAsync(
        isOnline ? Haptics.NotificationFeedbackType.Warning : Haptics.NotificationFeedbackType.Success,
      );
    }, 400);
  };

  // "Buscando viajes ... hace N min": cuenta desde que se conecto
  const [onlineDesde, setOnlineDesde] = useState<number | null>(null);
  const [ahora, setAhora] = useState(Date.now());
  useEffect(() => {
    if (!isOnline) { setOnlineDesde(null); return; }
    setOnlineDesde(Date.now());
    const iv = setInterval(() => setAhora(Date.now()), 30_000);
    return () => clearInterval(iv);
  }, [isOnline]);

  // "Hoy S/ … · N viajes": ambos del historial de hoy para que sean coherentes
  const hoy = useMemo(() => {
    const desde = inicioDelDia();
    const viajes = historial.filter((v) => v.fechaMs >= desde);
    return { total: viajes.reduce((acc, v) => acc + v.solicitud.precio, 0), viajes: viajes.length };
  }, [historial]);

  const [panelH, setPanelH] = useState(0);
  const { vehiculo } = mockConductor;

  // Se navega cuando el menu termino de cerrarse
  const nav = (screen: keyof ConductorStackParamList) => {
    cerrarDrawer();
    setTimeout(() => navigation.navigate(screen as never), Duration.fast);
  };

  const drawerItems: DrawerMenuItem[] = [
    { label: 'Tablero de solicitudes', icono: 'list-outline',     onPress: () => nav('Solicitudes') },
    { label: 'Billetera',              icono: 'wallet-outline',   badge: formatSoles(mockBilletera.saldo), onPress: () => nav('Billetera') },
    { label: 'Servicios programados',  icono: 'calendar-outline', onPress: () => nav('ServiciosProgramados') },
    { label: 'Ingresos',               icono: 'cash-outline',     onPress: () => nav('Ingresos') },
    { label: 'Experiencia',            icono: 'star-outline',     onPress: () => nav('Experiencia') },
    { label: 'Historial de viajes',    icono: 'time-outline',     onPress: () => nav('HistorialViaje') },
    { label: 'Configuración',          icono: 'settings-outline', onPress: () => nav('Configuracion') },
    {
      label: 'Cerrar sesión',
      icono: 'log-out-outline',
      salida: true,
      onPress: () => { cerrarDrawer(); confirmarCerrarSesion(logout); },
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        provider={PROVIDER_GOOGLE}
        customMapStyle={mapStyle}
        initialRegion={region}
        mapPadding={{ top: insets.top + 100, right: 0, bottom: panelH, left: 0 }}
        showsUserLocation
        showsMyLocationButton={false}
        toolbarEnabled={false}
      />

      {/* Barra superior: menu, estado en una palabra, centrar */}
      <View style={[styles.topBar, { top: insets.top + Spacing.sm }]}>
        <MapButton icon="menu-outline" accessibilityLabel="Abrir menú" onPress={abrirDrawer} />
        <MapPill accessibilityLabel={isOnline ? 'Estado: conectado' : 'Estado: desconectado'}>
          <StatusDot online={isOnline} />
          <Text style={[Type.status, { color: theme.text }]} numberOfLines={1}>
            {isOnline ? 'Conectado' : 'Desconectado'}
          </Text>
        </MapPill>
        <MapButton
          icon="navigate-outline"
          accessibilityLabel="Centrar el mapa en tu ubicación"
          onPress={() => mapRef.current?.animateToRegion(region, 600)}
        />
      </View>

      <View style={[styles.earnWrap, { top: insets.top + Spacing.sm + Hit.control + Spacing.sm }]} pointerEvents="none">
        <MapPill accessibilityLabel={`Hoy llevas ${formatSoles(hoy.total)} en ${pluralViajes(hoy.viajes)}`}>
          <Text style={[styles.earnText, { color: theme.text }]} numberOfLines={1}>
            Hoy <Text style={styles.earnBold}>{formatSoles(hoy.total)}</Text> · {pluralViajes(hoy.viajes)}
          </Text>
        </MapPill>
      </View>

      {/* Acceso directo al tablero, aparte del menu */}
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`Tablero de solicitudes, ${mockSolicitudes.length} disponibles`}
        onPress={() => navigation.navigate('Solicitudes')}
        activeOpacity={0.85}
        style={[styles.tablero, { bottom: panelH + Spacing.md, backgroundColor: theme.surface }]}
      >
        <Ionicons name="list-outline" size={20} color={theme.text} />
        <Text style={[Type.status, { color: theme.text }]}>Tablero</Text>
        <View style={[styles.tableroBadge, { backgroundColor: theme.signal }]}>
          <Text style={[Type.tag, { color: theme.onSignal }]}>{mockSolicitudes.length}</Text>
        </View>
      </TouchableOpacity>

      {/* Panel inferior: un solo estado a la vez */}
      <View
        style={[
          styles.panel,
          { backgroundColor: theme.surface, paddingBottom: insets.bottom + Spacing.xl + 2 },
        ]}
        onLayout={(e) => setPanelH(e.nativeEvent.layout.height)}
      >
        {/* Viaje en curso: el panel crece hacia arriba con esta franja */}
        {viajeActivo && (
          <ViajeEnCursoBanner
            solicitud={viajeActivo.solicitud}
            estado={viajeActivo.estado}
            esperandoDesde={esperandoDesde}
            onContinuar={() => navigation.navigate('Viaje', { solicitudId: viajeActivo.solicitud.id })}
          />
        )}

        {viajeActivo ? (
          <Animated.View
            key="en-curso"
            entering={FadeIn.duration(Duration.base)}
            exiting={FadeOut.duration(Duration.fast)}
            style={[styles.panelBody, styles.panelBodyTop]}
          >
            <Text style={[Type.panelTitle, { color: theme.text }]}>Tienes un viaje en curso</Text>
            <Text style={[Type.detail, { color: theme.textMuted }]}>
              No recibirás nuevas solicitudes hasta terminarlo.
            </Text>
          </Animated.View>
        ) : isOnline ? (
          <Animated.View
            key="online"
            entering={FadeIn.duration(Duration.base)}
            exiting={FadeOut.duration(Duration.fast)}
            style={styles.panelBody}
          >
            <View style={styles.hRow}>
              <Text style={[Type.panelTitle, styles.flex, { color: theme.text }]}>Buscando viajes cerca de ti</Text>
              {onlineDesde !== null && (
                <Text style={[Type.detail, { color: theme.textMuted }]}>{haceTiempo(onlineDesde, ahora)}</Text>
              )}
            </View>
            <InfoNote title={`Más demanda en ${mockConductor.demanda.distrito}.`}>
              Está a {mockConductor.demanda.minutos} min de donde estás.
            </InfoNote>
            <AppButton
              label="Desconectarme"
              variant="ghost"
              size="md"
              loading={toggling}
              onPress={handleToggleOnline}
            />
          </Animated.View>
        ) : (
          <Animated.View
            key="offline"
            entering={FadeIn.duration(Duration.base)}
            exiting={FadeOut.duration(Duration.fast)}
            style={styles.panelBody}
          >
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={`Vehículo activo: ${vehiculo.marca} ${vehiculo.modelo} ${vehiculo.color}. Cambiar vehículo`}
              style={styles.veh}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('SeleccionarVehiculo')}
            >
              <Plate placa={vehiculo.placa} />
              <View style={styles.flex}>
                <Text style={[Type.address, styles.vehName, { color: theme.text }]}>
                  {vehiculo.marca} {vehiculo.modelo} · {vehiculo.color}
                </Text>
                <Text style={[Type.detail, { color: theme.textMuted }]}>
                  Vehículo activo · <Text style={[styles.link, { color: theme.text }]}>cambiar</Text>
                </Text>
              </View>
            </TouchableOpacity>
            <AppButton
              label="Conectarme"
              icon={<Ionicons name="power" size={20} color={theme.onPrimary} />}
              loading={toggling}
              onPress={handleToggleOnline}
            />
            <Text style={[Type.detail, styles.center, { color: theme.textMuted }]}>
              Empezarás a recibir viajes cerca de {mockConductor.zona}.
            </Text>
          </Animated.View>
        )}
      </View>

      {/* Solicitud entrante — overlay pantalla completa */}
      {isOnline && !viajeActivo && solicitudActiva && (
        <IncomingRequestOverlay
          solicitud={solicitudActiva}
          onAceptar={() => handleAceptarIncoming(solicitudActiva)}
          onRechazar={handleRechazarIncoming}
        />
      )}

      <DrawerMenu
        visible={drawerVisible}
        onClose={cerrarDrawer}
        items={drawerItems}
        perfil={{
          nombre: mockConductor.nombre,
          apellido: mockConductor.apellido,
          calificacion: mockConductor.calificacion,
          viajes: pluralViajes(mockConductor.totalViajes),
          placa: vehiculo.placa,
          vehiculo: `${vehiculo.marca} ${vehiculo.modelo}`,
          vehiculoDetalle: `${vehiculo.color} · ${vehiculo.anio}`,
        }}
        onPerfil={() => nav('Cuenta')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  center: { textAlign: 'center' },

  topBar: {
    position: 'absolute',
    left: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  tablero: {
    position: 'absolute',
    left: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: Hit.min,
    paddingLeft: 14,
    paddingRight: Spacing.sm,
    borderRadius: BorderRadius.full,
    ...Shadow.raise,
  },
  tableroBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  earnWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  earnText: { ...Type.small, fontWeight: Weight.regular },
  earnBold: { fontWeight: Weight.bold },

  panel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: BorderRadius.sheet,
    borderTopRightRadius: BorderRadius.sheet,
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    ...Shadow.sheet,
  },
  panelBody: { gap: 14 },
  panelBodyTop: { gap: Spacing.xs, paddingTop: 14 },
  hRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm + 2,
  },
  veh: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    minHeight: Hit.min,
  },
  vehName: { fontWeight: Weight.semibold },
  link: { textDecorationLine: 'underline' },
});
