import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  ConductorApp: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  LoginVerificacion: { phone: string; countryCode: string };
};

export type ConductorStackParamList = {
  ConductorHome: undefined;
  Solicitudes: undefined;
  SolicitudDetalle: { solicitudId: string };
  Viaje: { solicitudId: string };
  Calificar: { solicitudId: string };
  Chat: { userId: string; userName: string };
  Ingresos: undefined;
  Experiencia: undefined;
  Cuenta: undefined;
  HistorialViaje: undefined;
  HistorialDetalle: { viajeId: string };
  Configuracion: undefined;
  Billetera: undefined;
  ServiciosProgramados: undefined;
  SeleccionarVehiculo: undefined;
};

export type LoginProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;
export type LoginVerificacionProps = NativeStackScreenProps<AuthStackParamList, 'LoginVerificacion'>;
export type ConductorHomeProps = NativeStackScreenProps<ConductorStackParamList, 'ConductorHome'>;

