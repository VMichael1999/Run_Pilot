# burbuja-flotante

Burbuja flotante tipo "chat head" para **Android**: se dibuja sobre cualquier app y, al tocarla, trae Run Pilot al frente. Es un módulo local de Expo (Expo Modules API, Kotlin) dentro de este proyecto; más adelante puede pasar a un paquete propio.

Es el port a React Native del plugin de Flutter [`floating_bubble_overlay`](https://github.com/VMichael1999/floating_bubble_overlay), **reimplementado** con las APIs de Android (WindowManager y un servicio en primer plano). No usa código de `dash_bubble` ni la librería `Floating-Bubble-View`.

iOS no permite dibujar sobre otras apps: en iOS, web y **Expo Go** el módulo no existe y la API de JS no hace nada.

## Flujo en Run Pilot

```
Instala e inicia sesión
  └─ Inicio (Android, primera vez): tras el permiso de ubicación → pantalla "Vuelve a tu viaje con un toque"
       ├─ "Activar burbuja" → Ajustes del sistema "Mostrar sobre otras apps" → vuelve → "Burbuja activada"
       └─ "Ahora no" → no se vuelve a ofrecer sola (queda en Configuración › Viaje)

Viaje en curso (aceptado → … → cobrar)
  ├─ La app pasa a segundo plano (Waze, Maps, WhatsApp, llamada…) → aparece la burbuja
  │    + notificación "Viaje en curso · Toca para volver a Run Pilot"
  ├─ Tocar la burbuja → abre Run Pilot en el mismo punto del viaje → la burbuja se va
  ├─ Arrastrarla → aparece una X abajo; soltarla encima → se cierra hasta la próxima salida
  └─ Volver a la app por cualquier otro camino → la burbuja se va

Sin viaje en curso, o sin permiso → nunca aparece
Viaje finalizado o cancelado → se oculta
Cerrar la app desde recientes → se oculta
```

La regla está en `src/features/conductor/burbuja/reglas.ts` (`accionBurbuja`) y se aplica en `useBurbujaViaje`, montado en `ConductorNavigator`.

## API (JS)

```ts
import { BurbujaFlotante } from '@modules/burbuja-flotante';

BurbujaFlotante.disponible;            // false en iOS, web y Expo Go
BurbujaFlotante.tienePermiso();        // "Mostrar sobre otras apps"
BurbujaFlotante.abrirAjustesPermiso(); // abre esa pantalla del sistema
BurbujaFlotante.mostrar({ tamano: 60, tituloNotificacion: 'Viaje en curso' }); // false sin permiso
BurbujaFlotante.ocultar();
BurbujaFlotante.estaVisible();
const sub = BurbujaFlotante.alTocar(() => {});   // también alCerrar(); sub.remove()
```

| Opción | Por defecto | Notas |
|---|---|---|
| `tamano` | 60 | dp, de 40 a 96 |
| `opacidad` | 1 | de 0.2 a 1 |
| `icono` | ícono de la app | nombre de un drawable/mipmap nativo |
| `distanciaCerrar` | 96 | dp desde la X para cerrar al soltar |
| `pegarAlBorde` | true | al soltar va al borde lateral más cercano |
| `x`, `y` | borde derecho, 1/3 de la altura | dp |
| `tituloNotificacion`, `textoNotificacion` | nombre de la app / "Toca para volver a tu viaje" | notificación del servicio |

## Piezas nativas

| Archivo | Qué hace |
|---|---|
| `BurbujaFlotanteModule.kt` | Puente con JS (funciones y eventos `onTocar`, `onCerrar`) |
| `BurbujaManager.kt` | Mostrar/ocultar desde cualquier hilo; abre la app al tocar |
| `BurbujaVista.kt` | Ventanas superpuestas: burbuja, gestos, pegar al borde, X de cierre |
| `BurbujaServicio.kt` | Servicio en primer plano (`specialUse`) con la notificación |
| `AndroidManifest.xml` | Permisos y servicio; se fusiona solo en la app |

Orden importante: primero se agrega la ventana y después se inicia el servicio. Android 15 solo deja iniciar un servicio en primer plano desde segundo plano si la app ya tiene una ventana superpuesta visible. Si Android no lo permite, la burbuja sigue funcionando sin el servicio.

## Probarlo

Necesita un **development build** (Expo Go no incluye código nativo propio):

```bash
npx expo run:android        # requiere Android SDK; o: eas build -p android --profile development
```

1. Inicia sesión: aparece la pantalla de la burbuja → "Activar burbuja" → activa Run Pilot → vuelve.
2. Conéctate y acepta un viaje.
3. Sal a otra app: aparece la burbuja. Tócala: vuelves al viaje.
4. Sal de nuevo, arrastra la burbuja a la X: se cierra.

## Google Play

- `SYSTEM_ALERT_WINDOW` y el servicio `specialUse` se declaran en Play Console con su justificación (el texto está en el manifest).
- Algunas capas de fabricante (p. ej. MIUI de Xiaomi) tienen un permiso extra, "Mostrar ventanas emergentes en segundo plano", que el conductor debe activar a mano.
