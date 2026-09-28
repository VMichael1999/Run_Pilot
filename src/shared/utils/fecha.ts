const DIAS_CORTOS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];
const DIA_MS = 86_400_000;

const pad = (n: number) => String(n).padStart(2, '0');

export function hora(ms: number): string {
  const d = new Date(ms);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function inicioDia(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** "Hoy 22:44", "Ayer 08:10", "vie 25 sep". */
export function fechaCorta(ms: number, ahora = Date.now()): string {
  const dias = Math.round((inicioDia(ahora) - inicioDia(ms)) / DIA_MS);
  if (dias === 0) return `Hoy ${hora(ms)}`;
  if (dias === 1) return `Ayer ${hora(ms)}`;
  const d = new Date(ms);
  return `${DIAS_CORTOS[d.getDay()]} ${d.getDate()} ${MESES[d.getMonth()].slice(0, 3)}`;
}

/** Nombre del mes con mayuscula inicial: "Septiembre". */
export function nombreMes(ms = Date.now()): string {
  const m = MESES[new Date(ms).getMonth()];
  return m.charAt(0).toUpperCase() + m.slice(1);
}

/** Indice de hoy en una semana que empieza el lunes (0 = lunes ... 6 = domingo). */
export function indiceLunes(ms = Date.now()): number {
  return (new Date(ms).getDay() + 6) % 7;
}

/** "Semana del 21 al 27 de septiembre" o "Semana del 29 de septiembre al 5 de octubre". */
export function rangoSemana(ms = Date.now()): string {
  const lunes = new Date(inicioDia(ms) - indiceLunes(ms) * DIA_MS);
  const domingo = new Date(lunes.getTime() + 6 * DIA_MS);
  const mismoMes = lunes.getMonth() === domingo.getMonth();
  return mismoMes
    ? `Semana del ${lunes.getDate()} al ${domingo.getDate()} de ${MESES[domingo.getMonth()]}`
    : `Semana del ${lunes.getDate()} de ${MESES[lunes.getMonth()]} al ${domingo.getDate()} de ${MESES[domingo.getMonth()]}`;
}

const DIAS_LARGOS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

/** Titulo de un grupo de dias: "Hoy", "Ayer", "Viernes 25 de septiembre". */
export function tituloDia(ms: number, ahora = Date.now()): string {
  const dias = Math.round((inicioDia(ahora) - inicioDia(ms)) / DIA_MS);
  if (dias === 0) return 'Hoy';
  if (dias === 1) return 'Ayer';
  const d = new Date(ms);
  return `${DIAS_LARGOS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}`;
}

/** Clave de dia local (para agrupar). */
export function claveDia(ms: number): number {
  return inicioDia(ms);
}
