import { Platform } from 'react-native';
import { NativeModule, requireOptionalNativeModule } from 'expo';

/** Opciones de la burbuja (todas opcionales). Tamaños y posiciones en dp. */
export interface OpcionesBurbuja {
  /** Diámetro, de 40 a 96. Por defecto 60. */
  tamano?: number;
  /** De 0.2 a 1. Por defecto 1. */
  opacidad?: number;
  /** Nombre de un drawable/mipmap nativo; por defecto el ícono de la app. */
  icono?: string;
  /** Qué tan cerca de la X hay que soltarla para cerrarla. Por defecto 96. */
  distanciaCerrar?: number;
  /** Al soltarla se pega al borde lateral más cercano. Por defecto true. */
  pegarAlBorde?: boolean;
  /** Posición inicial; por defecto borde derecho, a un tercio de la altura. */
  x?: number;
  y?: number;
  /** Notificación del servicio que mantiene viva la app mientras se ve la burbuja. */
  tituloNotificacion?: string;
  textoNotificacion?: string;
}

type Eventos = {
  /** Se tocó la burbuja: la app ya se está abriendo y la burbuja se ocultó. */
  onTocar: () => void;
  /** El conductor la arrastró a la X. */
  onCerrar: () => void;
};

declare class BurbujaFlotanteNativo extends NativeModule<Eventos> {
  tienePermiso(): boolean;
  abrirAjustesPermiso(): void;
  mostrar(opciones: OpcionesBurbuja): boolean;
  mantenerActiva(opciones: OpcionesBurbuja): void;
  soltarActiva(): void;
  ocultar(): void;
  abrirApp(): boolean;
  programarApertura(segundos: number): void;
  cancelarApertura(): void;
  estaVisible(): boolean;
}

// Solo existe en Android con un development build; en iOS, web y Expo Go es null.
const nativo = Platform.OS === 'android'
  ? requireOptionalNativeModule<BurbujaFlotanteNativo>('BurbujaFlotante')
  : null;

const sinSuscripcion = { remove() {} };

/**
 * Burbuja flotante sobre otras apps (solo Android). Tocarla trae la app al frente.
 * Donde no está disponible, todo es un no-op seguro.
 */
export const BurbujaFlotante = {
  /** false en iOS, web y Expo Go. */
  disponible: nativo != null,

  /** Permiso "Mostrar sobre otras apps". */
  tienePermiso: (): boolean => nativo?.tienePermiso() ?? false,

  /** Abre la pantalla del sistema para conceder el permiso. */
  abrirAjustesPermiso: (): void => nativo?.abrirAjustesPermiso(),

  /** @returns false si no está disponible o falta el permiso. */
  mostrar: (opciones: OpcionesBurbuja = {}): boolean => nativo?.mostrar(opciones) ?? false,

  ocultar: (): void => nativo?.ocultar(),

  /**
   * Mantiene la app viva en segundo plano (servicio en primer plano) sin burbuja ni permiso.
   * Llamar con la app en pantalla. Usa `tituloNotificacion` / `textoNotificacion`.
   */
  mantenerActiva: (opciones: OpcionesBurbuja = {}): void => nativo?.mantenerActiva?.(opciones),

  /** Deja de mantenerla viva (p. ej. al desconectarse). */
  soltarActiva: (): void => nativo?.soltarActiva?.(),

  estaVisible: (): boolean => nativo?.estaVisible() ?? false,

  /**
   * Trae la app al frente desde segundo plano (p. ej. al llegar una solicitud).
   * Requiere el mismo permiso que la burbuja. @returns false si no se pudo.
   */
  abrirApp: (): boolean => nativo?.abrirApp() ?? false,

  /**
   * Programa la apertura automática de la app tras N segundos usando un temporizador nativo.
   * Funciona incluso si React Native está pausado en segundo plano.
   */
  programarApertura: (segundos: number): void => nativo?.programarApertura?.(segundos),

  /** Cancela cualquier apertura diferida programada previamente. */
  cancelarApertura: (): void => nativo?.cancelarApertura?.(),

  alTocar: (cb: () => void) => nativo?.addListener('onTocar', cb) ?? sinSuscripcion,

  alCerrar: (cb: () => void) => nativo?.addListener('onCerrar', cb) ?? sinSuscripcion,
};
