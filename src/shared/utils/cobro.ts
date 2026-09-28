/** Desglose de un viaje en centimos para evitar errores de redondeo (18.50 * 15 % = 2.78). */
export function desgloseCobro(tarifa: number, comision: number) {
  const tarifaCent = Math.round(tarifa * 100);
  const comisionCent = Math.round(tarifaCent * comision);
  return {
    tarifa: tarifaCent / 100,
    comision: comisionCent / 100,
    ganancia: (tarifaCent - comisionCent) / 100,
  };
}

export const esEfectivo = (metodo: string) => metodo.trim().toLowerCase() === 'efectivo';

/** "Av. La Encalada 1388, Surco" -> "Surco". */
export function distritoDe(direccion: string): string {
  const partes = direccion.split(',');
  return partes[partes.length - 1].trim();
}
