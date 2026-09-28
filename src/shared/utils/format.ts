/** Monto en soles al estilo peruano: "S/ 1,284.40". Sin depender de Intl (Hermes). */
function miles(entero: string): string {
  return entero.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function formatSoles(monto: number, simbolo = 'S/'): string {
  const [entero, dec] = Math.abs(monto).toFixed(2).split('.');
  return `${monto < 0 ? '− ' : ''}${simbolo} ${miles(entero)}.${dec}`;
}

/** "1 viaje" / "6 viajes". */
export function pluralViajes(n: number): string {
  return `${miles(String(n))} ${n === 1 ? 'viaje' : 'viajes'}`;
}

/** "hace un momento", "hace 3 min", "hace 1 h", "hace 2 días". */
export function haceTiempo(desdeMs: number, ahoraMs = Date.now()): string {
  const min = Math.floor((ahoraMs - desdeMs) / 60_000);
  if (min < 1) return 'hace un momento';
  if (min < 60) return `hace ${min} min`;
  if (min < 24 * 60) return `hace ${Math.floor(min / 60)} h`;
  const dias = Math.floor(min / (24 * 60));
  return `hace ${dias} ${dias === 1 ? 'día' : 'días'}`;
}

export function inicioDelDia(ahoraMs = Date.now()): number {
  const d = new Date(ahoraMs);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** "+51 987 654 321" (celulares peruanos de 9 digitos en grupos de 3). */
export function formatTelefono(numero: string, codigo = '+51'): string {
  const digitos = numero.replace(/\D/g, '');
  if (!digitos) return '';
  return `${codigo} ${digitos.replace(/(\d{3})(?=\d)/g, '$1 ')}`.trim();
}
