import { Alert } from 'react-native';

/** Cerrar sesion pide confirmacion: sacaria al conductor en medio de su jornada. */
export function confirmarCerrarSesion(logout: () => void) {
  Alert.alert('¿Cerrar sesión?', 'Dejarás de recibir solicitudes hasta que vuelvas a ingresar.', [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Cerrar sesión', style: 'destructive', onPress: logout },
  ]);
}
