import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { Solicitud } from '../types';
import { BurbujaFlotante } from '@modules/burbuja-flotante';
import { usePreferenciasStore } from '@store/usePreferenciasStore';
import { reaccionSolicitud } from './reglas';
import { avisarSolicitud, quitarAviso } from './notificaciones';

/**
 * Cuando llega una solicitud con la app en segundo plano: notificacion y, si el conductor
 * lo eligio (solo Android), la app se abre sola. [mostrar] lleva a la pantalla de la
 * solicitud al tocar el aviso o al volver a la app.
 */
export function useAvisoSolicitudes(solicitud: Solicitud | null, mostrar: () => void) {
  const avisos = usePreferenciasStore((s) => s.avisosSolicitudes);
  const abrirAlRecibir = usePreferenciasStore((s) => s.abrirAlRecibir);
  const prefs = useRef({ avisos, abrirAlRecibir });
  prefs.current = { avisos, abrirAlRecibir };
  const pendiente = useRef(solicitud);
  pendiente.current = solicitud;
  const mostrarRef = useRef(mostrar);
  mostrarRef.current = mostrar;
  const idAviso = useRef<string | null>(null);

  // Cada solicitud nueva; al aceptarse, rechazarse o expirar se quita su aviso
  useEffect(() => {
    if (!solicitud) return;
    const r = reaccionSolicitud({
      estadoApp: AppState.currentState,
      ...prefs.current,
      puedeAbrir: BurbujaFlotante.disponible && BurbujaFlotante.tienePermiso(),
    });
    let resuelta = false;
    if (r.notificar) {
      void avisarSolicitud(solicitud).then((id) => {
        if (resuelta) void quitarAviso(id);
        else idAviso.current = id;
      });
    }
    if (r.abrir) BurbujaFlotante.abrirApp();
    return () => {
      resuelta = true;
      void quitarAviso(idAviso.current);
      idAviso.current = null;
    };
  }, [solicitud]);

  useEffect(() => {
    // Tocar el aviso abre la app: llevar a la solicitud
    const alTocar = Notifications.addNotificationResponseReceivedListener((resp) => {
      const data = resp.notification.request.content.data as { tipo?: string } | undefined;
      if (data?.tipo === 'solicitud') mostrarRef.current();
    });
    // Volver a la app (sola o por cualquier camino) con una solicitud pendiente
    const alVolver = AppState.addEventListener('change', (estado) => {
      if (estado !== 'active' || !pendiente.current) return;
      void quitarAviso(idAviso.current);
      idAviso.current = null;
      mostrarRef.current();
    });
    return () => {
      alTocar.remove();
      alVolver.remove();
    };
  }, []);
}
