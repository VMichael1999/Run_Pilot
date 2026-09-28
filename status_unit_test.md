# Estado de pruebas unitarias

| Modulo | Archivo de test | Estado |
|--------|----------------|--------|
| Type (letra del sistema, pesos por rol) | src/theme/__tests__/fonts.test.ts | 3 tests, en verde |
| ThemeColors (roles y contraste) | src/theme/__tests__/colors.test.ts | 27 tests, en verde |
| useConductorStore (fases, espera, finalizar, ganancia neta, vehículo, cancelar) | src/store/__tests__/useConductorStore.test.ts | 6 tests, en verde |
| Cancelar viaje (motivos, espera mínima para "no se presentó", tasa) | src/features/conductor/viaje/__tests__/cancelacion.test.ts | 4 tests, en verde |
| Aviso "Viaje cancelado" en el inicio | src/features/conductor/home/__tests__/ConductorHomeScreen.test.tsx | 2 tests, en verde |
| Saldo de la billetera (viajes de la sesión) | src/features/conductor/billetera/__tests__/saldo.test.ts | 2 tests, en verde |
| Viaje en curso en el inicio (textos por fase, franja, contador) | src/features/conductor/home/__tests__/viajeEnCurso.test.ts + ConductorHomeScreen.test.tsx | 7 + 3 tests, en verde |
| useAuthStore | pendiente | sin tests (cubierto indirectamente por Login y Cuenta) |
| useThemeStore | src/store/__tests__/useThemeStore.test.ts | 5 tests, en verde |
| ConductorHomeScreen | src/features/conductor/home/__tests__/ConductorHomeScreen.test.tsx | 3 tests (render), en verde |
| IncomingRequestOverlay | src/features/conductor/home/__tests__/IncomingRequestOverlay.test.tsx | 4 tests (render, rechazar, aceptar accesible, expira), en verde |
| PanelPago (efectivo, digital, otro método) | src/features/conductor/viaje/__tests__/PanelPago.test.tsx | 3 tests, en verde |
| cobro (desglose, distrito, efectivo) | src/shared/utils/__tests__/cobro.test.ts | 6 tests, en verde |
| geo (distancia, restante, formato) | src/shared/utils/__tests__/geo.test.ts | 11 tests, en verde |
| ViajeScreen (fases deslizables, panel del pasajero, SOS, llamar, fuga de GPS, cancelar viaje) | src/features/conductor/viaje/__tests__/ViajeScreen.test.tsx | 18 tests, en verde |
| format (soles, viajes, tiempo) | src/shared/utils/__tests__/format.test.ts | 9 tests, en verde |
| CalificarScreen (estrellas, etiquetas, enviar, omitir, desde historial) | src/features/conductor/calificar/__tests__/CalificarScreen.test.tsx | 5 tests, en verde |
| HistorialViaje + HistorialDetalle | src/features/conductor/historial/__tests__/HistorialViajeScreen.test.tsx | 5 tests, en verde |
| agrupar historial por día | src/features/conductor/historial/__tests__/agrupar.test.ts | 1 test, en verde |
| LoginScreen + LoginVerificacionScreen | src/features/auth/__tests__/Login.test.tsx | 4 tests, en verde |
| Solicitudes + SolicitudDetalle + ServiciosProgramados | src/features/conductor/solicitudes/__tests__/SolicitudesScreen.test.tsx | 3 tests, en verde |
| IngresosScreen + BilleteraScreen | src/features/conductor/ingresos/__tests__/IngresosScreen.test.tsx | 5 tests, en verde |
| resumen de ingresos (hoy, semana, mes) | src/features/conductor/ingresos/__tests__/resumen.test.ts | 4 tests, en verde |
| fecha (hoy/ayer, semana, mes, título de día) | src/shared/utils/__tests__/fecha.test.ts | 5 tests, en verde |
| Cuenta, Configuración, Vehículo, Experiencia, menú lateral | src/features/conductor/cuenta/__tests__/CuentaYMenu.test.tsx | 7 tests, en verde |
| Recargar + Retirar (monto por defecto, logos, validación, opciones, resultado) | src/features/conductor/billetera/__tests__/RecargarRetirar.test.tsx | 12 tests, en verde |
| RoutePolyline + useMapStyle (colores de ruta, bug iOS, mapa noche) | src/shared/components/map/__tests__/RoutePolyline.test.tsx | 5 tests, en verde |
| Catálogo de componentes (solo desarrollo) | src/features/dev/__tests__/CatalogoScreen.test.tsx | 1 test (render), en verde |

> Actualizar este archivo cada vez que se agregen o completen tests.
