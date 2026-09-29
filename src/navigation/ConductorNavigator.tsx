import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ConductorStackParamList } from './types';
import { ConductorHomeScreen } from '@features/conductor/home/ConductorHomeScreen';
import { SolicitudesScreen } from '@features/conductor/solicitudes/SolicitudesScreen';
import { SolicitudDetalleScreen } from '@features/conductor/solicitud-detalle/SolicitudDetalleScreen';
import { ViajeScreen } from '@features/conductor/viaje/ViajeScreen';
import { CalificarScreen } from '@features/conductor/calificar/CalificarScreen';
import { IngresosScreen } from '@features/conductor/ingresos/IngresosScreen';
import { ExperienciaScreen } from '@features/conductor/experiencia/ExperienciaScreen';
import { CuentaScreen } from '@features/conductor/cuenta/CuentaScreen';
import { HistorialViajeScreen } from '@features/conductor/historial/HistorialViajeScreen';
import { HistorialDetalleScreen } from '@features/conductor/historial/HistorialDetalleScreen';
import { ConfiguracionScreen } from '@features/conductor/configuracion/ConfiguracionScreen';
import { BilleteraScreen } from '@features/conductor/billetera/BilleteraScreen';
import { RecargarScreen } from '@features/conductor/billetera/RecargarScreen';
import { RetirarScreen } from '@features/conductor/billetera/RetirarScreen';
import { ServiciosProgramadosScreen } from '@features/conductor/servicios-programados/ServiciosProgramadosScreen';
import { SeleccionarVehiculoScreen } from '@features/conductor/vehiculo/SeleccionarVehiculoScreen';
import { CatalogoScreen } from '@features/dev/CatalogoScreen';
import { PermisoBurbujaScreen } from '@features/conductor/burbuja/PermisoBurbujaScreen';
import { useBurbujaConductor } from '@features/conductor/burbuja/useBurbujaConductor';
import { usePreferenciasStore } from '@store/usePreferenciasStore';

const Stack = createNativeStackNavigator<ConductorStackParamList>();

export function ConductorNavigator() {
  // Burbuja para volver a la app cuando pasa a segundo plano estando conectado (Android)
  useBurbujaConductor();

  // Switches de Configuracion guardados en el telefono
  useEffect(() => {
    void usePreferenciasStore.getState().cargar();
  }, []);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ConductorHome"        component={ConductorHomeScreen} />
      <Stack.Screen name="Solicitudes"          component={SolicitudesScreen} />
      <Stack.Screen name="SolicitudDetalle"     component={SolicitudDetalleScreen} />
      <Stack.Screen name="Viaje"                component={ViajeScreen} />
      <Stack.Screen name="Calificar"            component={CalificarScreen} />
      <Stack.Screen name="Ingresos"             component={IngresosScreen} />
      <Stack.Screen name="Experiencia"          component={ExperienciaScreen} />
      <Stack.Screen name="Cuenta"               component={CuentaScreen} />
      <Stack.Screen name="HistorialViaje"        component={HistorialViajeScreen} />
      <Stack.Screen name="HistorialDetalle"     component={HistorialDetalleScreen} />
      <Stack.Screen name="Configuracion"        component={ConfiguracionScreen} />
      <Stack.Screen name="Billetera"            component={BilleteraScreen} />
      <Stack.Screen name="Recargar"             component={RecargarScreen} />
      <Stack.Screen name="Retirar"              component={RetirarScreen} />
      <Stack.Screen name="ServiciosProgramados" component={ServiciosProgramadosScreen} />
      <Stack.Screen name="SeleccionarVehiculo"  component={SeleccionarVehiculoScreen} />
      <Stack.Screen name="PermisoBurbuja"       component={PermisoBurbujaScreen} />
      {__DEV__ && <Stack.Screen name="Catalogo" component={CatalogoScreen} />}
    </Stack.Navigator>
  );
}
