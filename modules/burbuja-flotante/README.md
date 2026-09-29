# burbuja-flotante

Burbuja flotante tipo "chat head" para **Android**: se dibuja sobre cualquier app y, al tocarla, trae Run Pilot al frente. Es un módulo local de Expo (Expo Modules API, Kotlin) dentro de este proyecto; más adelante puede pasar a un paquete propio.

Es el port a React Native del plugin de Flutter [`floating_bubble_overlay`](https://github.com/VMichael1999/floating_bubble_overlay), **reimplementado** con las APIs de Android (WindowManager y un servicio en primer plano). No usa código de `dash_bubble` ni la librería `Floating-Bubble-View`.

iOS no permite dibujar sobre otras apps: en iOS, web y **Expo Go** el módulo no existe y la API de JS no hace nada.

## Flujo en Run Pilot

```
Instala e inicia sesión
  └─ Inicio (Android, primera vez): tras el permiso de ubicación → "No te pierdas ningún viaje"
       ├─ "Activar burbuja" → Ajustes "Mostrar sobre otras apps" → vuelve → "Burbuja activada"
       └─ "Ahora no" → no se vuelve a ofrecer sola (queda en Configuración)

Conectarme → se pide el permiso de notificaciones (Android 13+ / iOS)

Conectado (con o sin viaje) y sales a otra app (Waze, Maps, WhatsApp…)
  ├─ Aparece la burbuja + notificación fija "Conectado · buscando viajes" o "Viaje en curso"
  ├─ Tocar la burbuja → vuelves a Run Pilot → la burbuja se va
  └─ Arrastrarla a la X → se cierra hasta la próxima salida

Llega una solicitud estando en otra app
  ├─ Notificación con sonido "Nueva solicitud de viaje · S/ 18.50 · Efectivo · Carlos"   (switch "Nuevas solicitudes")
  ├─ Android: Run Pilot se abre solo en la solicitud   (switch "Abrir Run Pilot al recibir un viaje" + permiso de la burbuja)
  ├─ Tocar la notificación → Run Pilot en la solicitud
  └─ Aceptada, rechazada o expirada → la notificación se quita

Desconectarme → la burbuja no vuelve a aparecer
```

Las reglas están en `src/features/conductor/burbuja/reglas.ts` (`accionBurbuja`) y `src/features/conductor/avisos/reglas.ts` (`reaccionSolicitud`).

**Límite actual:** las solicitudes las simula la propia app. En Android llegan en segundo plano porque el servicio mantiene viva la app. En iOS la app se suspende en segundo plano, así que hace falta un servidor que envíe push (APNs/FCM). Cuando exista, el push debe llamar a la misma lógica.

## API (JS)

```ts
import { BurbujaFlotante } from '@modules/burbuja-flotante';

BurbujaFlotante.disponible;            // false en iOS, web y Expo Go
BurbujaFlotante.tienePermiso();        // "Mostrar sobre otras apps"
BurbujaFlotante.abrirAjustesPermiso(); // abre esa pantalla del sistema
BurbujaFlotante.mostrar({ tamano: 60, tituloNotificacion: 'Viaje en curso' }); // false sin permiso
BurbujaFlotante.ocultar();
BurbujaFlotante.estaVisible();
BurbujaFlotante.abrirApp();             // trae la app al frente desde segundo plano (mismo permiso)
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
| `BurbujaManager.kt` | Mostrar/ocultar desde cualquier hilo; `abrirApp` (al tocar o al llegar un viaje) |
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
